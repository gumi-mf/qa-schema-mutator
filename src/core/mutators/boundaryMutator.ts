import { MutationResult, RuleSelectionState } from '../types';
import { SchemaFieldDescriptor } from '../schema/schemaParser';
import { setValueAtPointer } from '../schema/jsonPointer';

export function generateBoundaryMutations(
  fields: SchemaFieldDescriptor[],
  baselinePayload: unknown,
  rules: RuleSelectionState
): MutationResult[] {
  const results: MutationResult[] = [];

  for (const field of fields) {
    const { pointer, name, schema, type, sampleValue } = field;

    // --- Numeric Boundaries ---
    if (type === 'integer' || type === 'number') {
      // 1. Minimum - 1 (Underflow)
      if (rules.numericMinMinusOne) {
        if (typeof schema.minimum === 'number') {
          const mutatedVal = schema.minimum - 1;
          results.push({
            id: `boundary-min-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' below minimum (${mutatedVal} < ${schema.minimum})`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
            expectedStatus: 400,
            description: `Field '${name}' must be >= ${schema.minimum}. Mutated to ${mutatedVal} to test underflow boundary rejection.`,
            ruleId: 'numericMinMinusOne',
            originalValue: sampleValue,
            mutatedValue: mutatedVal,
          });
        } else if (typeof schema.exclusiveMinimum === 'number') {
          const mutatedVal = schema.exclusiveMinimum;
          results.push({
            id: `boundary-excl-min-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' violates exclusiveMinimum (${mutatedVal})`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
            expectedStatus: 400,
            description: `Field '${name}' must be strictly > ${schema.exclusiveMinimum}. Mutated to exactly ${mutatedVal}.`,
            ruleId: 'numericMinMinusOne',
            originalValue: sampleValue,
            mutatedValue: mutatedVal,
          });
        }
      }

      // 2. Maximum + 1 (Overflow)
      if (rules.numericMaxPlusOne) {
        if (typeof schema.maximum === 'number') {
          const mutatedVal = schema.maximum + 1;
          results.push({
            id: `boundary-max-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' exceeds maximum (${mutatedVal} > ${schema.maximum})`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
            expectedStatus: 400,
            description: `Field '${name}' must be <= ${schema.maximum}. Mutated to ${mutatedVal} to test overflow boundary rejection.`,
            ruleId: 'numericMaxPlusOne',
            originalValue: sampleValue,
            mutatedValue: mutatedVal,
          });
        } else if (typeof schema.exclusiveMaximum === 'number') {
          const mutatedVal = schema.exclusiveMaximum;
          results.push({
            id: `boundary-excl-max-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' violates exclusiveMaximum (${mutatedVal})`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
            expectedStatus: 400,
            description: `Field '${name}' must be strictly < ${schema.exclusiveMaximum}. Mutated to exactly ${mutatedVal}.`,
            ruleId: 'numericMaxPlusOne',
            originalValue: sampleValue,
            mutatedValue: mutatedVal,
          });
        }
      }

      // 3. Zero and Negative Values
      if (rules.numericZeroAndNegative) {
        if (typeof schema.minimum === 'number' && schema.minimum > 0) {
          // Zero test
          results.push({
            id: `boundary-zero-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' injected with 0 (below min ${schema.minimum})`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, 0),
            expectedStatus: 400,
            description: `Field '${name}' expects positive value >= ${schema.minimum}. Injected 0.`,
            ruleId: 'numericZeroAndNegative',
            originalValue: sampleValue,
            mutatedValue: 0,
          });

          // Negative test
          results.push({
            id: `boundary-neg-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' injected with negative number (-1)`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, -1),
            expectedStatus: 400,
            description: `Field '${name}' expects value >= ${schema.minimum}. Injected -1 to test sign enforcement.`,
            ruleId: 'numericZeroAndNegative',
            originalValue: sampleValue,
            mutatedValue: -1,
          });
        }
      }

      // 4. Safe Integer Precision Overflow
      if (rules.numericOverflow && type === 'integer') {
        const overflowVal = 9007199254741992; // MAX_SAFE_INTEGER + 1
        results.push({
            id: `boundary-precision-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' safe integer overflow (2^53)`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, overflowVal),
            expectedStatus: 400,
            description: `Field '${name}' injected with 9007199254741992 to test integer boundary precision and database overflow handling.`,
            ruleId: 'numericOverflow',
            originalValue: sampleValue,
            mutatedValue: overflowVal,
        });
      }
    }

    // --- String Boundaries ---
    if (type === 'string') {
      // 5. String minLength - 1
      if (rules.stringMinLengthMinusOne && typeof schema.minLength === 'number' && schema.minLength > 0) {
        const mutatedVal = 'a'.repeat(schema.minLength - 1);
        results.push({
          id: `boundary-str-min-${pointer.replace(/\//g, '_')}`,
          name: `[Boundary] '${name}' length ${schema.minLength - 1} < minLength (${schema.minLength})`,
          category: 'boundary',
          fieldPointer: pointer,
          mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
          expectedStatus: 400,
          description: `Field '${name}' minLength is ${schema.minLength}. Mutated to '${mutatedVal}' (length ${mutatedVal.length}).`,
          ruleId: 'stringMinLengthMinusOne',
          originalValue: sampleValue,
          mutatedValue: mutatedVal,
        });
      }

      // 6. String maxLength + 1
      if (rules.stringMaxLengthPlusOne && typeof schema.maxLength === 'number') {
        const mutatedVal = 'a'.repeat(schema.maxLength + 1);
        results.push({
          id: `boundary-str-max-${pointer.replace(/\//g, '_')}`,
          name: `[Boundary] '${name}' length ${schema.maxLength + 1} > maxLength (${schema.maxLength})`,
          category: 'boundary',
          fieldPointer: pointer,
          mutatedPayload: setValueAtPointer(baselinePayload, pointer, mutatedVal),
          expectedStatus: 400,
          description: `Field '${name}' maxLength is ${schema.maxLength}. Mutated to length ${mutatedVal.length} to test string length validation.`,
          ruleId: 'stringMaxLengthPlusOne',
          originalValue: sampleValue,
          mutatedValue: `${mutatedVal.slice(0, 15)}... (${mutatedVal.length} chars)`,
        });
      }

      // 7. String Buffer Overflow (10KB)
      if (rules.stringBufferOverflow) {
        const bufferVal = 'A'.repeat(10240);
        results.push({
          id: `boundary-buffer-${pointer.replace(/\//g, '_')}`,
          name: `[Boundary] '${name}' 10KB string buffer flood`,
          category: 'boundary',
          fieldPointer: pointer,
          mutatedPayload: setValueAtPointer(baselinePayload, pointer, bufferVal),
          expectedStatus: 400,
          description: `Injected 10KB string into '${name}' to test memory allocation, buffer overflow protection, and request body size limits.`,
          ruleId: 'stringBufferOverflow',
          originalValue: sampleValue,
          mutatedValue: `[Buffer of 10240 'A' characters]`,
        });
      }

      // 8. Empty String ("")
      if (rules.stringEmpty) {
        const isMinLengthViolated = typeof schema.minLength === 'number' && schema.minLength > 0;
        if (isMinLengthViolated || field.isRequired) {
          results.push({
            id: `boundary-empty-str-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' injected with empty string ("")`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, ''),
            expectedStatus: 400,
            description: `Field '${name}' mutated to empty string (""). Checks whether empty string is accepted when value is required.`,
            ruleId: 'stringEmpty',
            originalValue: sampleValue,
            mutatedValue: '""',
          });
        }
      }
    }

    // --- Array Boundaries ---
    if (type === 'array') {
      // 9. Empty Array ([])
      if (rules.arrayEmpty) {
        const hasMinItems = typeof schema.minItems === 'number' && schema.minItems > 0;
        if (hasMinItems || field.isRequired) {
          results.push({
            id: `boundary-empty-arr-${pointer.replace(/\//g, '_')}`,
            name: `[Boundary] '${name}' injected with empty array ([])`,
            category: 'boundary',
            fieldPointer: pointer,
            mutatedPayload: setValueAtPointer(baselinePayload, pointer, []),
            expectedStatus: 400,
            description: `Field '${name}' mutated to empty array ([]). Tests minItems validation enforcement.`,
            ruleId: 'arrayEmpty',
            originalValue: sampleValue,
            mutatedValue: [],
          });
        }
      }

      // 10. Array maxItems + 1
      if (rules.arrayMaxItemsPlusOne && typeof schema.maxItems === 'number') {
        const sampleArr = Array.isArray(sampleValue) ? sampleValue : [];
        const baseItem = sampleArr[0] !== undefined ? sampleArr[0] : 'item';
        const overflowArr = [];
        for (let i = 0; i <= schema.maxItems; i++) {
          overflowArr.push(typeof baseItem === 'object' ? JSON.parse(JSON.stringify(baseItem)) : baseItem);
        }

        results.push({
          id: `boundary-arr-max-${pointer.replace(/\//g, '_')}`,
          name: `[Boundary] '${name}' item count (${overflowArr.length}) > maxItems (${schema.maxItems})`,
          category: 'boundary',
          fieldPointer: pointer,
          mutatedPayload: setValueAtPointer(baselinePayload, pointer, overflowArr),
          expectedStatus: 400,
          description: `Field '${name}' maxItems is ${schema.maxItems}. Generated array of ${overflowArr.length} items to test array cap.`,
          ruleId: 'arrayMaxItemsPlusOne',
          originalValue: sampleValue,
          mutatedValue: `[Array of ${overflowArr.length} items]`,
        });
      }
    }
  }

  return results;
}
