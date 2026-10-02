export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RuleCategory = 'boundary' | 'nullability' | 'type_mismatch' | 'unicode_fuzz';

export interface RuleDefinition {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  defaultEnabled: boolean;
  severity: 'high' | 'medium' | 'low';
}

export interface RuleSelectionState {
  // Boundary rules
  numericMinMinusOne: boolean;
  numericMaxPlusOne: boolean;
  numericZeroAndNegative: boolean;
  numericOverflow: boolean;
  stringMinLengthMinusOne: boolean;
  stringMaxLengthPlusOne: boolean;
  stringBufferOverflow: boolean;
  stringEmpty: boolean;
  arrayEmpty: boolean;
  arrayMaxItemsPlusOne: boolean;

  // Null & Omission rules
  omitRequiredFields: boolean;
  explicitNullForNonNull: boolean;
  emptyObjectsForRequired: boolean;
  arrayNullItemInjection: boolean;

  // Type Mismatch rules
  stringToInteger: boolean;
  integerToString: boolean;
  booleanToString: boolean;
  primitiveToObject: boolean;
  integerToFloat: boolean;

  // Unicode & Fuzzing rules
  emojiSequences: boolean;
  rightToLeftOverride: boolean;
  zeroWidthSpaces: boolean;
  sqlInjectionPatterns: boolean;
  xssScriptTags: boolean;
  pathTraversalVectors: boolean;
  extremeWhitespaceCrlf: boolean;
}

export interface ApiEndpointConfig {
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  auth?: {
    type: 'none' | 'bearer' | 'apikey';
    token?: string;
    key?: string;
    value?: string;
  };
}

export interface SchemaNode {
  type?: string | string[];
  properties?: Record<string, SchemaNode>;
  required?: string[];
  items?: SchemaNode;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  enum?: unknown[];
  format?: string;
  nullable?: boolean;
  description?: string;
  [key: string]: unknown;
}

export interface MutationContext {
  jsonPointer: string;       // e.g. "/user/address/zipCode"
  fieldName: string;         // e.g. "zipCode"
  schemaNode: SchemaNode;    // Sub-schema at pointer
  originalValue: unknown;    // Value from sample payload
  fullBaselinePayload: unknown;
}

export interface MutationResult {
  id: string;
  name: string;
  category: RuleCategory;
  fieldPointer: string;
  mutatedPayload: unknown;
  expectedStatus: 400 | 422 | 200 | 201;
  description: string;
  ruleId: string;
  originalValue: unknown;
  mutatedValue: unknown;
  postmanScript?: string;
  playwrightAssertion?: string;
}

export interface GeneratedSuite {
  timestamp: string;
  endpoint: ApiEndpointConfig;
  baselineVector: {
    name: string;
    payload: unknown;
    expectedStatus: number;
  };
  vectors: MutationResult[];
  postmanCollectionJson: string;
  playwrightSpecCode: string;
  summary: {
    totalVectors: number;
    byCategory: Record<RuleCategory, number>;
  };
}
