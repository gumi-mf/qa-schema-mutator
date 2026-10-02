import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HttpMethod } from '@/core/types';
import { Code2, Braces, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';

export const EditorPanel: React.FC = () => {
  const {
    schemaInput,
    payloadInput,
    setSchemaInput,
    setPayloadInput,
    endpointConfig,
    setEndpointConfig,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'schema' | 'payload' | 'endpoint'>('schema');

  // Syntax validation
  const isSchemaValid = (() => {
    try {
      JSON.parse(schemaInput);
      return true;
    } catch {
      return false;
    }
  })();

  const isPayloadValid = (() => {
    try {
      JSON.parse(payloadInput);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <div className="flex flex-col h-full bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-950 border border-slate-800">
              <TabsTrigger value="schema" className="gap-2">
                <Code2 className="h-3.5 w-3.5" />
                <span>JSON Schema</span>
                {isSchemaValid ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-400" />
                )}
              </TabsTrigger>
              <TabsTrigger value="payload" className="gap-2">
                <Braces className="h-3.5 w-3.5" />
                <span>Sample Payload</span>
                {isPayloadValid ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-400" />
                )}
              </TabsTrigger>
              <TabsTrigger value="endpoint" className="gap-2">
                <Settings2 className="h-3.5 w-3.5" />
                <span>Endpoint Config</span>
              </TabsTrigger>
            </TabsList>

            <Badge variant="outline" className="text-xs text-slate-400 border-slate-700 bg-slate-900 hidden sm:inline-flex">
              {activeTab === 'schema'
                ? isSchemaValid
                  ? 'Valid Schema'
                  : 'JSON Syntax Error'
                : activeTab === 'payload'
                ? isPayloadValid
                  ? 'Valid Payload'
                  : 'JSON Syntax Error'
                : `${endpointConfig.method} Target`}
            </Badge>
          </div>

          <TabsContent value="schema" className="mt-0 h-[480px]">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={schemaInput}
              onChange={(value) => setSchemaInput(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12.5,
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </TabsContent>

          <TabsContent value="payload" className="mt-0 h-[480px]">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={payloadInput}
              onChange={(value) => setPayloadInput(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12.5,
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </TabsContent>

          <TabsContent value="endpoint" className="mt-0 p-5 h-[480px] overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Endpoint Name
              </label>
              <input
                type="text"
                value={endpointConfig.name}
                onChange={(e) => setEndpointConfig({ name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Create User or Process Payment"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  HTTP Method
                </label>
                <select
                  value={endpointConfig.method}
                  onChange={(e) => setEndpointConfig({ method: e.target.value as HttpMethod })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="GET">GET</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Endpoint URL
                </label>
                <input
                  type="text"
                  value={endpointConfig.url}
                  onChange={(e) => setEndpointConfig({ url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://api.example.com/v1/resource"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Request Headers (JSON)
              </label>
              <textarea
                rows={4}
                value={JSON.stringify(endpointConfig.headers, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEndpointConfig({ headers: parsed });
                  } catch {
                    // Invalid JSON while typing
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-lg text-xs text-blue-300">
              💡 <strong>Interview Pro-Tip:</strong> In Postman, the URL automatically extracts into parameterized collection variables like <code>{'{{baseUrl}}'}</code>. In Playwright, it exports into an environment-driven variable <code>process.env.API_BASE_URL</code>.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
