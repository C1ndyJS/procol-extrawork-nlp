import { Intention } from './Intention';

export class IntentionRegistry {
  private intentions: Map<string, Intention> = new Map();

  register(intention: Intention): void {
    this.intentions.set(intention.name, intention);
  }

  unregister(name: string): void {
    this.intentions.delete(name);
  }

  getIntention(name: string): Intention | undefined {
    return this.intentions.get(name);
  }

  getAllIntentions(): Intention[] {
    return Array.from(this.intentions.values());
  }

  findBestMatch(query: string): { intention: Intention; score: number } | null {
    let bestMatch: { intention: Intention; score: number } | null = null;

    for (const intention of this.intentions.values()) {
      const score = intention.match(query);
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { intention, score };
      }
    }

    return bestMatch;
  }

  findAllMatches(query: string, threshold: number = 0.3): Array<{ intention: Intention; score: number }> {
    const matches: Array<{ intention: Intention; score: number }> = [];

    for (const intention of this.intentions.values()) {
      const score = intention.match(query);
      if (score >= threshold) {
        matches.push({ intention, score });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }
}
