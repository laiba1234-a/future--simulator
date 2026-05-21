import type { DecisionInput } from '../types';

export type DecisionFormSection = 'decision' | 'context' | 'constraints' | 'finetune';

export function isDecisionSectionComplete(decision: DecisionInput): boolean {
  return (
    decision.decisionConsidered.trim().length >= 8 &&
    decision.desiredOutcome.trim().length >= 5 &&
    decision.biggestFear.trim().length >= 5
  );
}

export function isContextSectionComplete(decision: DecisionInput): boolean {
  return (
    decision.currentSituation.trim().length >= 10 &&
    (decision.existingSkills.trim().length >= 3 || decision.skillTags.length > 0)
  );
}

export function isConstraintsSectionComplete(decision: DecisionInput): boolean {
  return (
    decision.externalConstraints.trim().length >= 5 || decision.constraintTags.length > 0
  );
}

export function isSectionComplete(
  section: DecisionFormSection,
  decision: DecisionInput
): boolean {
  switch (section) {
    case 'decision':
      return isDecisionSectionComplete(decision);
    case 'context':
      return isContextSectionComplete(decision);
    case 'constraints':
      return isConstraintsSectionComplete(decision);
    case 'finetune':
      return areAllPromptSectionsComplete(decision);
  }
}

/** All wizard tabs except fine-tune sliders */
export function areAllPromptSectionsComplete(decision: DecisionInput): boolean {
  return (
    isDecisionSectionComplete(decision) &&
    isContextSectionComplete(decision) &&
    isConstraintsSectionComplete(decision)
  );
}

export function sectionMissingHints(
  section: DecisionFormSection,
  decision: DecisionInput
): string[] {
  const missing: string[] = [];
  if (section === 'decision') {
    if (decision.decisionConsidered.trim().length < 8) missing.push('Decision (8+ characters)');
    if (decision.desiredOutcome.trim().length < 5) missing.push('Desired outcome');
    if (decision.biggestFear.trim().length < 5) missing.push('Biggest fear');
  }
  if (section === 'context') {
    if (decision.currentSituation.trim().length < 10) missing.push('Current situation');
    if (decision.existingSkills.trim().length < 3 && decision.skillTags.length === 0) {
      missing.push('Skills or skill tags');
    }
  }
  if (section === 'constraints') {
    if (decision.externalConstraints.trim().length < 5 && decision.constraintTags.length === 0) {
      missing.push('Constraints or constraint tags');
    }
  }
  return missing;
}
