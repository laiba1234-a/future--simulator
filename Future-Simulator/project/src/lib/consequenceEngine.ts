import type {
  DecisionInput,
  DomainOutcome,
  DomainTrajectory,
  LifeDomain,
  ScenarioCase,
  ScenarioFocus,
  ScenarioOutcomes,
  ScenarioTier,
  SimulationInput,
} from '../types';
import { DOMAIN_LABELS } from '../types';
import { generateTimeline, getPathLabel } from './timelineEngine';
import { formatCurrency } from './simulation';

type PathTheme = 'freelance' | 'business' | 'career' | 'wealth' | 'general';

interface WealthEnds {
  optimistic: number;
  realistic: number;
  pessimistic: number;
}

interface DerivedFactors {
  input: SimulationInput;
  path: PathTheme;
  goal: string;
  years: number;
  savingsPct: number;
  runwayMonths: number;
  riskScore: number;
  endWealth: number;
  pathLabel: string;
}

const PATH_LABELS: Record<PathTheme, string> = {
  freelance: 'Freelancing transition',
  business: 'Entrepreneurship venture',
  career: 'Career advancement',
  wealth: 'Wealth-building plan',
  general: 'Life transition',
};

const RISK_SCORE: Record<SimulationInput['riskLevel'], number> = {
  low: 0.25,
  medium: 0.55,
  high: 0.85,
};

function detectPath(lifeEvent: string, focus: ScenarioFocus): PathTheme {
  const text = lifeEvent.toLowerCase();
  if (text.includes('freelanc') || text.includes('contract')) return 'freelance';
  if (
    text.includes('business') ||
    text.includes('startup') ||
    text.includes('entrepreneur')
  ) {
    return 'business';
  }
  if (focus === 'career') return 'career';
  if (focus === 'wealth') return 'wealth';
  return 'general';
}

function buildFactors(
  input: SimulationInput,
  path: PathTheme,
  endWealth: number
): DerivedFactors {
  const savingsPct =
    input.annualIncome > 0
      ? Math.round(((input.monthlySavings * 12) / input.annualIncome) * 100)
      : 0;
  const monthlyBurn = Math.max(
    input.annualIncome / 12 - input.monthlySavings,
    input.annualIncome * 0.55
  );
  const liquidBuffer = input.monthlySavings * 6 + endWealth * 0.05;

  return {
    input,
    path,
    goal: input.lifeEvent.trim() || 'your stated life change',
    years: input.yearsAhead,
    savingsPct,
    runwayMonths: Math.round(liquidBuffer / monthlyBurn),
    riskScore: RISK_SCORE[input.riskLevel],
    endWealth,
    pathLabel: PATH_LABELS[path],
  };
}

function domain(
  id: LifeDomain,
  state: string,
  trajectory: DomainTrajectory,
  why: string
): DomainOutcome {
  return { id, label: DOMAIN_LABELS[id], state, trajectory, why };
}

function buildDrivingFactors(f: DerivedFactors, decision: DecisionInput): string[] {
  return [
    `Decision: "${decision.decisionConsidered.slice(0, 120)}${decision.decisionConsidered.length > 120 ? '…' : ''}"`,
    `Situation: ${decision.currentSituation.slice(0, 100)}${decision.currentSituation.length > 100 ? '…' : ''}`,
    `Desired outcome: "${decision.desiredOutcome.slice(0, 90)}${decision.desiredOutcome.length > 90 ? '…' : ''}"`,
    `Fear modeled: "${decision.biggestFear.slice(0, 90)}${decision.biggestFear.length > 90 ? '…' : ''}"`,
    `Emotional state: ${decision.emotionalState.replace('_', ' ')} · Confidence ${decision.confidenceLevel}/10 · Risk ${decision.riskTolerance}.`,
    `Finance: ${decision.financialStatus} · Relationships impact: ${decision.relationshipsImpact} · ~${f.runwayMonths} mo runway · ${f.savingsPct}% savings rate.`,
    `Constraints: ${decision.constraintTags.length > 0 ? decision.constraintTags.join(', ') : decision.externalConstraints.slice(0, 80) || 'none listed'}.`,
  ];
}

