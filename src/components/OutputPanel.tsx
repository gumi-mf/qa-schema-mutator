import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockSandbox } from './MockSandbox';
import { generateTestBundleZip } from '@/core/compilers/bundleExporter';
import {
  Download,
  Copy,
  Check,
  Terminal,
  FileCode2,
  ListFilter,
  PlaySquare,
  Sparkles,
  Box,
  Clock,
  Layers,
  Code,
  FileJson,
} from 'lucide-react';

export const OutputPanel: React.FC = () => {
  const {
    generatedSuite,
    activeTab,
    setActiveTab,
    showToast,
    generationLatencyMs,
  } = useAppStore();

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedVectorIndex, setSelectedVectorIndex] = useState<number | null>(0);

  const copyToClipboard = (text: string, type: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const downloadFile = (content: string, filename: string, mime: string, label: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${label}`);
  };

  const handleDownloadZip = async () => {
    if (!generatedSuite) return;
    try {
      const zipBlob = await generateTestBundleZip(generatedSuite);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (generatedSuite.endpoint.name || 'api').toLowerCase().replace(/[^a-z0-9]+/g, '-');
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

  if (!generatedSuite) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-[#0a0e17] border border-neutral-800 rounded-xl p-8 text-center shadow-2xl">
        <Sparkles className="h-8 w-8 text-emerald-400 mb-3" />
        <h3 className="text-sm font-bold text-slate-200 font-mono">Test Matrix Pending</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Click <strong>"Generate Test Matrix"</strong> to compile Postman v2.1 and Playwright suites.
        </p>
      </div>
    );
  }

  const { postmanCollectionJson, playwrightSpecCode, vectors, summary, baselineVector, endpoint } = generatedSuite;

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Peak-End Rule & Doherty Metric Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border-b border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-300 font-mono gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Generated <strong className="text-white">{vectors.length + 1} test cases</strong> (
            <span className="text-amber-400">{summary.byCategory.boundary} BVA</span>,{' '}
            <span className="text-purple-400">{summary.byCategory.nullability + summary.byCategory.type_mismatch} Schema</span>,{' '}
            <span className="text-rose-400">{summary.byCategory.unicode_fuzz} Fuzz</span>)
          </span>
          <span className="text-slate-600">in</span>
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-950/40 py-0">
            {generationLatencyMs}ms
          </Badge>
        </div>

        {/* Fitts's Law 44px Download Bundle CTA */}
        <Button
          size="sm"
          onClick={handleDownloadZip}
          className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer font-mono"
        >
          <Box className="h-3.5 w-3.5" />
          <span>Download Test Bundle (.zip)</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col flex-1">
        {/* Navigation Tabs (Miller's Law Zones 3 & 4) */}
        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950 border-b border-neutral-800 gap-2">
          <TabsList className="bg-slate-900 border border-neutral-800">
            <TabsTrigger value="postman" className="gap-2 text-xs font-mono">
              <FileJson className="h-3.5 w-3.5 text-amber-400" />
              <span>Postman Collection</span>
            </TabsTrigger>
            <TabsTrigger value="playwright" className="gap-2 text-xs font-mono">
              <Code className="h-3.5 w-3.5 text-emerald-400" />
              <span>Playwright (.spec.ts)</span>
            </TabsTrigger>
            <TabsTrigger value="vectors" className="gap-2 text-xs font-mono">
              <ListFilter className="h-3.5 w-3.5 text-cyan-400" />
              <span>Matrix Preview ({vectors.length + 1})</span>
            </TabsTrigger>
            <TabsTrigger value="mock" className="gap-2 text-xs font-mono">
              <PlaySquare className="h-3.5 w-3.5 text-purple-400" />
              <span>Live Mock Sandbox</span>
            </TabsTrigger>
          </TabsList>

          {/* Action buttons with Fitts's Law minimum tap accessibility */}
          <div className="flex items-center gap-2">
            {activeTab === 'postman' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `npx newman run postman_collection.json --reporters cli`,
                      'newman-cmd',
                      'Newman CLI command'
                    )
                  }
                  className="h-8 text-xs font-mono gap-1.5 border-neutral-700 bg-slate-900 hover:bg-slate-800"
                >
                  <Terminal className="h-3.5 w-3.5 text-amber-400" />
                  <span>{copiedType === 'newman-cmd' ? 'Copied!' : 'Newman CLI'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(postmanCollectionJson, 'postman-json', 'Postman Collection JSON')}
                  className="h-8 text-xs font-mono gap-1.5 border-neutral-700 bg-slate-900 hover:bg-slate-800"
                >
                  {copiedType === 'postman-json' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      postmanCollectionJson,
                      `${endpoint.name.toLowerCase().replace(/\s+/g, '-')}-postman.json`,
                      'application/json',
                      'Postman Collection JSON'
                    )
                  }
                  className="h-8 text-xs font-mono gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Postman</span>
                </Button>
              </>
            )}

            {activeTab === 'playwright' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(`npx playwright test`, 'pw-cmd', 'Playwright CLI command')
                  }
                  className="h-8 text-xs font-mono gap-1.5 border-neutral-700 bg-slate-900 hover:bg-slate-800"
                >
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{copiedType === 'pw-cmd' ? 'Copied!' : 'Playwright CLI'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(playwrightSpecCode, 'pw-ts', 'Playwright TypeScript Code')}
                  className="h-8 text-xs font-mono gap-1.5 border-neutral-700 bg-slate-900 hover:bg-slate-800"
                >
                  {copiedType === 'pw-ts' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      playwrightSpecCode,
                      `${endpoint.name.toLowerCase().replace(/\s+/g, '-')}.spec.ts`,
                      'text/typescript',
                      'Playwright .spec.ts suite'
                    )
                  }
                  className="h-8 text-xs font-mono gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Playwright</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Postman Editor (Zone 4) */}
        <TabsContent value="postman" className="mt-0 flex-1 min-h-[460px]">
          <Editor
            height="100%"
            language="json"
            theme="vs-dark"
            value={postmanCollectionJson}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Geist Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </TabsContent>

        {/* Tab 2: Playwright Editor (Zone 4) */}
        <TabsContent value="playwright" className="mt-0 flex-1 min-h-[460px]">
          <Editor
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={playwrightSpecCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Geist Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </TabsContent>

        {/* Tab 3: Matrix Preview & Live Diffs (Zone 3: Matrix Preview) */}
        <TabsContent value="vectors" className="mt-0 flex-1 min-h-[460px] p-4 overflow-y-auto space-y-3">
          {/* Baseline Happy Path Card */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/60 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] font-mono">
                  {baselineVector.expectedStatus} OK
                </Badge>
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  {baselineVector.name}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Baseline (Contract Master)
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Happy path payload verifying successful creation/response against schema contract.
            </p>
          </div>

          {/* Mutated Edge-Case Matrix with Live Diff Inspector */}
          <div className="space-y-2.5">
            {vectors.map((vec, idx) => {
              const isExpanded = selectedVectorIndex === idx;
              return (
                <div
                  key={vec.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded
                      ? 'border-neutral-700 bg-slate-900/90 shadow-lg'
                      : 'border-neutral-800/80 bg-slate-950/60 hover:border-neutral-700'
                  }`}
                >
                  <div
                    onClick={() => setSelectedVectorIndex(isExpanded ? null : idx)}
                    className="p-3 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning" className="text-[10px] font-mono">
                          {vec.expectedStatus} Rejection
                        </Badge>
                        <span className="text-xs font-bold text-slate-200 font-mono">
                          {vec.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {vec.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {vec.fieldPointer}
                      </Badge>
                      <button className="text-xs text-blue-400 font-mono hover:underline">
                        {isExpanded ? 'Hide Diff' : 'View Diff'}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Live Diff against Baseline */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-neutral-800/80 mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-neutral-800">
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">
                            Baseline Value:
                          </span>
                          <pre className="text-emerald-400 overflow-auto max-h-24">
                            {JSON.stringify(vec.originalValue, null, 2)}
                          </pre>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-900/40">
                          <span className="text-[10px] text-rose-400 font-bold block mb-1">
                            Mutated Edge-Case Value:
                          </span>
                          <pre className="text-rose-300 overflow-auto max-h-24">
                            {JSON.stringify(vec.mutatedValue, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block mb-1 font-mono">
                          Full Mutated Payload:
                        </span>
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-neutral-800 text-[11px] text-slate-300 font-mono overflow-auto max-h-36">
                          {JSON.stringify(vec.mutatedPayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 4: Mock Sandbox */}
        <TabsContent value="mock" className="mt-0 flex-1 min-h-[460px]">
          <MockSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
};
