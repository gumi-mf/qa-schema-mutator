import React from 'react';
import { SAMPLE_APIS } from '@/templates/sampleApis';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Terminal, FileCode2, Play } from 'lucide-react';
import { executeMutationEngine } from '@/core/mutators/mutationEngine';
import { compilePostmanCollection } from '@/core/compilers/postmanCompiler';
import { compilePlaywrightSuite } from '@/core/compilers/playwrightCompiler';

export const Header: React.FC = () => {
  const {
    selectedTemplateId,
    loadTemplate,
    schemaInput,
    payloadInput,
    endpointConfig,
    selectedRules,
    setGeneratedSuite,
    setError,
    isGenerating,
  } = useAppStore();

  const handleGenerate = () => {
    try {
      setError(null);
      let parsedSchema: any;
      let parsedPayload: any;

      try {
        parsedSchema = JSON.parse(schemaInput);
      } catch (err: any) {
        throw new Error(`Invalid JSON in Schema Editor: ${err.message}`);
      }

      try {
        parsedPayload = JSON.parse(payloadInput);
      } catch (err: any) {
        throw new Error(`Invalid JSON in Sample Payload Editor: ${err.message}`);
      }

      const suite = executeMutationEngine({
        schema: parsedSchema,
        baselinePayload: parsedPayload,
        rules: selectedRules,
        endpoint: endpointConfig,
        postmanCompiler: compilePostmanCollection,
        playwrightCompiler: compilePlaywrightSuite,
      });

      setGeneratedSuite(suite);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize test suites');
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-3 flex flex-wrap items-center justify-between gap-4 relative z-20 w-full">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight">QA Schema Mutator</h1>
            <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-950/40">
              v2.1 Dual-Target
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Client-Side Rule Mutation → Postman Collection & Playwright Suite Synthesizer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Template Quick Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <span className="text-xs text-slate-400 px-2 font-medium">Templates:</span>
          {SAMPLE_APIS.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => loadTemplate(tmpl)}
              className={`text-xs px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                selectedTemplateId === tmpl.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* Generate Action */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/25 gap-2 cursor-pointer"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>Synthesize Suites</span>
        </Button>
      </div>
    </header>
  );
};
