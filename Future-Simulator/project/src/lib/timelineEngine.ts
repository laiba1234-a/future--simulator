import type { DecisionInput, ScenarioTier, TimelineMarker, TimelineStage } from '../types';

type PathTheme =
  | 'creator'
  | 'freelance'
  | 'business'
  | 'career'
  | 'education_exit'
  | 'general';

function detectPath(decision: DecisionInput): PathTheme {
  const text = `${decision.decisionConsidered} ${decision.currentSituation}`.toLowerCase();
  if (text.includes('youtube') || text.includes('content') || text.includes('channel')) {
    return 'creator';
  }
  if (text.includes('degree') || text.includes('university') || text.includes('college')) {
    return 'education_exit';
  }
  if (text.includes('freelanc')) return 'freelance';
  if (text.includes('business') || text.includes('startup')) return 'business';
  if (text.includes('job') || text.includes('career')) return 'career';
  return 'general';
}

interface StageContext {
  decision: DecisionInput;
  path: PathTheme;
  tier: ScenarioTier;
  fear: string;
  goal: string;
  confidence: number;
  relImpact: DecisionInput['relationshipsImpact'];
}

function stage(
  marker: TimelineMarker,
  label: string,
  data: Omit<TimelineStage, 'marker' | 'label'>
): TimelineStage {
  return { marker, label, ...data };
}