function buildChains(f: DerivedFactors, tier: ScenarioTier): ScenarioCase['chainReactions'] {
  const chains: Record<PathTheme, Record<ScenarioTier, ScenarioCase['chainReactions']>> = {
    freelance: {
      best: [
        {
          trigger: 'First retainer client signed within 90 days',
          cascade: [
            'Predictable monthly revenue reduces anxiety',
            'You protect evenings and weekends again',
            'Partner trust improves because stress drops',
            'Referrals compound — pipeline stays full',
          ],
          why: `Because you kept ${f.savingsPct}% savings and entered with ~${f.runwayMonths} months runway, you could reject bad-fit clients and wait for quality leads instead of panic-discounting.`,
        },
        {
          trigger: 'Reputation grows in one niche',
          cascade: [
            'Rates increase without more hours',
            'Education investment (courses, certs) pays back quickly',
            'Opportunities arrive inbound — less time spent selling',
          ],
          why: `A ${f.input.focus} focus plus ${f.years}-year horizon rewards specialization; best case assumes you double down instead of scattering offers.`,
        },
      ],
      average: [
        {
          trigger: 'Feast-or-famine income in year 1',
          cascade: [
            'You take any available project to cover bills',
            'Less time for networking and upskilling',
            'Sleep and exercise slip — mental load rises',
            'Growth is real but slower than planned',
          ],
          why: `With ${f.savingsPct}% savings and medium risk, cash gaps are survivable but force trade-offs — you postpone "${f.goal}" milestones by ~12–18 months.`,
        },
      ],
      worst: [
        {
          trigger: 'Three dry months after leaving stable income',
          cascade: [
            'Emergency fund drawn down — financial stress spikes',
            'Irritability and withdrawal strain relationships',
            'You underprice work, attracting difficult clients',
            'Burnout reduces output — reputation takes early hits',
            'Return-to-job option becomes the rational exit',
          ],
          why: `Runway (~${f.runwayMonths} months) plus ${f.input.riskLevel} risk means a slow pipeline is not abstract — without quick wins, compounding stress closes the freelancing experiment.`,
        },
      ],
    },
    business: {
      best: [
        {
          trigger: 'Early customers validate the offer',
          cascade: ['Revenue covers ops', 'You hire part-time help', 'Founder time shifts to strategy', 'Personal finance stabilizes'],
          why: `Savings at ${f.savingsPct}% let you reinvest instead of paying yourself zero — the business scales before personal runway expires.`,
        },
      ],
      average: [
        {
          trigger: 'Product pivot after lukewarm launch',
          cascade: ['Six months of rework', 'Investor or family conversations get tense', 'Gradual traction — not explosive'],
          why: `${f.goal} assumed one hypothesis; average case reflects a necessary pivot eating calendar time and emotional energy.`,
        },
      ],
      worst: [
        {
          trigger: 'Burn rate exceeds revenue for 18+ months',
          cascade: ['Credit or loans enter the picture', 'Team conflicts if co-founders exist', 'Personal relationships absorb stress', 'Shutdown or acqui-hire at unfavorable terms'],
          why: `High risk (${f.input.riskLevel}) without proportional savings (${f.savingsPct}%) removes the buffer that would let the venture survive a long J-curve.`,
        },
      ],
    },
    career: {
      best: [
        {
          trigger: 'Strategic role change aligns with goal',
          cascade: ['Comp jumps', 'Mentor network expands', 'Learning budget increases', 'Confidence feeds performance reviews'],
          why: `${f.input.focus === 'career' ? 'Career-first focus' : 'Balanced focus'} means you optimized for role fit — best case is the promotion path compounding over ${f.years} years.`,
        },
      ],
      average: [
        {
          trigger: 'One stalled promotion cycle',
          cascade: ['You lateral move for learning', 'Income flat for 2 years', 'Relationships steady but goals delayed'],
          why: `Not failure — friction. At age ${f.input.currentAge} with ${f.savingsPct}% savings you can absorb the plateau without crisis.`,
        },
      ],
      worst: [
        {
          trigger: 'Industry contraction or layoff',
          cascade: ['Job search under time pressure', 'Identity stress affects mental health', 'Spending cuts strain lifestyle', 'Reputation recovery takes 2–3 years'],
          why: `External shock + only ~${f.runwayMonths} months personal runway turns "${f.goal}" from opportunity into damage control.`,
        },
      ],
    },
    wealth: {
      best: [
        {
          trigger: 'Markets and discipline align',
          cascade: ['Compound growth accelerates', 'Optional work becomes possible', 'Stress drops', 'Relationships benefit from stability'],
          why: `${f.savingsPct}% savings over ${f.years} years at ${f.input.investmentReturn}% expected return — best case needs consistent behavior, not luck alone.`,
        },
      ],
      average: [
        {
          trigger: 'Mixed returns decade',
          cascade: ['Plan stays on track on average', 'One bear market delays goals 2 years', 'Emotional patience tested'],
          why: `Wealth focus without extreme risk (${f.input.riskLevel}) produces moderate variance — outcomes track historical averages.`,
        },
      ],
      worst: [
        {
          trigger: 'Poor early-year returns + life expense shock',
          cascade: ['Withdrawals during downturn', 'Goals postponed', 'Risk tolerance tested emotionally'],
          why: `Sequence-of-returns risk matters because buffer is only ~${f.runwayMonths} months of lifestyle — a hit early in the horizon does disproportionate damage.`,
        },
      ],
    },
    general: {
      best: [
        {
          trigger: 'Plan executes with few external shocks',
          cascade: ['Milestones hit on schedule', 'Support network stays engaged', 'Confidence builds momentum'],
          why: `Low volatility inputs (risk ${f.input.riskLevel}, savings ${f.savingsPct}%) make "${f.goal}" achievable without heroic assumptions.`,
        },
      ],
      average: [
        {
          trigger: 'Mixed progress — wins and setbacks',
          cascade: ['Timeline slips ~20%', 'Relationships tested but hold', 'Finance adequate not abundant'],
          why: `Real life friction: average case models normal variance, not catastrophe or lottery wins.`,
        },
      ],
      worst: [
        {
          trigger: 'Unexpected cost or health event',
          cascade: ['Savings diverted', 'Stress narrows decision quality', 'Opportunities missed while recovering'],
          why: `Thin buffer (${f.runwayMonths} months, ${f.savingsPct}% savings) means one shock reorders every other domain.`,
        },
      ],
    },
  };

  return chains[f.path][tier];
}

