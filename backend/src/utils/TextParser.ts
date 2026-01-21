/**
 * Rule-based natural language parser for Spanish commands
 * Extracts intentions and entities from user queries
 */

export interface ParsedQuery {
  intention?: string;
  entities: {
    extraWorkId?: string; // EW-001, EW-123, or numeric IDs
    extraWorkCode?: string;
    resourceName?: string;
    resourceId?: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    query?: string; // For search queries
  };
  originalQuery: string;
}

export class TextParser {
  // Patterns for matching ExtraWork IDs/codes
  private readonly extraWorkPattern = /(?:EW-)?(\d+|[A-Z0-9-]+)/gi;
  
  // Spanish keywords for different intentions
  private readonly intentionPatterns: Map<string, RegExp[]> = new Map([
    ['create_extrawork', [
      /\b(?:crear|nuevo|nueva|añadir|agregar)\s+(?:un\s+)?(?:extrawork|trabajo|ew)\b/i,
      /\bquiero\s+crear\s+(?:un\s+)?(?:extrawork|trabajo)/i,
      /\b(?:nuevo|nueva)\s+(?:extrawork|trabajo)/i
    ]],
    ['search_extrawork', [
      /\bbuscar\s+(?:extrawork|trabajo|ew)/i,
      /\bver\s+(?:todos\s+(?:los\s+)?)?(?:extraworks|trabajos|ews)/i,
      /\blistar\s+(?:extraworks|trabajos|ews)/i,
      /\bmostrar\s+(?:extraworks|trabajos|ews)/i,
      /\b(?:lista\s+de\s+)?(?:extraworks|trabajos)/i
    ]],
    ['open_extrawork', [
      /\babrir\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bir\s+a(?:l)?\s+(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bver\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bmostrar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bdetalle\s+(?:del?\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i
    ]],
    ['assign_resource_to_extrawork', [
      /\bañadir\s+["']?([^"']+?)["']?\s+a(?:l)?\s+(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\basignar\s+["']?([^"']+?)["']?\s+a(?:l)?\s+(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bagregar\s+["']?([^"']+?)["']?\s+(?:a|en)(?:l)?\s+(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bponer\s+["']?([^"']+?)["']?\s+(?:a|en)(?:l)?\s+(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\brecurso\s+["']?([^"']+?)["']?\s+(?:a|en)(?:l)?\s+(?:extrawork\s+)?(?:EW-)?(\d+)/i
    ]],
    ['search_resource', [
      /\bbuscar\s+(?:recurso|recursos)/i,
      /\bver\s+(?:todos\s+(?:los\s+)?)?(?:recurso|recursos)/i,
      /\blistar\s+(?:recurso|recursos)/i,
      /\bmostrar\s+(?:recurso|recursos)/i,
      /\b(?:lista\s+de\s+)?recursos\b/i
    ]],
    ['create_resource', [
      /\bcrear\s+(?:un\s+)?(?:recurso|resource)\b/i,
      /\bañadir\s+(?:un\s+)?recurso\b/i,
      /\bnuevo\s+recurso\b/i,
      /\bagregar\s+(?:un\s+)?recurso\b/i
    ]],
    ['update_extrawork', [
      /\bactualizar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\beditar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bmodificar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bcambiar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i
    ]],
    ['delete_extrawork', [
      /\beliminar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bborrar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bquitar\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i,
      /\bremover\s+(?:el\s+)?(?:extrawork\s+)?(?:EW-)?(\d+)/i
    ]]
  ]);

  parse(query: string): ParsedQuery {
    const lowerQuery = query.toLowerCase().trim();
    const result: ParsedQuery = {
      entities: {},
      originalQuery: query
    };

    // Extract ExtraWork ID/Code
    const ewMatch = query.match(this.extraWorkPattern);
    if (ewMatch) {
      const ewId = ewMatch[0].replace(/^EW-?/i, '');
      result.entities.extraWorkId = ewId;
      result.entities.extraWorkCode = ewMatch[0];
    }

    // Match intention patterns
    let bestMatch: { intention: string; score: number } | null = null;
    
    for (const [intention, patterns] of this.intentionPatterns.entries()) {
      for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match) {
          // Higher score for longer matches
          const score = match[0].length / query.length;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { intention, score };
            
            // Extract resource name from assign_resource_to_extrawork pattern
            if (intention === 'assign_resource_to_extrawork') {
              if (match[1]) result.entities.resourceName = match[1].trim();
              if (match[2]) result.entities.extraWorkId = match[2];
            }
            
            // Extract IDs from other patterns if not already extracted
            if (!result.entities.extraWorkId && match[1] && /^\d+$/.test(match[1])) {
              result.entities.extraWorkId = match[1];
            }
          }
        }
      }
    }

    if (bestMatch) {
      result.intention = bestMatch.intention;
    }

    // Extract title/description from create queries
    if (result.intention === 'create_extrawork') {
      const titleMatch = this.extractTitle(query);
      if (titleMatch) {
        result.entities.title = titleMatch;
      }
    }

    // Extract search query text
    if (result.intention === 'search_extrawork' || result.intention === 'search_resource') {
      const queryText = this.extractSearchQuery(query);
      if (queryText) {
        result.entities.query = queryText;
      }
    }

    return result;
  }

  private extractTitle(query: string): string | undefined {
    // Patterns to extract title after create keywords
    const patterns = [
      /\bcrear\s+(?:un\s+)?(?:extrawork|trabajo|ew)\s+["']?(.+?)["']?\s*$/i,
      /\bcrear\s+["']?(.+?)["']?\s*$/i,
      /\bnuevo\s+(?:extrawork|trabajo|ew)\s+["']?(.+?)["']?\s*$/i,
      /\bnuevo\s+["']?(.+?)["']?\s*$/i,
      /\bañadir\s+(?:un\s+)?(?:extrawork|trabajo|ew)\s+["']?(.+?)["']?\s*$/i,
      /\bagregar\s+(?:un\s+)?(?:extrawork|trabajo|ew)\s+["']?(.+?)["']?\s*$/i,
      /\bquiero\s+crear\s+(?:un\s+)?(?:extrawork|trabajo)\s+["']?(.+?)["']?\s*$/i
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        // Remove quotes and extra whitespace
        const title = match[1].replace(/^["']|["']$/g, '').trim();
        // Only return if it's not too generic
        if (title && title.length > 2 && !['extrawork', 'trabajo', 'ew'].includes(title.toLowerCase())) {
          return title;
        }
      }
    }

    return undefined;
  }

  private extractSearchQuery(query: string): string | undefined {
    // Extract search terms after "buscar" or from general query
    const patterns = [
      /\bbuscar\s+(?:extrawork|recurso|trabajo|ew|resource)\s+["']?(.+?)["']?\s*$/i,
      /\bbuscar\s+["']?(.+?)["']?\s*$/i
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        const searchQuery = match[1].replace(/^["']|["']$/g, '').trim();
        // Only return non-generic terms
        if (searchQuery && !['extrawork', 'trabajo', 'recurso', 'resource', 'ew'].includes(searchQuery.toLowerCase())) {
          return searchQuery;
        }
      }
    }

    // Check if query has specific text that's not a general list command
    const isGeneralListCommand = /^(?:ver|listar|mostrar)\s+(?:todos\s+(?:los\s+)?)?(?:extrawork|trabajo|recurso|resource|ew)s?\s*$/i.test(query);
    if (!isGeneralListCommand) {
      // Extract any remaining meaningful text after command words
      const commandlessQuery = query.replace(/^(?:ver|listar|mostrar|buscar)\s+(?:todos\s+(?:los\s+)?)?(?:extrawork|trabajo|recurso|resource|ew)s?\s+/i, '').trim();
      if (commandlessQuery && commandlessQuery.length > 2) {
        return commandlessQuery;
      }
    }

    return undefined;
  }

  /**
   * Extract parameters for a specific intention based on parsed query
   */
  extractParams(parsed: ParsedQuery, intentionName: string): any {
    const params: any = {};

    switch (intentionName) {
      case 'create_extrawork':
        if (parsed.entities.title) {
          params.title = parsed.entities.title;
          params.description = parsed.entities.description || '';
        }
        break;

      case 'open_extrawork':
        if (parsed.entities.extraWorkId) {
          params.id = parsed.entities.extraWorkId;
          params.code = parsed.entities.extraWorkCode;
        }
        break;

      case 'assign_resource':
        if (parsed.entities.resourceName && parsed.entities.extraWorkId) {
          params.resourceName = parsed.entities.resourceName;
          params.extraWorkId = parsed.entities.extraWorkId;
        }
        break;

      case 'search_extrawork':
      case 'search_resource':
        if (parsed.entities.query) {
          params.query = parsed.entities.query;
        }
        break;

      case 'update_extrawork':
      case 'delete_extrawork':
        if (parsed.entities.extraWorkId) {
          params.id = parsed.entities.extraWorkId;
        }
        break;
    }

    return params;
  }
}
