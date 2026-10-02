import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PRESET_PROFILES, ALL_RULES, PresetProfileId } from '@/core/mutators/ruleRegistry';
import { RuleCategory, RuleSelectionState } from '@/core/types';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { ShieldCheck, Zap, FileSpreadsheet, Sliders, CheckCircle2 } from 'lucide-react';

export const RuleMatrixPanel: React.FC = () => {
  const {
    activePreset,
    applyPreset,
    selectedRules,
    toggleRule,
    targetExpectedStatus,
    setEndpointConfig,
  } = useAppStore();

  const categories: Array<{ id: RuleCategory; label: string }> = [
    { id: 'boundary', label: '1. Boundary Limits' },
    { id: 'nullability', label: '2. Null & Omission' },
    { id: 'type_mismatch', label: '3. Type Mismatches' },
    { id: 'unicode_fuzz', label: '4. Unicode & Fuzzing' },
  ];

  const totalEnabled = Object.values(selectedRules).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Zone 2 Header */}
      <div className="p-3 bg-slate-900/90 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-200 tracking-tight font-mono">
            Zone 2: Mutation Configuration
          </span>
          <p className="text-[11px] text-slate-400 font-mono">
            3 Progressive Opinionated Presets (Hick's Law)
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/40 bg-emerald-950/30">
          {totalEnabled} Rules Active
        </Badge>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Hick's Law: 3 Progressive Presets Cards */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
            Select Opinionated Preset:
          </label>

          {PRESET_PROFILES.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500/80 bg-gradient-to-r from-emerald-950/40 to-slate-900 shadow-md ring-1 ring-emerald-500/40'
                    : 'border-neutral-800 bg-slate-950/60 hover:border-neutral-700 hover:bg-slate-900/40 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 font-mono">
                      {preset.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-neutral-700 text-slate-300">
                      {preset.badge}
                    </Badge>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Target Expected Status Code (Tesler's Law sensible defaults) */}
        <div className="p-3 bg-slate-950/80 border border-neutral-800 rounded-lg">
          <label className="block text-[11px] font-bold text-slate-300 font-mono mb-1.5">
            Expected Edge-Case Failure Status:
          </label>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-amber-950/40 border border-amber-600/40 rounded text-amber-300 font-mono text-xs font-bold">
              400 Bad Request
            </span>
            <span className="text-xs text-slate-500 font-mono">or</span>
            <span className="px-2.5 py-1 bg-amber-950/40 border border-amber-600/40 rounded text-amber-300 font-mono text-xs font-bold">
              422 Unprocessable
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1.5">
            Auto-inferred: Generated Postman and Playwright assertions verify both RFC 7231 (400) and RFC 4918 (422) standards.
          </p>
        </div>

        {/* Secondary Accordion for Advanced Custom Overrides */}
        <div className="pt-2">
          <Accordion type="single" collapsible className="w-full border-t border-neutral-800">
            <AccordionItem value="advanced-rules" className="border-b-0">
              <AccordionTrigger className="text-xs font-mono font-bold text-slate-300 hover:text-emerald-400 py-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Custom Rule Overrides ({ALL_RULES.length} Rules)</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-2">
                {categories.map((cat) => {
                  const rulesInCat = ALL_RULES.filter((r) => r.category === cat.id);
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1">
                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                          {cat.label}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {rulesInCat.map((rule) => {
                          const isEnabled = selectedRules[rule.id as keyof RuleSelectionState];
                          return (
                            <div
                              key={rule.id}
                              onClick={() => toggleRule(rule.id as keyof RuleSelectionState)}
                              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isEnabled
                                  ? 'bg-slate-900/80 border-neutral-700'
                                  : 'bg-slate-950/40 border-neutral-900 opacity-50'
                              }`}
                            >
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-medium text-slate-200">
                                    {rule.name}
                                  </span>
                                  <Badge
                                    variant={
                                      rule.severity === 'high'
                                        ? 'destructive'
                                        : rule.severity === 'medium'
                                        ? 'warning'
                                        : 'secondary'
                                    }
                                    className="text-[9px] py-0 px-1"
                                  >
                                    {rule.severity}
                                  </Badge>
                                </div>
                              </div>

                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => toggleRule(rule.id as keyof RuleSelectionState)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};