function adaptDomainsForPath(
  domains: DomainOutcome[],
  path: PathTheme
): DomainOutcome[] {
  const careerLabel: Partial<Record<PathTheme, string>> = {
    business: 'Founder role & equity',
    career: 'Employer trajectory',
    wealth: 'Income vs portfolio',
    general: 'Professional direction',
  };

  return domains.map((d) => {
    if (d.id === 'career' && careerLabel[path]) {
      return { ...d, label: careerLabel[path]! };
    }
    if (path === 'business' && d.id === 'career') {
      return {
        ...d,
        state: d.state.replace('Freelancer', 'Founder').replace('freelance', 'startup'),
      };
    }
    if (path === 'career' && d.id === 'finance') {
      return {
        ...d,
        why: d.why.replace('clients', 'salary and bonuses').replace('pipeline', 'promotion cycle'),
      };
    }
    if (path === 'wealth' && d.id === 'time') {
      return {
        ...d,
        state: d.state.replace('clients', 'markets').replace('calendar', 'portfolio reviews'),
      };
    }
    return d;
  });
}

function freelanceDomains(f: DerivedFactors, tier: ScenarioTier): DomainOutcome[] {
  const wealth = formatCurrency(f.endWealth);
  const income = formatCurrency(f.input.annualIncome);

  const table: Record<ScenarioTier, DomainOutcome[]> = {
    best: [
      domain('time', 'You control calendar within 18 months', 'up', `Because inbound clients grow, you stop trading every hour for money — ${f.years}-year horizon gives room to productize.`),
      domain('relationships', 'Stronger — stress shared and reduced', 'up', `Partner sees concrete income recovery by month 9; financial transparency (${f.savingsPct}% saved before transition) built trust early.`),
      domain('career', 'Independent brand with premium clients', 'up', `"${f.goal}" succeeds — you are known for one offer, not generic labor.`),
      domain('finance', `Net worth → ${wealth}; income above ${income}`, 'up', `Retainers + raised rates + ${f.savingsPct}% discipline compound; best case needs no extended dry spells.`),
      domain('mentalHealth', 'Anxiety drops after month 12', 'up', `Predictability removes the fight-or-flight cycle that defined the first year.`),
      domain('education', 'Targeted upskilling with ROI', 'up', `You invest in sales/systems skills once revenue stabilizes — not before, which is why average paths stall.`),
      domain('reputation', 'Referral-driven pipeline', 'up', `Delivering on 3–5 anchor clients creates social proof; reputation lags income by ~6 months then overtakes it.`),
      domain('opportunities', 'Choose projects — not chase them', 'up', `Optionality emerges because runway (~${f.runwayMonths} mo) let you say no to bad fits early.`),
      domain('riskFactors', 'Client concentration manageable', 'steady', `Still dependent on 2–3 clients, but contracts and savings reduce tail risk.`),
      domain('emotionalEffects', 'Pride and autonomy', 'up', `Agency returns when effort maps to reward — the emotional payoff of "${f.goal}" actually arriving.`),
    ],
    average: [
      domain('time', 'Long hours years 1–2, easing later', 'volatile', `Feast-famine means you cannot batch rest until cash rhythm exists — ${f.runwayMonths} months runway sets how painful this is.`),
      domain('relationships', 'Strained during dry months, repairing after', 'volatile', `Unpredictable income forces "I can't afford this" conversations — not permanent, but recurring.`),
      domain('career', 'Freelancer identity sticks; income uneven', 'steady', `"${f.goal}" half-wins: you are self-employed but not yet selective about work.`),
      domain('finance', `Ends near ${wealth} — lumpy path`, 'steady', `${f.savingsPct}% savings prevents disaster; average case is growth with two flat years.`),
      domain('mentalHealth', 'Stress manageable with coping habits', 'volatile', `Worry spikes before invoices clear; stabilizes when pipeline has 2+ months visibility.`),
      domain('education', 'Learning happens between client deadlines', 'steady', `Courses postponed during cash crunches — education follows revenue, not precedes it.`),
      domain('reputation', 'Mixed reviews — good work, slow visibility', 'steady', `Quality is there but marketing inconsistency keeps referrals sporadic.`),
      domain('opportunities', 'Some good leads, many dead ends', 'steady', `Risk level ${f.input.riskLevel} means you pursue more speculative pitches than best case.`),
      domain('riskFactors', 'Income volatility remains #1 risk', 'volatile', `No employer safety net — one lost client can erase a quarter.`),
      domain('emotionalEffects', 'Hope alternating with doubt', 'volatile', `Progress is real but non-linear; feelings track cash flow more than effort.`),
    ],
    worst: [
      domain('time', 'Always working — no real boundaries', 'down', `Panic-selling hours to cover gaps destroys the lifestyle "${f.goal}" promised.`),
      domain('relationships', 'Conflict over money and availability', 'down', `~${f.runwayMonths} months runway runs out before income stabilizes — partners absorb the shock.`),
      domain('career', 'Freelance experiment ends; employment resume', 'down', `Gap on CV + scattered portfolio makes premium roles harder short-term.`),
      domain('finance', `Wealth stalls near ${wealth}; debt possible`, 'down', `Only ${f.savingsPct}% saved going in — dry spell forces drawdowns or cards.`),
      domain('mentalHealth', 'Burnout and sleep disruption', 'down', `Chronic uncertainty keeps cortisol high; productivity drops — a negative feedback loop.`),
      domain('education', 'Skill-building stalls completely', 'down', `Survival mode — no bandwidth for courses that would break the cycle.`),
      domain('reputation', 'Overpromising → underdelivering on some jobs', 'down', `Desperation pricing attracts bad clients; bad clients damage word of mouth.`),
      domain('opportunities', 'Doors close — network goes quiet', 'down', `People sense distress; referrals stop — opportunity follows perceived stability.`),
      domain('riskFactors', 'Runway, health, relationship breakdown', 'down', `Triple exposure: no salary, thin savings, ${f.input.riskLevel} risk tolerance without buffer.`),
      domain('emotionalEffects', 'Shame, regret, grief for the plan', 'down', `"${f.goal}" felt right but inputs (runway ${f.runwayMonths} mo, savings ${f.savingsPct}%) could not survive the J-curve.`),
    ],
  };

  return table[tier];
}

