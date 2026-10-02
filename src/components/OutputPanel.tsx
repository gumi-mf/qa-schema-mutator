import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockSandbox } from './MockSandbox';
import {
  Download,
  Copy,
  Check,
  Terminal,
  FileCode2,
  ListFilter,
  PlaySquare,
  Sparkles,
} from 'lucide-react';

export const OutputPanel: React.FC = () => {
  const { generatedSuite, activeTab, setActiveTab } = useAppStore();
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedVectorIndex, setSelectedVectorIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!generatedSuite) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center shadow-xl">
        <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">Suites Not Yet Synthesized</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-5">
          Select your target schema and edge-case rules, then click{' '}
          <strong className="text-blue-400">"Synthesize Suites"</strong> to compile both a Postman Collection (v2.1) and Playwright API Test Suite (.spec.ts).
        </p>
      </div>
    );
  }

  const { postmanCollectionJson, playwrightSpecCode, vectors, summary, baselineVector } = generatedSuite;

  return (
    <div className="flex flex-col h-full bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col h-full">
        {/* Top Tab Bar & Export Buttons */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 gap-2">
          <TabsList className="bg-slate-950 border border-slate-800">
            <TabsTrigger value="postman" className="gap-2 text-xs">
              <span className="text-amber-400 font-bold">📮</span>
              <span>Postman Collection</span>
            </TabsTrigger>
            <TabsTrigger value="playwright" className="gap-2 text-xs">
              <span className="text-emerald-400 font-bold">🎭</span>
              <span>Playwright (.spec.ts)</span>
            </TabsTrigger>
            <TabsTrigger value="vectors" className="gap-2 text-xs">
              <ListFilter className="h-3.5 w-3.5" />
              <span>Vectors ({vectors.length + 1})</span>
            </TabsTrigger>
            <TabsTrigger value="mock" className="gap-2 text-xs">
              <PlaySquare className="h-3.5 w-3.5 text-blue-400" />
              <span>Mock Sandbox</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Actions depending on active tab */}
          <div className="flex items-center gap-2">
            {activeTab === 'postman' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `newman run postman_collection.json --reporters cli`,
                      'newman-cmd'
                    )
                  }
                  className="h-8 text-xs gap-1.5"
                >
                  <Terminal className="h-3.5 w-3.5 text-amber-400" />
                  <span>{copiedType === 'newman-cmd' ? 'Copied CLI!' : 'Copy Newman CLI'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(postmanCollectionJson, 'postman-json')}
                  className="h-8 text-xs gap-1.5"
                >
                  {copiedType === 'postman-json' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>Copy JSON</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      postmanCollectionJson,
                      `${generatedSuite.endpoint.name.toLowerCase().replace(/\s+/g, '-')}-postman-collection.json`,
                      'application/json'
                    )
                  }
                  className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .json</span>
                </Button>
              </>
            )}

            {activeTab === 'playwright' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(`npx playwright test api-mutations.spec.ts`, 'playwright-cmd')
                  }
                  className="h-8 text-xs gap-1.5"
                >
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{copiedType === 'playwright-cmd' ? 'Copied CLI!' : 'Copy Test CLI'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(playwrightSpecCode, 'playwright-ts')}
                  className="h-8 text-xs gap-1.5"
                >
                  {copiedType === 'playwright-ts' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>Copy TypeScript</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      playwrightSpecCode,
                      `${generatedSuite.endpoint.name.toLowerCase().replace(/\s+/g, '-')}.spec.ts`,
                      'text/typescript'
                    )
                  }
                  className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .spec.ts</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Postman Editor */}
        <TabsContent value="postman" className="mt-0 h-[480px]">
          <Editor
            height="100%"
            language="json"
            theme="vs-dark"
            value={postmanCollectionJson}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </TabsContent>

        {/* Tab 2: Playwright Editor */}
        <TabsContent value="playwright" className="mt-0 h-[480px]">
          <Editor
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={playwrightSpecCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </TabsContent>

        {/* Tab 3: Test Vectors List & Inspector */}
        <TabsContent value="vectors" className="mt-0 h-[480px] p-4 overflow-y-auto">
          <div className="space-y-3">
            {/* Baseline vector item */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px]">
                    200 / 201 OK
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-300">
                    {baselineVector.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Baseline happy path payload against schema
                </p>
              </div>
            </div>

            {/* Mutated vectors */}
            {vectors.map((vec, index) => (
              <div
                key={vec.id}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" className="text-[10px]">
                      {vec.expectedStatus} Rejection
                    </Badge>
                    <span className="text-xs font-semibold text-slate-200">{vec.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {vec.fieldPointer}
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {vec.description}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Rule: <code className="text-blue-400">{vec.ruleId}</code>
                  </span>
                  <button
                    onClick={() =>
                      setSelectedVectorIndex(selectedVectorIndex === index ? null : index)
                    }
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    {selectedVectorIndex === index ? 'Hide Payload' : 'View Mutated Payload'}
                  </button>
                </div>

                {selectedVectorIndex === index && (
                  <pre className="mt-2.5 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-auto max-h-[160px]">
                    {JSON.stringify(vec.mutatedPayload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Mock Sandbox */}
        <TabsContent value="mock" className="mt-0 h-[480px]">
          <MockSandbox />
        </TabsContent>
      </Tabs>
    </div>
  );
};
