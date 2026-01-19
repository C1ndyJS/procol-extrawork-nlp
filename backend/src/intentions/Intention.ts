// Base interface for all intentions
export interface Intention {
  name: string;
  keywords: string[];
  description: string;
  execute(params: any): Promise<any>;
  match(query: string): number; // Returns confidence score 0-1
}

// Abstract base class for intentions
export abstract class BaseIntention implements Intention {
  abstract name: string;
  abstract keywords: string[];
  abstract description: string;

  match(query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;
    let matchCount = 0;

    for (const keyword of this.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      score = matchCount / this.keywords.length;
    }

    return Math.min(score, 1);
  }

  abstract execute(params: any): Promise<any>;
}
