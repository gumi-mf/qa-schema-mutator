import React from 'react';
import { SAMPLE_APIS } from '@/templates/sampleApis';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Play, Box } from 'lucide-react';
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
    <header className="border-b border-zinc-800 bg-black px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 relative z-20 w-full">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight font-mono">
              SentinelPayload
            </h1>
            <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800 bg-zinc-950 font-mono py-0">
              Client-Side AST
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            API Schema Mutation & Automated Postman (v2.1) + Playwright (.spec.ts) Synthesizer
          </p>
        </div>
      </div>

      {/* Middle & Right CTA Section */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Preset Sample APIs */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
          <span className="text-xs text-zinc-400 px-2 font-mono">Presets:</span>
          {SAMPLE_APIS.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => loadTemplate(tmpl)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-mono font-medium cursor-pointer ${
                selectedTemplateId === tmpl.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
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
            className="h-9 px-3.5 text-xs font-mono font-medium gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 cursor-pointer min-w-[44px]"
            title="Download Test Bundle (.zip) with Playwright suite, config, and Postman collection"
          >
            <Box className="h-3.5 w-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Bundle (.zip)</span>
          </Button>
        )}

        {/* Primary High-Contrast Execution Target (Fitts's Law >= 44x44px bounding box) */}
        <Button
          onClick={executeGeneration}
          disabled={isGenerating}
          className="h-9 px-4 bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 font-bold text-xs gap-2 cursor-pointer transition-all active:scale-[0.98] min-w-[44px] shadow-none"
        >
          <Play className="h-3.5 w-3.5 fill-black text-black" />
          <span>{isGenerating ? 'Synthesizing...' : 'Generate Test Matrix'}</span>
        </Button>
      </div>
    </header>
  );
};
