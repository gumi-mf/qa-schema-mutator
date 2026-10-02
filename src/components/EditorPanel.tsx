import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HttpMethod } from '@/core/types';
import { Code2, Braces, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

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
        summary: `${propsCount} properties, ${reqCount} required`,
        error: null,
      };
    } catch (err: any) {
      return {
        isValid: false,
        summary: 'Invalid JSON Syntax',
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
        summary: 'Invalid JSON Syntax',
        error: err.message,
      };
    }
  }, [payloadInput]);

  // Jakob's Law: Distinct Method Badges
  const getMethodBadgeClass = (method: HttpMethod) => {
    switch (method) {
      case 'POST':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 hover:bg-emerald-900/60';
      case 'PUT':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50 hover:bg-amber-900/60';
      case 'PATCH':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50 hover:bg-cyan-900/60';
      case 'DELETE':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/50 hover:bg-rose-900/60';
      default:
        return 'bg-blue-950/80 text-blue-400 border-blue-500/50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Jakob's Law: HTTP Method Badge Directly Adjacent to Endpoint Input Path */}
      <div className="p-3 bg-slate-900/90 border-b border-neutral-800 flex items-center gap-2">
        <div className="relative">
          <select
            value={endpointConfig.method}
            onChange={(e) => setEndpointConfig({ method: e.target.value as HttpMethod })}
            className={`font-mono font-bold text-xs px-3 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none transition-colors ${getMethodBadgeClass(
              endpointConfig.method
            )}`}
          >
            <option value="POST" className="bg-slate-900 text-emerald-400">POST</option>
            <option value="PUT" className="bg-slate-900 text-amber-400">PUT</option>
            <option value="PATCH" className="bg-slate-900 text-cyan-400">PATCH</option>
            <option value="GET" className="bg-slate-900 text-blue-400">GET</option>
            <option value="DELETE" className="bg-slate-900 text-rose-400">DELETE</option>
          </select>
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={endpointConfig.url}
            onChange={(e) => setEndpointConfig({ url: e.target.value })}
            className="w-full bg-slate-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
            placeholder="https://api.example.com/v1/resource"
          />
        </div>
      </div>

      {/* Zone 1 Navigation: Schema vs Sample Payload vs Headers */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col flex-1">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-neutral-800">
          <TabsList className="bg-slate-900 border border-neutral-800">
            <TabsTrigger value="schema" className="gap-2 text-xs font-mono">
              <Code2 className="h-3.5 w-3.5" />
              <span>JSON Schema</span>
              {schemaValidation.isValid ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <AlertCircle className="h-3 w-3 text-rose-400" />
              )}
            </TabsTrigger>

            <TabsTrigger value="payload" className="gap-2 text-xs font-mono">
              <Braces className="h-3.5 w-3.5" />
              <span>Sample Payload</span>
              {payloadValidation.isValid ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <AlertCircle className="h-3 w-3 text-rose-400" />
              )}
            </TabsTrigger>

            <TabsTrigger value="headers" className="gap-2 text-xs font-mono">
              <Sliders className="h-3.5 w-3.5" />
              <span>Headers & Auth</span>
            </TabsTrigger>
          </TabsList>

          {/* Doherty instant inline validation badge */}
          <Badge
            variant="outline"
            className={`text-[11px] font-mono border-neutral-800 ${
              activeTab === 'schema'
                ? schemaValidation.isValid
                  ? 'text-emerald-400 bg-emerald-950/30'
                  : 'text-rose-400 bg-rose-950/30'
                : activeTab === 'payload'
                ? payloadValidation.isValid
                  ? 'text-emerald-400 bg-emerald-950/30'
                  : 'text-rose-400 bg-rose-950/30'
                : 'text-slate-400 bg-slate-900'
            }`}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
              Endpoint Name / Purpose
            </label>
            <input
              type="text"
              value={endpointConfig.name}
              onChange={(e) => setEndpointConfig({ name: e.target.value })}
              className="w-full bg-slate-950 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Create User or Process Payment"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
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
              className="w-full bg-slate-950 border border-neutral-700 rounded-md p-3 text-xs text-slate-100 font-mono focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 leading-relaxed font-mono">
            🛡️ <strong>Zero-Cloud Mandate:</strong> 100% of JSON schema validation and AST mutations run locally in memory. No payloads or schemas leave your browser.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
