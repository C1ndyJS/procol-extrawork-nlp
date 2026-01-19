import { IntentionRegistry } from '../intentions/IntentionRegistry';

export interface Action {
  intent: string;
  params: any;
  execute(): Promise<any>;
}

export class ActionFactory {
  constructor(private intentionRegistry: IntentionRegistry) {}

  createAction(query: string, params: any = {}): Action | null {
    const match = this.intentionRegistry.findBestMatch(query);
    
    if (!match || match.score < 0.3) {
      return null;
    }

    const intention = match.intention;

    return {
      intent: intention.name,
      params,
      execute: async () => {
        return await intention.execute(params);
      }
    };
  }

  createActionByIntent(intentName: string, params: any): Action | null {
    const intention = this.intentionRegistry.getIntention(intentName);
    
    if (!intention) {
      return null;
    }

    return {
      intent: intention.name,
      params,
      execute: async () => {
        return await intention.execute(params);
      }
    };
  }

  searchActions(query: string, threshold: number = 0.3): Array<{ intent: string; score: number; description: string }> {
    const matches = this.intentionRegistry.findAllMatches(query, threshold);
    
    return matches.map(match => ({
      intent: match.intention.name,
      score: match.score,
      description: match.intention.description
    }));
  }
}
