import React from 'react';
import { SAMPLE_APIS } from '@/templates/sampleApis';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Play, Download, Check, Sparkles, Box } from 'lucide-react';
import { generateTestBundleZip } from '@/core/compilers/bundleExporter';

export const Header: React.FC = () => {
  const {
    selectedTemplateId,
    loadTemplate,
    endpointConfig,
    executeGeneration,
    isGenerating,
    generatedSuite,
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
      showToast('Downloaded complete Test Bundle (.zip) with Playwright & Postman suites!');
    } catch {
      showToast('Failed to compile zip bundle');
    }
  };

  return (
    <header className="border-b border-neutral-800 bg-[#080c14] px-6 py-3 flex flex-wrap items-center justify-between gap-4 relative z-20 w-full">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-100 tracking-tight font-mono">
              SentinelPayload
            </h1>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-950/40 font-mono">
              Client-Side AST
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            API Schema Mutation & Automated Postman (v2.1) + Playwright (.spec.ts) Synthesizer
          </p>
        </div>
      </div>

      {/* Middle & Right CTA Section */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Preset Sample APIs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-neutral-800 rounded-lg p-1">
          <span className="text-xs text-slate-400 px-2 font-medium">Templates:</span>
          {SAMPLE_APIS.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => loadTemplate(tmpl)}
              className={`text-xs px-2.5 py-1.5 rounded-md transition-colors font-medium cursor-pointer ${
                selectedTemplateId === tmpl.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* Download Zip Bundle (Fitts's Law 44px target) */}
        {generatedSuite && (
          <Button
            onClick={handleDownloadZip}
            variant="outline"
            className="h-11 px-4 text-xs font-semibold gap-2 border-neutral-700 bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer shadow-sm min-w-[44px]"
            title="Download Test Bundle (.zip) with Playwright suite, config, and Postman collection"
          >
            <Box className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Download Bundle (.zip)</span>
          </Button>
        )}

        {/* Primary High-Contrast Execution Target (Fitts's Law >= 44x44px bounding box) */}
        <Button
          onClick={executeGeneration}
          disabled={isGenerating}
          className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 gap-2 cursor-pointer transition-all active:scale-[0.98] min-w-[44px]"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>{isGenerating ? 'Synthesizing...' : 'Generate Test Matrix'}</span>
        </Button>
      </div>
    </header>
  );
};
