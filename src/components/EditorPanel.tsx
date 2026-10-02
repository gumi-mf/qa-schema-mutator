import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HttpMethod } from '@/core/types';
import { Code2, Braces, Sliders, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

export const EditorPanel: React.FC = () => {
  const {
    schemaInput,
    payloadInput,
    setSchemaInput,
    setPayloadInput,
    endpointConfig,
    setEndpointConfig,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'schema' | 'payload' | 'headers'>('schema');

  // Real-time inline schema & payload parsing (Doherty Threshold instant validation)
  const schemaValidation = useMemo(() => {
    try {
      const parsed = JSON.parse(schemaInput);
      const propsCount = parsed.properties ? Object.keys(parsed.properties).length : 0;
      const reqCount = Array.isArray(parsed.required) ? parsed.required.length : 0;
      return {
        isValid: true,
        summary: `${propsCount} props, ${reqCount} required`,
        error: null,
      };
    } catch (err: any) {
      return {
        isValid: false,
        summary: 'Invalid JSON',
        error: err.message,
      };
    }
  }, [schemaInput]);

  const payloadValidation = useMemo(() => {
    try {
      const parsed = JSON.parse(payloadInput);
      const keysCount = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0;
      return {
        isValid: true,
        summary: `${keysCount} keys detected`,
        error: null,
      };
    } catch (err: any) {
      return {
        isValid: false,
        summary: 'Invalid JSON',
        error: err.message,
      };
    }
  }, [payloadInput]);

  return (
    <div className="flex flex-col h-full bg-black border border-zinc-800 rounded-xl overflow-hidden">
      {/* Jakob's Law: HTTP Method Badge Directly Adjacent to Endpoint Input Path */}
      <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2">
        <div className="relative">
          <select
            value={endpointConfig.method}
            onChange={(e) => setEndpointConfig({ method: e.target.value as HttpMethod })}
            className="font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white appearance-none cursor-pointer focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="POST" className="bg-zinc-900 text-white">POST</option>
            <option value="PUT" className="bg-zinc-900 text-white">PUT</option>
            <option value="PATCH" className="bg-zinc-900 text-white">PATCH</option>
            <option value="GET" className="bg-zinc-900 text-white">GET</option>
            <option value="DELETE" className="bg-zinc-900 text-white">DELETE</option>
          </select>
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={endpointConfig.url}
            onChange={(e) => setEndpointConfig({ url: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
            placeholder="https://api.example.com/v1/resource"
          />
        </div>
      </div>

      {/* Zone 1 Navigation: Schema vs Sample Payload vs Headers */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col flex-1">
        <div className="flex items-center justify-between px-3 py-2 bg-black border-b border-zinc-800">
          <TabsList className="bg-zinc-950 border border-zinc-800">
            <TabsTrigger value="schema" className="gap-2 text-xs font-mono">
              <Code2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>JSON Schema</span>
              {schemaValidation.isValid ? (
                <CheckCircle2 className="h-3 w-3 text-zinc-400" />
              ) : (
                <AlertCircle className="h-3 w-3 text-zinc-500" />
              )}
            </TabsTrigger>

            <TabsTrigger value="payload" className="gap-2 text-xs font-mono">
              <Braces className="h-3.5 w-3.5 text-zinc-400" />
              <span>Sample Payload</span>
              {payloadValidation.isValid ? (
                <CheckCircle2 className="h-3 w-3 text-zinc-400" />
              ) : (
                <AlertCircle className="h-3 w-3 text-zinc-500" />
              )}
            </TabsTrigger>

            <TabsTrigger value="headers" className="gap-2 text-xs font-mono">
              <Sliders className="h-3.5 w-3.5 text-zinc-400" />
              <span>Headers & Auth</span>
            </TabsTrigger>
          </TabsList>

          {/* Doherty instant inline validation badge */}
          <Badge
            variant="outline"
            className="text-[11px] font-mono border-zinc-800 bg-zinc-900 text-zinc-300"
          >
            {activeTab === 'schema'
              ? schemaValidation.summary
              : activeTab === 'payload'
              ? payloadValidation.summary
              : `${Object.keys(endpointConfig.headers || {}).length} Headers`}
          </Badge>
        </div>

        {/* Tab 1: Schema Editor */}
        <TabsContent value="schema" className="mt-0 flex-1 min-h-[460px]">
          <Editor
            height="100%"
            language="json"
            theme="vs-dark"
            value={schemaInput}
            onChange={(val) => setSchemaInput(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 12.5,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Geist Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              formatOnPaste: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </TabsContent>

        {/* Tab 2: Sample Payload Editor */}
        <TabsContent value="payload" className="mt-0 flex-1 min-h-[460px]">
          <Editor
            height="100%"
            language="json"
            theme="vs-dark"
            value={payloadInput}
            onChange={(val) => setPayloadInput(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 12.5,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Geist Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              formatOnPaste: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </TabsContent>

        {/* Tab 3: Headers & Configuration */}
        <TabsContent value="headers" className="mt-0 p-4 space-y-4 flex-1 overflow-auto">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 font-mono">
              Endpoint Name / Purpose
            </label>
            <input
              type="text"
              value={endpointConfig.name}
              onChange={(e) => setEndpointConfig({ name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-100 font-mono focus:border-zinc-600 focus:outline-none"
              placeholder="e.g. Create User or Process Payment"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 font-mono">
              Request Headers (JSON)
            </label>
            <textarea
              rows={4}
              value={JSON.stringify(endpointConfig.headers, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setEndpointConfig({ headers: parsed });
                } catch {
                  // ignore while typing
                }
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-xs text-zinc-100 font-mono focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 leading-relaxed font-mono flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Zero-Cloud Mandate:</strong> 100% of JSON schema validation and AST mutations run locally in memory. No payloads or schemas leave your browser.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
