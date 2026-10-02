import { create } from 'zustand';
import { ApiEndpointConfig, GeneratedSuite, RuleSelectionState } from '../core/types';
import { DEFAULT_RULE_SELECTION } from '../core/mutators/ruleRegistry';
import { SAMPLE_APIS, ApiTemplate } from '../templates/sampleApis';

interface AppState {
  // Inputs
  selectedTemplateId: string;
  schemaInput: string;
  payloadInput: string;
  endpointConfig: ApiEndpointConfig;
  selectedRules: RuleSelectionState;

  // View state
  activeTab: 'postman' | 'playwright' | 'vectors' | 'diff' | 'mock';
  editorTab: 'schema' | 'payload';
  isGenerating: boolean;
  selectedVectorId: string | null;

  // Output
  generatedSuite: GeneratedSuite | null;
  error: string | null;

  // Actions
  loadTemplate: (template: ApiTemplate) => void;
  setSchemaInput: (value: string) => void;
  setPayloadInput: (value: string) => void;
  setEndpointConfig: (config: Partial<ApiEndpointConfig>) => void;
  toggleRule: (ruleKey: keyof RuleSelectionState) => void;
  setAllRulesInCategory: (category: string, enable: boolean) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setEditorTab: (tab: AppState['editorTab']) => void;
  setSelectedVectorId: (id: string | null) => void;
  setGeneratedSuite: (suite: GeneratedSuite | null) => void;
  setError: (err: string | null) => void;
}

const defaultTemplate = SAMPLE_APIS[0];

export const useAppStore = create<AppState>((set) => ({
  selectedTemplateId: defaultTemplate.id,
  schemaInput: JSON.stringify(defaultTemplate.schema, null, 2),
  payloadInput: JSON.stringify(defaultTemplate.payload, null, 2),
  endpointConfig: defaultTemplate.endpoint,
  selectedRules: { ...DEFAULT_RULE_SELECTION },

  activeTab: 'postman',
  editorTab: 'schema',
  isGenerating: false,
  selectedVectorId: null,

  generatedSuite: null,
  error: null,

  loadTemplate: (template) =>
    set({
      selectedTemplateId: template.id,
      schemaInput: JSON.stringify(template.schema, null, 2),
      payloadInput: JSON.stringify(template.payload, null, 2),
      endpointConfig: template.endpoint,
      generatedSuite: null,
      error: null,
    }),

  setSchemaInput: (schemaInput) => set({ schemaInput, selectedTemplateId: 'custom' }),
  setPayloadInput: (payloadInput) => set({ payloadInput, selectedTemplateId: 'custom' }),
  setEndpointConfig: (partial) =>
    set((state) => ({ endpointConfig: { ...state.endpointConfig, ...partial } })),

  toggleRule: (ruleKey) =>
    set((state) => ({
      selectedRules: {
        ...state.selectedRules,
        [ruleKey]: !state.selectedRules[ruleKey],
      },
    })),

  setAllRulesInCategory: (category, enable) =>
    set((state) => {
      const updated = { ...state.selectedRules };
      // Map category to keys
      if (category === 'boundary') {
        updated.numericMinMinusOne = enable;
        updated.numericMaxPlusOne = enable;
        updated.numericZeroAndNegative = enable;
        updated.numericOverflow = enable;
        updated.stringMinLengthMinusOne = enable;
        updated.stringMaxLengthPlusOne = enable;
        updated.stringBufferOverflow = enable;
        updated.stringEmpty = enable;
        updated.arrayEmpty = enable;
        updated.arrayMaxItemsPlusOne = enable;
      } else if (category === 'nullability') {
        updated.omitRequiredFields = enable;
        updated.explicitNullForNonNull = enable;
        updated.emptyObjectsForRequired = enable;
        updated.arrayNullItemInjection = enable;
      } else if (category === 'type_mismatch') {
        updated.stringToInteger = enable;
        updated.integerToString = enable;
        updated.booleanToString = enable;
        updated.primitiveToObject = enable;
        updated.integerToFloat = enable;
      } else if (category === 'unicode_fuzz') {
        updated.emojiSequences = enable;
        updated.rightToLeftOverride = enable;
        updated.zeroWidthSpaces = enable;
        updated.sqlInjectionPatterns = enable;
        updated.xssScriptTags = enable;
        updated.pathTraversalVectors = enable;
        updated.extremeWhitespaceCrlf = enable;
      }
      return { selectedRules: updated };
    }),

  setActiveTab: (activeTab) => set({ activeTab }),
  setEditorTab: (editorTab) => set({ editorTab }),
  setSelectedVectorId: (selectedVectorId) => set({ selectedVectorId }),
  setGeneratedSuite: (generatedSuite) => set({ generatedSuite }),
  setError: (error) => set({ error }),
}));