function creatorStages(c: StageContext): Record<ScenarioTier, TimelineStage[]> {
  const { decision } = c;
  const skillNote =
    decision.skillTags.length > 0
      ? `Skills (${decision.skillTags.join(', ')}) `
      : '';

  const tables: Record<ScenarioTier, TimelineStage[]> = {
    best: [
      stage('month1', 'Month 1', {
        events: [
          'Finalize niche — YouTube automation for a specific audience',
          'Publish 8–12 videos with consistent thumbnail/style system',
          'Set up analytics dashboard and content calendar',
        ],
        consequences: [
          'Degree paused, not burned — leave door open for return',
          'First $50–$300 in AdSense or affiliate tests',
        ],
        emotionalChanges: [
          `${decision.emotionalState} → energized by visible output`,
          'Family tension eases slightly because you show a plan, not just a dream',
        ],
        opportunities: [
          'One video gets 3× normal CTR — algorithm tests you wider',
          'Discord/community feedback reveals a paid-tool gap you can fill',
        ],
        risks: [
          'Over-optimizing edits instead of shipping volume',
          'Ignoring degree deadlines if financial aid has strings attached',
        ],
      }),
      stage('month3', 'Month 3', {
        events: [
          '1,000+ subscribers or equivalent watch-hours milestone',
          'First small sponsorship or automation template sale',
          'Batch-filming workflow cuts production time 40%',
        ],
        consequences: [
          `Income crosses part-time job level — ${skillNote}compounds`,
          'Reputation as "the automation person" in one sub-niche',
        ],
        emotionalChanges: [
          'Confidence rises — imposter syndrome still visits but doesn’t stay',
          `Fear of "${c.fear.slice(0, 60)}…" shrinks with data`,
        ],
        opportunities: [
          'Collaboration invite from larger channel',
          'Course or Notion template offer validated by email list',
        ],
        risks: [
          'Platform policy change affects monetization',
          'Single viral video creates wrong audience — hard to monetize',
        ],
      }),
      stage('month6', 'Month 6', {
        events: [
          'Recurring revenue: sponsors + digital product',
          'Hire editor or VA for $400/mo — buy back time',
          'Parents see tax documents / real deposits — conversation shifts',
        ],
        consequences: [
          'Degree officially deferred with documented return plan',
          'Runway extended because business covers rent share',
        ],
        emotionalChanges: [
          'Pride replaces defensiveness in social settings',
          'Stress becomes "growth stress" not survival stress',
        ],
        opportunities: [
          'Agency brands reach out for dedicated series',
          'Second platform (Shorts/TikTok) repurposing multiplies reach',
        ],
        risks: [
          'Burnout from saying yes to every deal',
          'Underpricing because you fear losing momentum',
        ],
      }),
      stage('year1', 'Year 1', {
        events: [
          'Channel + product line = $3k–$8k/mo combined',
          'Automation toolkit becomes signature offer',
          'Peer group shifts from classmates to creator founders',
        ],
        consequences: [
          `"${c.goal}" is 60–80% realized on income axis`,
          'Education path replaced by portfolio + audience asset',
        ],
        emotionalChanges: [
          'Identity solidifies: "builder who teaches on YouTube"',
          'Regret about degree fades — opportunity cost feels paid back',
        ],
        opportunities: [
          'Small team (editor + researcher)',
          'Speaking or B2B automation consulting spin-off',
        ],
        risks: [
          'Audience plateau — need second content pillar',
          'Tax/compliance complexity if income jumps fast',
        ],
      }),
      stage('year5', 'Year 5', {
        events: [
          'Business diversified: channel + SaaS-lite tool + community membership',
          'Income rivals or beats median SWE salary in your region',
          'Optional: hire GM to run ops while you create',
        ],
        consequences: [
          'Degree less relevant — skills proved in market',
          'Network effects: inbound deals, not cold outreach',
        ],
        emotionalChanges: [
          'Long-horizon calm — worst-case fear fully metabolized',
          'Mentorship role for newer creators',
        ],
        opportunities: [
          'Acquisition interest or joint venture',
          'Invest profits into index funds / second business',
        ],
        risks: [
          'Platform dependency — diversify or die slowly',
          'Lifestyle creep eroding margins',
        ],
      }),
    ],
    average: [
      stage('month1', 'Month 1', {
        events: [
          'Launch channel but upload schedule slips to 1×/week',
          'Degree attendance becomes minimal — grades slip',
          'Savings cover basics; no business income yet',
        ],
        consequences: [
          'Family conflict spikes — "prove it" deadline set (~6 months)',
          'Sleep irregular — learning editing + automation at night',
        ],
        emotionalChanges: [
          `${decision.emotionalState} persists — excitement mixed with doubt`,
          'Comparison to classmates triggers shame loops',
        ],
        opportunities: [
          'Campus friend shares gear or editing shortcuts',
          'One video hits 10k views — small proof of concept',
        ],
        risks: [
          c.fear,
          `Constraints: ${decision.constraintTags.join(', ') || 'external pressure'}`,
        ],
      }),
      stage('month3', 'Month 3', {
        events: [
          '300–800 subscribers — growth linear not exponential',
          'First affiliate $20–$150/mo',
          'Consider part-time job to extend runway',
        ],
        consequences: [
          'Degree delayed, not quit — academic standing fragile',
          'Relationships strained during money talks',
        ],
        emotionalChanges: [
          'Confidence wobbles monthly with analytics',
          'Therapy or journaling becomes necessary coping tool',
        ],
        opportunities: [
          'Narrow niche based on comment questions',
          'Short-form repurpose tests unlock new viewers',
        ],
        risks: [
          'Runway math fails before monetization',
          'Reputation as "quitter" in family narrative',
        ],
      }),
      stage('month6', 'Month 6', {
        events: [
          'Income $500–$1.5k/mo — not enough alone',
          'Hybrid path: part-time job + channel',
          'Academic probation or formal leave processed',
        ],
        consequences: [
          'Timeline to goal extends 2–3 years',
          'Social life shrinks — time debt accumulates',
        ],
        emotionalChanges: [
          'Acceptance that average path is messy, not cinematic',
          'Fear less acute but always background',
        ],
        opportunities: [
          'Digital product beta from email list of 200 fans',
          'Freelance automation gig from viewer DM',
        ],
        risks: [
          'Split focus — neither job nor channel gets full power',
          'Burnout from "always working"',
        ],
      }),
      stage('year1', 'Year 1', {
        events: [
          'Channel ~$1.5–3k/mo + job = stable',
          'Decide: scale content OR return to degree part-time',
          'Skills deepened in automation stack',
        ],
        consequences: [
          'Goal half-met — freedom partial, not total',
          'Relationships repair with boundaries + income proof',
        ],
        emotionalChanges: [
          'More grounded identity — still evolving',
          'Regret and relief coexist about degree',
        ],
        opportunities: [
          'Full-time creator if next 2 quarters trend up',
          'Degree return with credit transfer if channel stalls',
        ],
        risks: [
          'Stuck in hybrid forever — no scale, no degree',
          'Algorithm shift kills growth for 6 months',
        ],
      }),
      stage('year5', 'Year 5', {
        events: [
          'Mature small business OR returned to tech with creator side income',
          'Income $4–7k/mo combined sources',
          'Audience asset worth more than degree would have been alone',
        ],
        consequences: [
          'Non-linear career — valid but harder to explain on CV',
          'Financial stability reached with lag',
        ],
        emotionalChanges: [
          'Perspective: average outcome still beat never trying',
          'Fear transformed into caution, not paralysis',
        ],
        opportunities: [
          'Teach cohort-based course',
          'Acquire smaller channel in same niche',
        ],
        risks: [
          'Opportunity cost vs peers who stayed in SWE track',
          'Platform risk never goes away',
        ],
      }),
    ],
    worst: [
      stage('month1', 'Month 1', {
        events: [
          'Impulsive degree withdrawal without income plan',
          '4 videos published then perfectionism freeze',
          'Savings drop — panic sets in week 6',
        ],
        consequences: [
          'Family trust drops sharply',
          'Roommate tension over rent stress',
        ],
        emotionalChanges: [
          'Anxiety spikes — sleep loss',
          'Shame when scrolling LinkedIn classmates',
        ],
        opportunities: [
          'Still time to re-enroll if caught before add/drop deadline',
          'One freelance script gig from network',
        ],
        risks: [
          c.fear,
          'No monetization + tuition sunk cost + lease locked',
        ],
      }),
      stage('month3', 'Month 3', {
        events: [
          'Channel growth flat — 50–200 subs',
          'AdSense ineligible or pennies',
          'Credit card or parental loan needed',
        ],
        consequences: [
          'Degree exit without credential — gap on resume',
          'Mental health slides — isolation',
        ],
        emotionalChanges: [
          'Regret loop: "I should have finished the degree"',
          'Defensiveness turns into irritability with loved ones',
        ],
        opportunities: [
          'Bootcamp or return to CS if re-enrollment possible',
          'Agency internship using automation portfolio',
        ],
        risks: [
          'Depression-risk burnout pattern',
          'Relationship breakup under financial stress',
        ],
      }),
      stage('month6', 'Month 6', {
        events: [
          'Channel abandoned or 1 video/month only',
          'Job search under pressure — entry-level SWE or support role',
          'Parents financially intervene with conditions',
        ],
        consequences: [
          'Goal failed on timeline — reputation hit locally',
          'Skills fragmented — jack of trades, master of none',
        ],
        emotionalChanges: [
          'Grief for the identity you wanted',
          'Hard to trust own judgment on big bets',
        ],
        opportunities: [
          'Rebuild with 12-month employed + nights/weekends channel plan',
          'Sell automation templates to recoup some sunk time',
        ],
        risks: [
          'Long CV gap explained poorly in interviews',
          'Debt spiral if spending not cut',
        ],
      }),
      stage('year1', 'Year 1', {
        events: [
          'Stable job but creative dream shelved',
          'Small channel dormant — audience gone cold',
          'Degree return expensive or starting over',
        ],
        consequences: [
          'Financial recovery mode — little investing',
          'Relationships repair slowly with accountability',
        ],
        emotionalChanges: [
          'Bitterness unless reframed as expensive education',
          'Lower risk tolerance on next ideas',
        ],
        opportunities: [
          'Internal transfer to automation tooling team',
          'Revive channel with new niche + employed safety net',
        ],
        risks: [
          'Giving up too early vs staying in denial — both costly',
          'Family narrative "I told you so" affects confidence years',
        ],
      }),
      stage('year5', 'Year 5', {
        events: [
          'Traditional career path restored — SWE or adjacent',
          'Creator income $0–$300/mo hobby at best',
          'Sunk years acknowledged — new goals set smaller',
        ],
        consequences: [
          'Opportunity cost visible vs peers who stayed course',
          'Wealth lags — late start on investing',
        ],
        emotionalChanges: [
          'Peace possible — but requires forgiving the detour',
          'Fear of big pivots persists',
        ],
        opportunities: [
          'Expertise story for future content if ready again',
          'Side automation products while employed',
        ],
        risks: [
          'Never retrying — permanent "what if"',
          'Resentment toward family/job stealing dream time',
        ],
      }),
    ],
  };

  return tables;
}

