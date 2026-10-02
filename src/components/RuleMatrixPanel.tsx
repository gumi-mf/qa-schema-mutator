import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ALL_RULES } from '@/core/mutators/ruleRegistry';
import { RuleCategory, RuleSelectionState } from '@/core/types';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Ruler, Ban, ArrowLeftRight, CheckCheck, XCircle } from 'lucide-react';

export const RuleMatrixPanel: React.FC = () => {
  const { selectedRules, toggleRule, setAllRulesInCategory } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<RuleCategory>('boundary');

  const categories: Array<{ id: RuleCategory; label: string; icon: React.ReactNode }> = [
    { id: 'boundary', label: 'Boundary Limits', icon: <Ruler className="h-4 w-4" /> },
    { id: 'nullability', label: 'Null & Omission', icon: <Ban className="h-4 w-4" /> },
    { id: 'type_mismatch', label: 'Type Mismatches', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { id: 'unicode_fuzz', label: 'Unicode & Fuzzing', icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  const currentRules = ALL_RULES.filter((r) => r.category === activeCategory);
  const activeCountInCategory = currentRules.filter(
    (r) => selectedRules[r.id as keyof RuleSelectionState]
  ).length;

  return (
    <div className="flex flex-col h-full bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Category Selection Tabs */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Bulk select / deselect */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAllRulesInCategory(activeCategory, true)}
            className="h-7 px-2 text-xs text-slate-300 hover:text-emerald-400"
            title="Enable all rules in this category"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAllRulesInCategory(activeCategory, false)}
            className="h-7 px-2 text-xs text-slate-400 hover:text-red-400"
            title="Disable all rules in this category"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            None
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <ScrollArea className="flex-1 p-4 h-[480px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400 font-medium">
              Enabled in category: <span className="text-blue-400 font-bold">{activeCountInCategory}</span> / {currentRules.length}
            </span>
          </div>

          {currentRules.map((rule) => {
            const isEnabled = selectedRules[rule.id as keyof RuleSelectionState];

            return (
              <div
                key={rule.id}
                onClick={() => toggleRule(rule.id as keyof RuleSelectionState)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'bg-slate-900/90 border-slate-700/80 shadow-sm hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-900/80 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-200">{rule.name}</span>
                    <Badge
                      variant={
                        rule.severity === 'high'
                          ? 'destructive'
                          : rule.severity === 'medium'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-[10px] py-0 px-1.5"
                    >
                      {rule.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <div className="pt-0.5">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleRule(rule.id as keyof RuleSelectionState)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
