import { SchemaNode } from '../types';
import { getValueAtPointer } from './jsonPointer';

export interface SchemaFieldDescriptor {
  pointer: string;
  name: string;
  schema: SchemaNode;
  parentSchema?: SchemaNode;
  isRequired: boolean;
  type: string;
  isNullable: boolean;
  sampleValue?: unknown;
  parentPointer: string;
}

export interface ParsedSchemaResult {
  rootSchema: SchemaNode;
  fields: SchemaFieldDescriptor[];
  schemaTitle?: string;
}

/**
 * Resolves local $ref within the same schema document (e.g., #/$defs/..., #/definitions/...)
 */
export function resolveRef(root: SchemaNode, ref: string): SchemaNode {
  if (!ref.startsWith('#/')) {
    return {};
  }
  const parts = ref.slice(2).split('/');
  let current: any = root;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return {};
    current = current[part];
  }
  return current || {};
}

/**
 * Normalizes type declarations (handles union types like ["string", "null"])
 */
export function extractType(schema: SchemaNode): { primaryType: string; isNullable: boolean } {
  if (Array.isArray(schema.type)) {
    const isNullable = schema.type.includes('null');
    const primaryType = schema.type.find((t) => t !== 'null') || 'string';
    return { primaryType, isNullable };
  }

  const isNullable = Boolean(schema.nullable) || schema.type === 'null';
  const primaryType = typeof schema.type === 'string' ? schema.type : 'string';
  return { primaryType, isNullable };
}

/**
 * Traverses JSON schema and sample payload to extract field descriptors for mutation
 */
export function parseSchemaFields(
  schema: SchemaNode,
  samplePayload?: unknown
): ParsedSchemaResult {
  const fields: SchemaFieldDescriptor[] = [];

  function traverse(
    currentNode: SchemaNode,
    currentPointer: string,
    parentNode?: SchemaNode,
    parentPointer: string = ''
  ) {
    if (!currentNode || typeof currentNode !== 'object') return;

    // Resolve $ref if present
    let effectiveNode = currentNode;
    if (typeof currentNode.$ref === 'string') {
      const resolved = resolveRef(schema, currentNode.$ref);
      effectiveNode = { ...resolved, ...currentNode };
    }

    // Traverse properties of an object
    if (effectiveNode.properties && typeof effectiveNode.properties === 'object') {
      const requiredList: string[] = Array.isArray(effectiveNode.required)
        ? effectiveNode.required
        : [];

      for (const [propName, propSchema] of Object.entries(effectiveNode.properties)) {
        let childSchema = propSchema as SchemaNode;
        if (typeof childSchema.$ref === 'string') {
          childSchema = { ...resolveRef(schema, childSchema.$ref), ...childSchema };
        }

        const childPointer = `${currentPointer}/${propName}`;
        const isRequired = requiredList.includes(propName);
        const { primaryType, isNullable } = extractType(childSchema);
        const sampleVal = samplePayload !== undefined ? getValueAtPointer(samplePayload, childPointer) : undefined;

        fields.push({
          pointer: childPointer,
          name: propName,
          schema: childSchema,
          parentSchema: effectiveNode,
          isRequired,
          type: primaryType,
          isNullable,
          sampleValue: sampleVal,
          parentPointer: currentPointer,
        });

        // Recurse into nested objects
        if (childSchema.properties) {
          traverse(childSchema, childPointer, effectiveNode, currentPointer);
        }

        // Recurse into array item schemas if defined
        if (childSchema.type === 'array' && childSchema.items && typeof childSchema.items === 'object') {
          // If sample payload has array items, record descriptor for item index 0
          if (Array.isArray(sampleVal) && sampleVal.length > 0) {
            const itemPointer = `${childPointer}/0`;
            const itemSchema = childSchema.items as SchemaNode;
            const { primaryType: itemType, isNullable: itemNullable } = extractType(itemSchema);

            fields.push({
              pointer: itemPointer,
              name: `${propName}[0]`,
              schema: itemSchema,
              parentSchema: childSchema,
              isRequired: false,
              type: itemType,
              isNullable: itemNullable,
              sampleValue: sampleVal[0],
              parentPointer: childPointer,
            });

            if (itemSchema.properties) {
              traverse(itemSchema, itemPointer, childSchema, childPointer);
            }
          }
        }
      }
    }
  }

  traverse(schema, '');

  return {
    rootSchema: schema,
    fields,
    schemaTitle: typeof schema.title === 'string' ? schema.title : undefined,
  };
}
