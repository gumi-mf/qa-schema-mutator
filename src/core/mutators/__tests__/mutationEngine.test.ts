import { describe, it, expect } from 'vitest';
import { executeMutationEngine } from '../mutationEngine';
import { SAMPLE_APIS } from '@/templates/sampleApis';
import { DEFAULT_RULE_SELECTION } from '../ruleRegistry';
import { getValueAtPointer, setValueAtPointer, deleteValueAtPointer } from '@/core/schema/jsonPointer';
import { parseSchemaFields } from '@/core/schema/schemaParser';

describe('JSON Pointer Utilities', () => {
  const sample = {
    user: {
      profile: {
        bio: 'Hello world',
        scores: [10, 20, 30],
      },
    },
  };

  it('correctly retrieves values by pointer', () => {
    expect(getValueAtPointer(sample, '/user/profile/bio')).toBe('Hello world');
    expect(getValueAtPointer(sample, '/user/profile/scores/1')).toBe(20);
    expect(getValueAtPointer(sample, '/user/unknown')).toBeUndefined();
  });

  it('immutably sets values at pointer without mutating original', () => {
    const updated = setValueAtPointer(sample, '/user/profile/bio', 'New Bio');
    expect(getValueAtPointer(updated, '/user/profile/bio')).toBe('New Bio');
    expect(getValueAtPointer(sample, '/user/profile/bio')).toBe('Hello world');
  });

  it('immutably deletes property at pointer without mutating original', () => {
    const deleted = deleteValueAtPointer(sample, '/user/profile/bio');
    expect(getValueAtPointer(deleted, '/user/profile/bio')).toBeUndefined();
    expect(getValueAtPointer(sample, '/user/profile/bio')).toBe('Hello world');
  });
});

describe('Schema Parser', () => {
  it('parses schema properties, types, and constraints correctly', () => {
    const userApi = SAMPLE_APIS[0];
    const parsed = parseSchemaFields(userApi.schema, userApi.payload);

    expect(parsed.fields.length).toBeGreaterThan(5);

    const usernameField = parsed.fields.find((f) => f.pointer === '/username');
    expect(usernameField).toBeDefined();
    expect(usernameField?.isRequired).toBe(true);
    expect(usernameField?.type).toBe('string');
    expect(usernameField?.schema.minLength).toBe(3);
    expect(usernameField?.schema.maxLength).toBe(20);

    const ageField = parsed.fields.find((f) => f.pointer === '/age');
    expect(ageField).toBeDefined();
    expect(ageField?.type).toBe('integer');
    expect(ageField?.schema.minimum).toBe(18);
    expect(ageField?.schema.maximum).toBe(120);
  });
});

describe('Master Mutation Engine', () => {
  const userApi = SAMPLE_APIS[0];

  it('generates test vectors across all 4 categories for User Registration API', () => {
    const suite = executeMutationEngine({
      schema: userApi.schema,
      baselinePayload: userApi.payload,
      rules: DEFAULT_RULE_SELECTION,
      endpoint: userApi.endpoint,
    });

    expect(suite.baselineVector).toBeDefined();
    expect(suite.baselineVector.expectedStatus).toBe(201); // POST endpoint expects 201
    expect(suite.vectors.length).toBeGreaterThan(15);

    // Verify boundary category vectors exist
    const boundaryVectors = suite.vectors.filter((v) => v.category === 'boundary');
    expect(boundaryVectors.length).toBeGreaterThan(0);
    // Age minimum boundary (17 < 18)
    const ageUnderflow = boundaryVectors.find((v) => v.fieldPointer === '/age' && v.ruleId === 'numericMinMinusOne');
    expect(ageUnderflow).toBeDefined();
    expect(ageUnderflow?.mutatedValue).toBe(17);
    expect(getValueAtPointer(ageUnderflow?.mutatedPayload, '/age')).toBe(17);

    // Verify nullability category vectors exist
    const nullVectors = suite.vectors.filter((v) => v.category === 'nullability');
    expect(nullVectors.length).toBeGreaterThan(0);
    // Required field omission
    const usernameOmit = nullVectors.find((v) => v.fieldPointer === '/username' && v.ruleId === 'omitRequiredFields');
    expect(usernameOmit).toBeDefined();
    expect(getValueAtPointer(usernameOmit?.mutatedPayload, '/username')).toBeUndefined();

    // Verify type mismatch category vectors exist
    const typeMismatchVectors = suite.vectors.filter((v) => v.category === 'type_mismatch');
    expect(typeMismatchVectors.length).toBeGreaterThan(0);
    // String to integer
    const stringToInt = typeMismatchVectors.find((v) => v.fieldPointer === '/username' && v.ruleId === 'stringToInteger');
    expect(stringToInt).toBeDefined();
    expect(typeof getValueAtPointer(stringToInt?.mutatedPayload, '/username')).toBe('number');

    // Verify unicode & fuzz vectors exist
    const fuzzVectors = suite.vectors.filter((v) => v.category === 'unicode_fuzz');
    expect(fuzzVectors.length).toBeGreaterThan(0);
    // SQLi and XSS
    const sqli = fuzzVectors.find((v) => v.fieldPointer === '/username' && v.ruleId === 'sqlInjectionPatterns');
    expect(sqli).toBeDefined();
    expect(sqli?.mutatedValue).toContain("' OR '1'='1'");
  });

  it('respects rule toggles when individual rules are disabled', () => {
    const disabledRules = {
      ...DEFAULT_RULE_SELECTION,
      sqlInjectionPatterns: false,
      omitRequiredFields: false,
    };

    const suite = executeMutationEngine({
      schema: userApi.schema,
      baselinePayload: userApi.payload,
      rules: disabledRules,
      endpoint: userApi.endpoint,
    });

    const sqliVectors = suite.vectors.filter((v) => v.ruleId === 'sqlInjectionPatterns');
    expect(sqliVectors.length).toBe(0);

    const omitVectors = suite.vectors.filter((v) => v.ruleId === 'omitRequiredFields');
    expect(omitVectors.length).toBe(0);
  });

  it('runs successfully on Payment Checkout API with nested objects and arrays', () => {
    const paymentApi = SAMPLE_APIS[1];
    const suite = executeMutationEngine({
      schema: paymentApi.schema,
      baselinePayload: paymentApi.payload,
      rules: DEFAULT_RULE_SELECTION,
      endpoint: paymentApi.endpoint,
    });

    expect(suite.vectors.length).toBeGreaterThan(10);
    expect(suite.summary.totalVectors).toBe(suite.vectors.length);
    expect(suite.summary.byCategory.boundary).toBeGreaterThan(0);
  });
});
