import { Play, RotateCcw } from 'lucide-react';
import { isGrokConfigured } from '../lib/grok';
import { formatCurrency } from '../lib/simulation';
import type { SimulationInput } from '../types';

interface ControlPanelProps {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  onSimulate: () => void;
  onReset: () => void;
  isRunning: boolean;
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-cyan-300">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400"
      />
    </label>
  );
}

export function ControlPanel({
  input,
  onChange,
  onSimulate,
  onReset,
  isRunning,
}: ControlPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-500/5 backdrop-blur">
      <h2 className="mb-1 text-lg font-semibold text-white">Scenario inputs</h2>
      <p className="mb-6 text-sm text-slate-400">
        Tune your present, then project optimistic, realistic, and pessimistic futures.
      </p>

      <div className="space-y-5">
        <SliderField
          label="Current age"
          value={input.currentAge}
          min={18}
          max={70}
          step={1}
          suffix=" yrs"
          onChange={(currentAge) => onChange({ currentAge })}
        />
        <SliderField
          label="Years ahead"
          value={input.yearsAhead}
          min={5}
          max={40}
          step={1}
          suffix=" yrs"
          onChange={(yearsAhead) => onChange({ yearsAhead })}
        />
        <label className="block space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Annual income</span>
            <span className="font-mono text-cyan-300">
              {formatCurrency(input.annualIncome)}
            </span>
          </div>
          <input
            type="range"
            min={30_000}
            max={300_000}
            step={5_000}
            value={input.annualIncome}
            onChange={(e) => onChange({ annualIncome: Number(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </label>
        <label className="block space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Monthly savings</span>
            <span className="font-mono text-cyan-300">
              {formatCurrency(input.monthlySavings)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={8_000}
            step={100}
            value={input.monthlySavings}
            onChange={(e) => onChange({ monthlySavings: Number(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </label>
        <SliderField
          label="Expected return"
          value={input.investmentReturn}
          min={2}
          max={12}
          step={0.5}
          suffix="%"
          onChange={(investmentReturn) => onChange({ investmentReturn })}
        />
        <SliderField
          label="Inflation"
          value={input.inflation}
          min={1}
          max={8}
          step={0.5}
          suffix="%"
          onChange={(inflation) => onChange({ inflation })}
        />

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Risk appetite</span>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ riskLevel: level })}
                className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${
                  input.riskLevel === level
                    ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Focus</span>
          <div className="grid grid-cols-3 gap-2">
            {(['wealth', 'career', 'balanced'] as const).map((focus) => (
              <button
                key={focus}
                type="button"
                onClick={() => onChange({ focus })}
                className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${
                  input.focus === focus
                    ? 'border-violet-400/60 bg-violet-500/20 text-violet-100'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                {focus}
              </button>
            ))}
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Life event or goal</span>
          <textarea
            value={input.lifeEvent}
            onChange={(e) => onChange({ lifeEvent: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/40 focus:ring-2"
            placeholder="e.g. Starting a freelancing business, new job, relocation..."
          />
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onSimulate}
          disabled={isRunning}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <Play className="h-4 w-4" />
          {isRunning
            ? isGrokConfigured()
              ? 'Grok is analyzing…'
              : 'Simulating…'
            : 'Run simulation'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-slate-300 transition hover:bg-white/5"
          aria-label="Reset inputs"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
