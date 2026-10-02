import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { EditorPanel } from '@/components/EditorPanel';
import { RuleMatrixPanel } from '@/components/RuleMatrixPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { useAppStore } from '@/store/useAppStore';
import { executeMutationEngine } from '@/core/mutators/mutationEngine';
import { compilePostmanCollection } from '@/core/compilers/postmanCompiler';
import { compilePlaywrightSuite } from '@/core/compilers/playwrightCompiler';
import { AlertCircle, Layers, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const {
    schemaInput,
    payloadInput,
    endpointConfig,
    selectedRules,
    setGeneratedSuite,
    error,
    setError,
    generatedSuite,
  } = useAppStore();

  // Initial auto-synthesis on first mount so user sees immediate results
  useEffect(() => {
    try {
      const parsedSchema = JSON.parse(schemaInput);
      const parsedPayload = JSON.parse(payloadInput);
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
      setError(err.message);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
      <Header />

      {/* Global Error Banner if invalid JSON */}
      {error && (
        <div className="bg-red-950/80 border-b border-red-800/80 px-6 py-2.5 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats bar */}
      {generatedSuite && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span>Total Test Vectors:</span>
              <strong className="text-slate-100">{generatedSuite.summary.totalVectors + 1}</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span>Boundary:</span>
              <strong className="text-amber-400">{generatedSuite.summary.byCategory.boundary}</strong>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span>Nullability:</span>
              <strong className="text-purple-400">{generatedSuite.summary.byCategory.nullability}</strong>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span>Type Mismatch:</span>
              <strong className="text-cyan-400">{generatedSuite.summary.byCategory.type_mismatch}</strong>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span>Unicode/Fuzz:</span>
              <strong className="text-rose-400">{generatedSuite.summary.byCategory.unicode_fuzz}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Ready for Newman & Playwright Execution</span>
          </div>
        </div>
      )}

      {/* Main 3-Column Responsive Grid */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* Left Column: Monaco Schema & Payload Editor (4 cols) */}
        <section className="lg:col-span-4 flex flex-col min-h-[500px]">
          <EditorPanel />
        </section>

        {/* Center Column: Rule Matrix Configurator (3 cols) */}
        <section className="lg:col-span-3 flex flex-col min-h-[500px]">
          <RuleMatrixPanel />
        </section>

        {/* Right Column: Dual-Target Synthesizer & Preview (5 cols) */}
        <section className="lg:col-span-5 flex flex-col min-h-[500px]">
          <OutputPanel />
        </section>
      </main>
    </div>
  );
};

export default App;