function buildDomains(f: DerivedFactors, tier: ScenarioTier): DomainOutcome[] {
  const base = freelanceDomains(f, tier);
  if (f.path === 'freelance') return base;
  return adaptDomainsForPath(base, f.path);
}

function buildBullets(domains: DomainOutcome[], chains: ScenarioCase['chainReactions']): string[] {
  const finance = domains.find((d) => d.id === 'finance');
  const career = domains.find((d) => d.id === 'career');
  const mental = domains.find((d) => d.id === 'mentalHealth');
  return [
    career?.state ?? '',
    finance?.state ?? '',
    mental?.state ?? '',
    chains[0]?.cascade[chains[0].cascade.length - 1] ?? '',
  ].filter(Boolean);
}

function buildScenario(
  tier: ScenarioTier,
  title: ScenarioCase['title'],
  f: DerivedFactors,
  decision: DecisionInput
): ScenarioCase {
  const domains = buildDomains(f, tier);
  const chainReactions = buildChains(f, tier);

  const summaries: Record<ScenarioTier, string> = {
    best: `Confidence ${decision.confidenceLevel}/10 + ${decision.riskTolerance} risk — best case assumes "${f.goal}" gains traction before runway (~${f.runwayMonths} mo) expires.`,
    average: `Typical friction: ${decision.emotionalState.replace('_', ' ')} feelings, ${decision.relationshipsImpact} relationship load, and delayed "${f.goal}".`,
    worst: `Fear realized: "${decision.biggestFear.slice(0, 100)}${decision.biggestFear.length > 100 ? '…' : ''}" — thin buffer + constraints cascade.`,
  };

  return {
    title,
    tier,
    summary: summaries[tier],
    domains,
    chainReactions,
    timeline: generateTimeline(decision, tier),
    bullets: buildBullets(domains, chainReactions),
  };
}

export function generateScenarioOutcomes(
  decision: DecisionInput,
  input: SimulationInput,
  endWealth: WealthEnds
): ScenarioOutcomes {
  const path = detectPath(input.lifeEvent, input.focus);
  const avgFactors = buildFactors(input, path, endWealth.realistic);

  return {
    pathLabel: getPathLabel(decision),
    drivingFactors: buildDrivingFactors(avgFactors, decision),
    best: buildScenario(
      'best',
      'BEST CASE',
      buildFactors(input, path, endWealth.optimistic),
      decision
    ),
    average: buildScenario('average', 'AVERAGE CASE', avgFactors, decision),
    worst: buildScenario(
      'worst',
      'WORST CASE',
      buildFactors(input, path, endWealth.pessimistic),
      decision
    ),
  };
}
