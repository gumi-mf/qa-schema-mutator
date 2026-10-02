import { MutationResult, RuleSelectionState } from '../types';
import { SchemaFieldDescriptor } from '../schema/schemaParser';
import { deleteValueAtPointer, setValueAtPointer } from '../schema/jsonPointer';

export function generateNullabilityMutations(
  fields: SchemaFieldDescriptor[],
  baselinePayload: unknown,
  rules: RuleSelectionState
): MutationResult[] {
  const results: MutationResult[] = [];

  for (const field of fields) {
    const { pointer, name, isRequired, isNullable, type, sampleValue, schema } = field;

    // 1. Omit Required Field
    if (rules.omitRequiredFields && isRequired) {
      results.push({
        id: `null-omit-${pointer.replace(/\//g, '_')}`,
        name: `[Nullability] Omit required field '${name}'`,
        category: 'nullability',
        fieldPointer: pointer,
        mutatedPayload: deleteValueAtPointer(baselinePayload, pointer),
        expectedStatus: 400,
        description: `Field '${name}' is marked as required in the schema. Entire key was omitted to verify presence validation.`,
        ruleId: 'omitRequiredFields',
        originalValue: sampleValue,
        mutatedValue: undefined,
      });
    }

    // 2. Explicit null for Non-Nullable Fields
    if (rules.explicitNullForNonNull && !isNullable) {
      results.push({
        id: `null-explicit-${pointer.replace(/\//g, '_')}`,
        name: `[Nullability] Explicit null for non-nullable '${name}'`,
        category: 'nullability',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, null),
        expectedStatus: 400,
        description: `Field '${name}' does not allow null. Explicit null was passed to verify nullability constraint.`,
        ruleId: 'explicitNullForNonNull',
        originalValue: sampleValue,
        mutatedValue: null,
      });
    }

    // 3. Empty Object for Nested Objects with Required Fields
    if (rules.emptyObjectsForRequired && type === 'object') {
      const hasRequiredChildren = Array.isArray(schema.required) && schema.required.length > 0;
      if (hasRequiredChildren) {
        results.push({
          id: `null-empty-obj-${pointer.replace(/\//g, '_')}`,
          name: `[Nullability] Empty object ({}) for required object '${name}'`,
          category: 'nullability',
          fieldPointer: pointer,
          mutatedPayload: setValueAtPointer(baselinePayload, pointer, {}),
          expectedStatus: 400,
          description: `Field '${name}' has required child properties (${schema.required?.join(', ')}). Injected empty object {} to test nested validation.`,
          ruleId: 'emptyObjectsForRequired',
          originalValue: sampleValue,
          mutatedValue: {},
        });
      }
    }

    // 4. Null item injected into Array
    if (rules.arrayNullItemInjection && type === 'array') {
      const originalArr = Array.isArray(sampleValue) ? sampleValue : [];
      const injectedArr = originalArr.length > 0 ? [originalArr[0], null] : [null];

      results.push({
        id: `null-arr-item-${pointer.replace(/\//g, '_')}`,
        name: `[Nullability] Null item injected into '${name}' array`,
        category: 'nullability',
        fieldPointer: pointer,
        mutatedPayload: setValueAtPointer(baselinePayload, pointer, injectedArr),
        expectedStatus: 400,
        description: `Field '${name}' expects items of typed elements. Injected null element to test collection item null-safety.`,
        ruleId: 'arrayNullItemInjection',
        originalValue: sampleValue,
        mutatedValue: injectedArr,
      });
    }
  }

  return results;
}