function adaptCreatorToPath(
  creator: Record<ScenarioTier, TimelineStage[]>,
  path: PathTheme,
  tier: ScenarioTier
): TimelineStage[] {
  if (path === 'creator' || path === 'education_exit') return creator[tier];
  return creator[tier].map((s) => ({
    ...s,
    events: s.events.map((e) =>
      e.replace('YouTube', 'project').replace('channel', 'venture').replace('subscribers', 'customers')
    ),
  }));
}

export function generateTimeline(
  decision: DecisionInput,
  tier: ScenarioTier
): TimelineStage[] {
  const path = detectPath(decision);
  const ctx: StageContext = {
    decision,
    path,
    tier,
    fear: decision.biggestFear.trim() || 'things not working out',
    goal: decision.desiredOutcome.trim() || 'your desired outcome',
    confidence: decision.confidenceLevel,
    relImpact: decision.relationshipsImpact,
  };

  const creator = creatorStages(ctx);
  return adaptCreatorToPath(creator, path, tier);
}

export function getPathLabel(decision: DecisionInput): string {
  const labels: Record<PathTheme, string> = {
    creator: 'Creator / YouTube automation path',
    education_exit: 'Leaving education for entrepreneurship',
    freelance: 'Freelancing transition',
    business: 'Startup / business venture',
    career: 'Career change',
    general: 'Major life decision',
  };
  return labels[detectPath(decision)];
}
