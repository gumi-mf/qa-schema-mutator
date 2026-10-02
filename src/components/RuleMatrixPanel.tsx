import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PRESET_PROFILES, ALL_RULES } from '@/core/mutators/ruleRegistry';
import { RuleCategory, RuleSelectionState } from '@/core/types';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Sliders, CheckCircle2 } from 'lucide-react';

export const RuleMatrixPanel: React.FC = () => {
  const {
    activePreset,
    applyPreset,
    selectedRules,
    toggleRule,
  } = useAppStore();

  const categories: Array<{ id: RuleCategory; label: string }> = [
    { id: 'boundary', label: '1. Boundary Limits' },
    { id: 'nullability', label: '2. Null & Omission' },
    { id: 'type_mismatch', label: '3. Type Mismatches' },
    { id: 'unicode_fuzz', label: '4. Unicode & Fuzzing' },
  ];

  const totalEnabled = Object.values(selectedRules).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-black border border-zinc-800 rounded-xl overflow-hidden">
      {/* Zone 2 Header */}
      <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-zinc-200 tracking-tight font-mono">
            Zone 2: Mutation Configuration
          </span>
          <p className="text-[11px] text-zinc-400 font-mono">
            3 Progressive Opinionated Presets (Hick's Law)
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono text-zinc-300 border-zinc-800 bg-zinc-900">
          {totalEnabled} Rules Active
        </Badge>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Hick's Law: 3 Progressive Presets Cards */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
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
                    ? 'border-white bg-zinc-900 ring-1 ring-white/20 text-white'
                    : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-400 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-white">
                      {preset.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-zinc-700 bg-zinc-800 text-zinc-200">
                      {preset.badge}
                    </Badge>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-zinc-300 leading-snug">
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Target Expected Status Code (Tesler's Law sensible defaults) */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
          <label className="block text-[11px] font-bold text-zinc-300 font-mono mb-1.5">
            Expected Edge-Case Failure Status:
          </label>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 font-mono text-xs font-semibold">
              400 Bad Request
            </span>
            <span className="text-xs text-zinc-500 font-mono">or</span>
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 font-mono text-xs font-semibold">
              422 Unprocessable
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-1.5">
            Auto-inferred: Generated Postman and Playwright assertions verify both RFC 7231 (400) and RFC 4918 (422) standards.
          </p>
        </div>

        {/* Secondary Accordion for Advanced Custom Overrides */}
        <div className="pt-2">
          <Accordion type="single" collapsible className="w-full border-t border-zinc-800">
            <AccordionItem value="advanced-rules" className="border-b-0">
              <AccordionTrigger className="text-xs font-mono font-bold text-zinc-300 hover:text-white py-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Custom Rule Overrides ({ALL_RULES.length} Rules)</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-2">
                {categories.map((cat) => {
                  const rulesInCat = ALL_RULES.filter((r) => r.category === cat.id);
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                        <span className="text-[11px] font-bold text-zinc-400 font-mono">
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
                                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 opacity-60'
                              }`}
                            >
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-medium text-zinc-200">
                                    {rule.name}
                                  </span>
                                  <Badge
                                    variant={
                                      rule.severity === 'high'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="text-[9px] py-0 px-1 font-mono"
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
