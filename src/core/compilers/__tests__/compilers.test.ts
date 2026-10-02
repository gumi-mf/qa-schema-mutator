import { describe, it, expect } from 'vitest';
import { executeMutationEngine } from '../../mutators/mutationEngine';
import { DEFAULT_RULE_SELECTION } from '../../mutators/ruleRegistry';
import { SAMPLE_APIS } from '@/templates/sampleApis';
import { compilePostmanCollection } from '../postmanCompiler';
import { compilePlaywrightSuite } from '../playwrightCompiler';

describe('Postman v2.1 Collection Synthesizer', () => {
  const userApi = SAMPLE_APIS[0];
  const suite = executeMutationEngine({
    schema: userApi.schema,
    baselinePayload: userApi.payload,
    rules: DEFAULT_RULE_SELECTION,
    endpoint: userApi.endpoint,
    postmanCompiler: compilePostmanCollection,
    playwrightCompiler: compilePlaywrightSuite,
  });

  it('compiles valid Postman collection JSON', () => {
    expect(suite.postmanCollectionJson).toBeDefined();
    const parsed = JSON.parse(suite.postmanCollectionJson);

    expect(parsed.info.schema).toBe('https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
    expect(parsed.item).toBeInstanceOf(Array);
    expect(parsed.item.length).toBeGreaterThanOrEqual(2); // Baseline + category folders
  });

  it('generates pm.test assertions in postman items', () => {
    const parsed = JSON.parse(suite.postmanCollectionJson);
    const baselineFolder = parsed.item.find((folder: any) => folder.name.includes('Baseline'));
    expect(baselineFolder).toBeDefined();

    const baselineItem = baselineFolder.item[0];
    const testScript = baselineItem.event[0].script.exec.join('\n');
    expect(testScript).toContain('pm.test("Status code is 200 or 201');
    expect(testScript).toContain('pm.expect(pm.response.code).to.be.oneOf([200, 201])');
  });
});

describe('Playwright API Suite Synthesizer', () => {
  const userApi = SAMPLE_APIS[0];
  const suite = executeMutationEngine({
    schema: userApi.schema,
    baselinePayload: userApi.payload,
    rules: DEFAULT_RULE_SELECTION,
    endpoint: userApi.endpoint,
    playwrightCompiler: compilePlaywrightSuite,
  });

  it('compiles clean runnable TypeScript code with @playwright/test imports', () => {
    const code = suite.playwrightSpecCode;
    expect(code).toContain("import { test, expect } from '@playwright/test';");
    expect(code).toContain("test.describe('Create User Automated Verification Suite'");
    expect(code).toContain("test.describe('00 - Baseline (Happy Path)'");
    expect(code).toContain("test.describe('01 - Boundary Limit Violations'");
    expect(code).toContain("expect([400, 422]).toContain(response.status())");
    expect(code).toContain("expect(response.status()).not.toBe(500)");
  });
});
