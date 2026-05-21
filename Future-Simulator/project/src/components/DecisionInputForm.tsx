import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Target,
  UserRound,
  X,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { StepProgressBar } from './visuals/JourneyPath';
import { useState, type KeyboardEvent } from 'react';
import { useScrollToTopOnChange } from '../hooks/useScrollToTopOnChange';
import {
  isSectionComplete,
  sectionMissingHints,
  type DecisionFormSection,
} from '../lib/decisionForm';
import { isFinancialDecision } from '../lib/decisionTopics';
import { isGrokConfigured } from '../lib/grok';
import { formatCurrency } from '../lib/simulation';
import type { DecisionInput } from '../types';

type Section = DecisionFormSection;

interface DecisionInputFormProps {
  decision: DecisionInput;
  onChange: (patch: Partial<DecisionInput>) => void;
  onSimulate: () => void;
  onReset: () => void;
  isRunning: boolean;
}

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const t = draft.trim();
    if (t && !tags.includes(t)) onAdd(t);
    setDraft('');
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border border-app-border bg-app-raised px-2.5 py-1 text-xs text-app-text"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="rounded-full hover:bg-app-border"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          placeholder={placeholder}
          className="field-input flex-1"
        />
        <button type="button" onClick={commit} className="btn-secondary px-3 py-2">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function TextArea({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
  large,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
  large?: boolean;
}) {
  return (
    <label className="block w-full space-y-2">
      <div>
        <span className="field-label">{label}</span>
        {hint && <p className="text-xs text-app-muted">{hint}</p>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={large ? 4 : rows}
        placeholder={placeholder}
        className={`field-textarea w-full ${large ? 'min-h-[88px]' : 'min-h-0'}`}
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="field-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="field-input"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-app-surface">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const SECTIONS: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'decision', label: 'Decision', icon: Target },
  { id: 'context', label: 'Context', icon: UserRound },
  { id: 'constraints', label: 'Constraints', icon: Shield },
  { id: 'finetune', label: 'Fine-tune', icon: SlidersHorizontal },
];

const SECTION_ORDER: Section[] = ['decision', 'context', 'constraints', 'finetune'];

export function DecisionInputForm({
  decision,
  onChange,
  onSimulate,
  onReset,
  isRunning,
}: DecisionInputFormProps) {
  const [section, setSection] = useState<Section>('decision');
  useScrollToTopOnChange(section);
  const sectionIndex = SECTIONS.findIndex((s) => s.id === section) + 1;
  const sectionIdx = SECTION_ORDER.indexOf(section);
  const isLastSection = section === 'finetune';
  const financial = isFinancialDecision(decision);

  const sectionComplete = isSectionComplete(section, decision);
  const missing = sectionMissingHints(section, decision);
  const nextSection = SECTION_ORDER[sectionIdx + 1];
  const nextSectionLabel = SECTIONS.find((s) => s.id === nextSection)?.label;

  const goNext = () => {
    if (sectionIdx < SECTION_ORDER.length - 1) {
      setSection(SECTION_ORDER[sectionIdx + 1]);
    }
  };

  const goBack = () => {
    if (sectionIdx > 0) {
      setSection(SECTION_ORDER[sectionIdx - 1]);
    }
  };

  return (
    <section className="card w-full overflow-hidden">
      <div className="border-b border-app-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {(() => {
              const active = SECTIONS.find((s) => s.id === section);
              const Icon = active?.icon ?? Target;
              return (
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-app-accent/30 bg-app-accent/10 text-teal-900">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
              );
            })()}
            <div>
              <h2 className="text-base font-medium text-app-text">
                {SECTIONS.find((s) => s.id === section)?.label ?? 'Inputs'}
              </h2>
              <span className="font-mono text-[10px] tabular-nums text-app-muted">
                {sectionIndex}/{SECTIONS.length}
              </span>
            </div>
          </div>
        </div>
        <StepProgressBar
          className="mt-4"
          current={sectionIndex}
          total={SECTIONS.length}
        />
        {!sectionComplete && missing.length > 0 && (
          <div className="alert-warning mt-3 flex items-start gap-2 px-3 py-2">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-700" aria-hidden />
            <p className="alert-warning-text">{missing.join(' · ')}</p>
          </div>
        )}
        <div
          className="mt-4 flex flex-wrap gap-1 rounded-lg border border-app-border bg-app-bg p-1"
          role="tablist"
          aria-label="Input sections"
        >
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={section === s.id}
                onClick={() => setSection(s.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  section === s.id
                    ? 'bg-app-accent/20 text-teal-900'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {section === 'decision' && (
          <>
            <TextArea
              large
              label="Decision being considered"
              hint="The choice you're weighing — be specific."
              value={decision.decisionConsidered}
              onChange={(decisionConsidered) => onChange({ decisionConsidered })}
              placeholder="Describe the choice you're weighing…"
            />
            <TextArea
              label="Desired outcome"
              value={decision.desiredOutcome}
              onChange={(desiredOutcome) => onChange({ desiredOutcome })}
              placeholder="What does success look like in 1–5 years?"
            />
            <TextArea
              label="Biggest fear"
              value={decision.biggestFear}
              onChange={(biggestFear) => onChange({ biggestFear })}
              placeholder="What keeps you up at night about this decision?"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Timeframe"
                value={decision.timeframe}
                options={[
                  { value: '6months', label: '6 months' },
                  { value: '1year', label: '1 year' },
                  { value: '3years', label: '3 years' },
                  { value: '5years', label: '5 years' },
                  { value: '10years', label: '10 years' },
                ]}
                onChange={(timeframe) => onChange({ timeframe })}
              />
              <SelectField
                label="Risk tolerance"
                value={decision.riskTolerance}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                onChange={(riskTolerance) => onChange({ riskTolerance })}
              />
            </div>
          </>
        )}

        {section === 'context' && (
          <>
            <TextArea
              large
              label="Current situation"
              value={decision.currentSituation}
              onChange={(currentSituation) => onChange({ currentSituation })}
              placeholder="Where you are today — job, studies, income, relationships..."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Financial status"
                value={decision.financialStatus}
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'stable', label: 'Stable' },
                  { value: 'tight', label: 'Tight' },
                  { value: 'critical', label: 'Critical' },
                ]}
                onChange={(financialStatus) => onChange({ financialStatus })}
              />
              <SelectField
                label="Emotional state"
                value={decision.emotionalState}
                options={[
                  { value: 'excited', label: 'Excited' },
                  { value: 'hopeful', label: 'Hopeful' },
                  { value: 'confident', label: 'Confident' },
                  { value: 'uncertain', label: 'Uncertain' },
                  { value: 'anxious', label: 'Anxious' },
                  { value: 'burned_out', label: 'Burned out' },
                ]}
                onChange={(emotionalState) => onChange({ emotionalState })}
              />
            </div>
            <label className="block space-y-2">
              <div className="flex justify-between text-sm">
                <span className="field-label">Confidence level</span>
                <span className="font-mono text-sm font-medium text-teal-900">
                  {decision.confidenceLevel}/10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={decision.confidenceLevel}
                onChange={(e) =>
                  onChange({ confidenceLevel: Number(e.target.value) })
                }
                className="w-full"
              />
            </label>
            <SelectField
              label="Relationships impact"
              value={decision.relationshipsImpact}
              options={[
                { value: 'minimal', label: 'Minimal' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'significant', label: 'Significant' },
                { value: 'critical', label: 'Critical' },
              ]}
              onChange={(relationshipsImpact) => onChange({ relationshipsImpact })}
            />
            <TextArea
              label="Existing skills"
              value={decision.existingSkills}
              onChange={(existingSkills) => onChange({ existingSkills })}
              placeholder="Skills that help or transfer to this path"
            />
            <div className="w-full">
              <span className="mb-2 block field-label">Skill tags</span>
              <TagInput
                tags={decision.skillTags}
                onAdd={(tag) =>
                  onChange({ skillTags: [...decision.skillTags, tag] })
                }
                onRemove={(tag) =>
                  onChange({
                    skillTags: decision.skillTags.filter((t) => t !== tag),
                  })
                }
                placeholder="Add skill, press Enter"
              />
            </div>
          </>
        )}

        {section === 'constraints' && (
          <>
            <TextArea
              rows={4}
              label="External constraints"
              hint="People, legal, money, or time limits you cannot ignore."
              value={decision.externalConstraints}
              onChange={(externalConstraints) => onChange({ externalConstraints })}
              placeholder="Family expectations, visa, lease, debt, health..."
            />
            <div className="w-full">
              <span className="mb-2 block field-label">Constraint tags</span>
              <TagInput
                tags={decision.constraintTags}
                onAdd={(tag) =>
                  onChange({ constraintTags: [...decision.constraintTags, tag] })
                }
                onRemove={(tag) =>
                  onChange({
                    constraintTags: decision.constraintTags.filter((t) => t !== tag),
                  })
                }
                placeholder="e.g. Family pressure"
              />
            </div>
          </>
        )}

        {section === 'finetune' && (
          <div className="grid max-w-xl gap-6">
            <label className="block space-y-2">
              <div className="flex justify-between text-sm">
                <span className="field-label">Current age</span>
                <span className="font-mono text-sm font-medium text-teal-900">{decision.currentAge}</span>
              </div>
              <input
                type="range"
                min={16}
                max={65}
                value={decision.currentAge}
                onChange={(e) => onChange({ currentAge: Number(e.target.value) })}
                className="w-full"
              />
            </label>
            {financial ? (
              <>
                <label className="block space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="field-label">Annual income</span>
                    <span className="font-mono text-sm font-medium text-teal-900">
                      {formatCurrency(decision.annualIncome)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200_000}
                    step={2_000}
                    value={decision.annualIncome}
                    onChange={(e) => onChange({ annualIncome: Number(e.target.value) })}
                    className="w-full"
                  />
                </label>
                <label className="block space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="field-label">Monthly savings</span>
                    <span className="font-mono text-sm font-medium text-teal-900">
                      {formatCurrency(decision.monthlySavings)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5_000}
                    step={50}
                    value={decision.monthlySavings}
                    onChange={(e) => onChange({ monthlySavings: Number(e.target.value) })}
                    className="w-full"
                  />
                </label>
              </>
            ) : (
              <p className="text-sm text-app-muted">
                Income and savings sliders are skipped — your decision isn&apos;t tagged as
                financial. Mention money in your decision text if you want wealth projections.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-app-border p-4">
        {sectionIdx > 0 && (
          <button
            type="button"
            onClick={goBack}
            disabled={isRunning}
            className="btn-secondary px-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}
        {isLastSection ? (
          <button
            type="button"
            onClick={onSimulate}
            disabled={isRunning || !decision.decisionConsidered.trim()}
            className="btn-primary flex-1"
          >
            <Play className="h-4 w-4" strokeWidth={1.75} />
            {isRunning
              ? isGrokConfigured()
                ? 'Grok is analyzing your futures…'
                : 'Running analysis…'
              : 'Run simulation'}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={isRunning}
            className="btn-primary flex-1"
            aria-label={nextSectionLabel ? `Continue to ${nextSectionLabel}` : 'Continue'}
          >
            Continue to {nextSectionLabel ?? 'next'}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary px-5"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
