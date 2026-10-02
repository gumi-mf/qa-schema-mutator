import {
  ApiEndpointConfig,
  GeneratedSuite,
  MutationResult,
  RuleCategory,
  RuleSelectionState,
  SchemaNode,
} from '../types';
import { parseSchemaFields } from '../schema/schemaParser';
import { generateBoundaryMutations } from './boundaryMutator';
import { generateNullabilityMutations } from './nullabilityMutator';
import { generateTypeMismatchMutations } from './typeMismatchMutator';
import { generateUnicodeFuzzMutations } from './unicodeFuzzMutator';
import { cloneDeep } from '../schema/jsonPointer';

export interface GenerateSuiteOptions {
  schema: SchemaNode;
  baselinePayload: unknown;
  rules: RuleSelectionState;
  endpoint: ApiEndpointConfig;
  postmanCompiler?: (suite: GeneratedSuite) => string;
  playwrightCompiler?: (suite: GeneratedSuite) => string;
}

export function executeMutationEngine(options: GenerateSuiteOptions): GeneratedSuite {
  const { schema, baselinePayload, rules, endpoint, postmanCompiler, playwrightCompiler } = options;

  // 1. Parse schema structure and field descriptors mapped to baseline payload
  const parsed = parseSchemaFields(schema, baselinePayload);
  const fields = parsed.fields;

  // 2. Generate mutations per category
  const boundaryVectors = generateBoundaryMutations(fields, baselinePayload, rules);
  const nullabilityVectors = generateNullabilityMutations(fields, baselinePayload, rules);
  const typeMismatchVectors = generateTypeMismatchMutations(fields, baselinePayload, rules);
  const unicodeFuzzVectors = generateUnicodeFuzzMutations(fields, baselinePayload, rules);

  // Combine all generated vectors
  const allVectors: MutationResult[] = [
    ...boundaryVectors,
    ...nullabilityVectors,
    ...typeMismatchVectors,
    ...unicodeFuzzVectors,
  ];

  // 3. Calculate category distribution
  const byCategory: Record<RuleCategory, number> = {
    boundary: boundaryVectors.length,
    nullability: nullabilityVectors.length,
    type_mismatch: typeMismatchVectors.length,
    unicode_fuzz: unicodeFuzzVectors.length,
  };

  const expectedBaselineStatus = endpoint.method === 'POST' ? 201 : 200;

  const suite: GeneratedSuite = {
    timestamp: new Date().toISOString(),
    endpoint,
    baselineVector: {
      name: `00 - Baseline (Happy Path): Valid ${endpoint.name || 'API Request'} Payload`,
      payload: cloneDeep(baselinePayload),
      expectedStatus: expectedBaselineStatus,
    },
    vectors: allVectors,
    postmanCollectionJson: '',
    playwrightSpecCode: '',
    summary: {
      totalVectors: allVectors.length,
      byCategory,
    },
  };

  // 4. Compile targets if compilers provided
  if (postmanCompiler) {
    suite.postmanCollectionJson = postmanCompiler(suite);
  }
  if (playwrightCompiler) {
    suite.playwrightSpecCode = playwrightCompiler(suite);
  }

  return suite;
}
