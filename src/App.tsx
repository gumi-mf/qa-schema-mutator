import React from 'react';
import { Header } from '@/components/Header';
import { EditorPanel } from '@/components/EditorPanel';
import { RuleMatrixPanel } from '@/components/RuleMatrixPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { useAppStore } from '@/store/useAppStore';
import { generateTestBundleZip } from '@/core/compilers/bundleExporter';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Play,
  Box,
  CheckCircle2,
  X,
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    error,
    setError,
    toastMessage,
    executeGeneration,
    isGenerating,
    generatedSuite,
    endpointConfig,
    showToast,
  } = useAppStore();

  const handleDownloadZip = async () => {
    if (!generatedSuite) return;
    try {
      const zipBlob = await generateTestBundleZip(generatedSuite);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (endpointConfig.name || 'api').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${safeName}-test-bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded complete Test Bundle (.zip)!');
    } catch {
      showToast('Failed to compile zip bundle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 selection:bg-white selection:text-black font-sans">
      <Header />

      {/* Global Error Banner if invalid JSON */}
      {error && (
        <div className="bg-zinc-900 border-b border-zinc-700 px-6 py-2.5 flex items-center justify-between text-xs text-zinc-100 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-zinc-400 hover:text-white p-1 rounded cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Miller's Law: 4 Clearly Delineated Mental Zones Indicator */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-2 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-5 overflow-x-auto">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-bold text-zinc-200">
              1
            </span>
            <span className="font-semibold text-zinc-200">Input Stage</span>
          </div>
          <span className="text-zinc-700">→</span>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-bold text-zinc-200">
              2
            </span>
            <span className="font-semibold text-zinc-200">Mutation Config</span>
          </div>
          <span className="text-zinc-700">→</span>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-bold text-zinc-200">
              3
            </span>
            <span className="font-semibold text-zinc-200">Matrix Preview</span>
          </div>
          <span className="text-zinc-700">→</span>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-bold text-zinc-200">
              4
            </span>
            <span className="font-semibold text-zinc-200">Export Center</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-200"></span>
          <span>100% Client-Side In-Memory AST Engine</span>
        </div>
      </div>

      {/* Main 3-Column Responsive Workspace */}
      <main className="flex-1 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 bg-black">
        {/* Zone 1: Input Stage (4 cols) */}
        <section className="lg:col-span-4 flex flex-col min-h-[520px]">
          <EditorPanel />
        </section>

        {/* Zone 2: Mutation Config (3 cols) */}
        <section className="lg:col-span-3 flex flex-col min-h-[520px]">
          <RuleMatrixPanel />
        </section>

        {/* Zone 3 & 4: Matrix Preview & Export Center (5 cols) */}
        <section className="lg:col-span-5 flex flex-col min-h-[520px]">
          <OutputPanel />
        </section>
      </main>

      {/* Fitts's Law: Bottom-Right Sticky Floating Bar */}
      <div className="fixed bottom-5 right-6 z-40 flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl shadow-2xl">
        <Button
          onClick={handleDownloadZip}
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-xs font-mono font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 gap-1.5 cursor-pointer"
          title="Download complete zip bundle"
        >
          <Box className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Zip Bundle</span>
        </Button>

        <Button
          onClick={executeGeneration}
          disabled={isGenerating}
          size="sm"
          className="h-9 px-4 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200 gap-2 cursor-pointer min-w-[44px] shadow-none"
        >
          <Play className="h-3.5 w-3.5 fill-black text-black" />
          <span>{isGenerating ? 'Compiling...' : 'Run Matrix'}</span>
        </Button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black border border-zinc-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
