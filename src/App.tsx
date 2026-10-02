import React, { useEffect } from 'react';
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
  FileCode,
  Sliders,
  Eye,
  Share2,
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
    <div className="min-h-screen flex flex-col bg-[#070a10] text-slate-100 selection:bg-emerald-600/30 selection:text-emerald-200 font-sans">
      <Header />

      {/* Global Error Banner if invalid JSON */}
      {error && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-6 py-2.5 flex items-center justify-between text-xs text-rose-200 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Miller's Law: 4 Clearly Delineated Mental Zones Indicator */}
      <div className="bg-slate-950/90 border-b border-neutral-800/80 px-6 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-6 overflow-x-auto">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300">
              1
            </span>
            <span className="font-semibold text-slate-200">Input Stage</span>
          </div>
          <span className="text-neutral-700">→</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300">
              2
            </span>
            <span className="font-semibold text-slate-200">Mutation Config</span>
          </div>
          <span className="text-neutral-700">→</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300">
              3
            </span>
            <span className="font-semibold text-slate-200">Matrix Preview</span>
          </div>
          <span className="text-neutral-700">→</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300">
              4
            </span>
            <span className="font-semibold text-slate-200">Export Center</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100% Client-Side In-Memory AST Engine</span>
        </div>
      </div>

      {/* Main 3-Column Responsive Workspace */}
      <main className="flex-1 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
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
      <div className="fixed bottom-5 right-6 z-40 flex items-center gap-2 bg-slate-900/95 backdrop-blur border border-neutral-700/80 p-1.5 rounded-2xl shadow-2xl">
        <Button
          onClick={handleDownloadZip}
          variant="ghost"
          size="sm"
          className="h-10 px-3.5 text-xs font-mono font-bold text-slate-200 hover:text-white hover:bg-slate-800 gap-1.5 cursor-pointer"
          title="Download complete zip bundle"
        >
          <Box className="h-4 w-4 text-emerald-400" />
          <span className="hidden sm:inline">Zip Bundle</span>
        </Button>

        <Button
          onClick={executeGeneration}
          disabled={isGenerating}
          size="sm"
          className="h-10 px-4 text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer min-w-[44px]"
        >
          <Play className="h-3.5 w-3.5 fill-white" />
          <span>{isGenerating ? 'Compiling...' : 'Run Matrix'}</span>
        </Button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
