import { MutationResult, RuleSelectionState } from '../types';
import { SchemaFieldDescriptor } from '../schema/schemaParser';
import { setValueAtPointer } from '../schema/jsonPointer';

export function generateTypeMismatchMutations(
  fields: SchemaFieldDescriptor[],
  baselinePayload: unknown,
  rules: RuleSelectionState
): MutationResult[] {
  const results: MutationResult[] = [];

  for (const field of fields) {
    const { pointer, name, type, sampleValue } = field;

    // 1. String -> Integer
    if (rules.stringToInteger && type === 'string') {
      const mutatedVal = 123456;
      results.push({
        id: `type-str-to-int-${pointer.replace(/\//g, '_')}`,
        name: `[Type Mismatch] '${name}' sent as integer (123456) instead of string`,
        category: 'type_mismatch',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
        expectedStatus: 400,
        description: `Field '${name}' expects type 'string'. Injected integer ${mutatedVal} to verify type constraint rejection.`,
        ruleId: 'stringToInteger',
        originalValue: sampleValue,
        mutatedValue: mutatedVal,
      });
    }

    // 2. Integer/Number -> String
    if (rules.integerToString && (type === 'integer' || type === 'number')) {
      const mutatedVal = 'not_a_valid_number';
      results.push({
        id: `type-int-to-str-${pointer.replace(/\//g, '_')}`,
        name: `[Type Mismatch] '${name}' sent as string ("${mutatedVal}") instead of number`,
        category: 'type_mismatch',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
        expectedStatus: 400,
        description: `Field '${name}' expects type '${type}'. Injected alphanumeric string to test numeric parser robustness.`,
        ruleId: 'integerToString',
        originalValue: sampleValue,
        mutatedValue: mutatedVal,
      });
    }

    // 3. Boolean -> String ("true")
    if (rules.booleanToString && type === 'boolean') {
      const mutatedVal = 'true';
      results.push({
        id: `type-bool-to-str-${pointer.replace(/\//g, '_')}`,
        name: `[Type Mismatch] '${name}' sent as string ("true") instead of boolean`,
        category: 'type_mismatch',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
        expectedStatus: 400,
        description: `Field '${name}' expects boolean true/false. Injected string literal "true" to test against permissive truthy coercion.`,
        ruleId: 'booleanToString',
        originalValue: sampleValue,
        mutatedValue: mutatedVal,
      });
    }

    // 4. Primitive -> Object
    if (rules.primitiveToObject && (type === 'string' || type === 'integer' || type === 'number' || type === 'boolean')) {
      const mutatedVal = { invalid_nested: 'unexpected_object' };
      results.push({
        id: `type-prim-to-obj-${pointer.replace(/\//g, '_')}`,
        name: `[Type Mismatch] '${name}' sent as object instead of primitive`,
        category: 'type_mismatch',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
        expectedStatus: 400,
        description: `Field '${name}' expects primitive '${type}'. Injected object { invalid_nested: ... } to verify structured type rejection.`,
        ruleId: 'primitiveToObject',
        originalValue: sampleValue,
        mutatedValue: mutatedVal,
      });
    }

    // 5. Integer -> Float
    if (rules.integerToFloat && type === 'integer') {
      const baseNum = typeof sampleValue === 'number' ? sampleValue : 42;
      const mutatedVal = Number((baseNum + 0.75).toFixed(2));
      results.push({
        id: `type-int-to-float-${pointer.replace(/\//g, '_')}`,
        name: `[Type Mismatch] '${name}' sent as float (${mutatedVal}) instead of integer`,
        category: 'type_mismatch',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
        expectedStatus: 400,
        description: `Field '${name}' is declared as strictly integer. Injected decimal float ${mutatedVal} to verify float truncation or rejection.`,
        ruleId: 'integerToFloat',
        originalValue: sampleValue,
        mutatedValue: mutatedVal,
      });
    }
  }

  return results;
}
