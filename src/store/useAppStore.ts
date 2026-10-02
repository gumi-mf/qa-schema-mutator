import { create } from 'zustand';
import { ApiEndpointConfig, GeneratedSuite, RuleSelectionState } from '../core/types';
import { DEFAULT_RULE_SELECTION, PRESET_PROFILES, PresetProfileId } from '../core/mutators/ruleRegistry';
import { SAMPLE_APIS, ApiTemplate } from '../templates/sampleApis';
import { executeMutationEngine } from '../core/mutators/mutationEngine';
import { compilePostmanCollection } from '../core/compilers/postmanCompiler';
import { compilePlaywrightSuite } from '../core/compilers/playwrightCompiler';

interface AppState {
  // Inputs (Zone 1: Input Stage)
  selectedTemplateId: string;
  schemaInput: string;
  payloadInput: string;
  endpointConfig: ApiEndpointConfig;

  // Mutation Config (Zone 2: Mutation Config)
  activePreset: PresetProfileId | 'custom';
  selectedRules: RuleSelectionState;
  targetExpectedStatus: number;

  // View state & Zone navigation
  currentZone: 'input' | 'config' | 'matrix' | 'export';
  activeTab: 'postman' | 'playwright' | 'vectors' | 'mock';
  editorTab: 'schema' | 'payload' | 'headers';
  isGenerating: boolean;
  selectedVectorId: string | null;

  // Metric Banner & Doherty threshold (<400ms tracking)
  generationLatencyMs: number;
  toastMessage: string | null;

  // Output
  generatedSuite: GeneratedSuite | null;
  error: string | null;

  // Actions
  loadTemplate: (template: ApiTemplate) => void;
  setSchemaInput: (value: string) => void;
  setPayloadInput: (value: string) => void;
  setEndpointConfig: (config: Partial<ApiEndpointConfig>) => void;
  applyPreset: (presetId: PresetProfileId) => void;
  toggleRule: (ruleKey: keyof RuleSelectionState) => void;
  setAllRulesInCategory: (category: string, enable: boolean) => void;
  setCurrentZone: (zone: AppState['currentZone']) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setEditorTab: (tab: AppState['editorTab']) => void;
  setSelectedVectorId: (id: string | null) => void;
  setGeneratedSuite: (suite: GeneratedSuite | null) => void;
  setError: (err: string | null) => void;
  showToast: (msg: string) => void;
  executeGeneration: () => void;
}

const defaultTemplate = SAMPLE_APIS[0];

const initialStartTime = performance.now();
const initialSuite = executeMutationEngine({
  schema: defaultTemplate.schema,
  baselinePayload: defaultTemplate.payload,
  rules: { ...DEFAULT_RULE_SELECTION },
  endpoint: defaultTemplate.endpoint,
  postmanCompiler: compilePostmanCollection,
  playwrightCompiler: compilePlaywrightSuite,
});
const initialLatency = Math.round(performance.now() - initialStartTime);

export const useAppStore = create<AppState>((set, get) => ({
  selectedTemplateId: defaultTemplate.id,
  schemaInput: JSON.stringify(defaultTemplate.schema, null, 2),
  payloadInput: JSON.stringify(defaultTemplate.payload, null, 2),
  endpointConfig: defaultTemplate.endpoint,

  activePreset: 'strict_contract',
  selectedRules: { ...PRESET_PROFILES[1].rules },
  targetExpectedStatus: 400,

  currentZone: 'input',
  activeTab: 'postman',
  editorTab: 'schema',
  isGenerating: false,
  selectedVectorId: null,

  generationLatencyMs: initialLatency || 18,
  toastMessage: null,

  generatedSuite: initialSuite,
  error: null,

  loadTemplate: (template) => {
    set({
      selectedTemplateId: template.id,
      schemaInput: JSON.stringify(template.schema, null, 2),
      payloadInput: JSON.stringify(template.payload, null, 2),
      endpointConfig: template.endpoint,
      error: null,
    });
    get().executeGeneration();
  },

  setSchemaInput: (schemaInput) => {
    set({ schemaInput, selectedTemplateId: 'custom' });
  },

  setPayloadInput: (payloadInput) => {
    set({ payloadInput, selectedTemplateId: 'custom' });
  },

  setEndpointConfig: (partial) =>
    set((state) => ({ endpointConfig: { ...state.endpointConfig, ...partial } })),

  applyPreset: (presetId) => {
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (found) {
      set({
        activePreset: presetId,
        selectedRules: { ...found.rules },
      });
      get().executeGeneration();
    }
  },

  toggleRule: (ruleKey) => {
    set((state) => ({
      activePreset: 'custom',
      selectedRules: {
        ...state.selectedRules,
        [ruleKey]: !state.selectedRules[ruleKey],
      },
    }));
  },

  setAllRulesInCategory: (category, enable) => {
    set((state) => {
      const updated = { ...state.selectedRules };
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
      return { activePreset: 'custom', selectedRules: updated };
    });
  },

  setCurrentZone: (currentZone) => set({ currentZone }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setEditorTab: (editorTab) => set({ editorTab }),
  setSelectedVectorId: (selectedVectorId) => set({ selectedVectorId }),
  setGeneratedSuite: (generatedSuite) => set({ generatedSuite }),
  setError: (error) => set({ error }),

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 2800);
  },

  executeGeneration: () => {
    const { schemaInput, payloadInput, endpointConfig, selectedRules } = get();
    const startTime = performance.now();

    try {
      set({ isGenerating: true, error: null });

      let parsedSchema: any;
      let parsedPayload: any;

      try {
        parsedSchema = JSON.parse(schemaInput);
      } catch (err: any) {
        throw new Error(`JSON Schema Syntax Error: ${err.message}`);
      }

      try {
        parsedPayload = JSON.parse(payloadInput);
      } catch (err: any) {
        throw new Error(`Sample Payload Syntax Error: ${err.message}`);
      }

      const suite = executeMutationEngine({
        schema: parsedSchema,
        baselinePayload: parsedPayload,
        rules: selectedRules,
        endpoint: endpointConfig,
        postmanCompiler: compilePostmanCollection,
        playwrightCompiler: compilePlaywrightSuite,
      });

      const elapsed = Math.round(performance.now() - startTime);

      set({
        generatedSuite: suite,
        generationLatencyMs: elapsed,
        isGenerating: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to synthesize test matrix',
        isGenerating: false,
      });
    }
  },
}));
