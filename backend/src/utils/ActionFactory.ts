import { IntentionRegistry } from '../intentions/IntentionRegistry';
import { TextParser, ParsedQuery } from './TextParser';
import { ResourceService } from '../domain/ResourceService';

export interface Action {
  intent: string;
  params: any;
  execute(): Promise<any>;
}

export interface ActionSuggestion {
  intent: string;
  score: number;
  description: string;
  title?: string;
  subtitle?: string;
  params?: any;
}

export class ActionFactory {
  private textParser: TextParser;
  private resourceService: ResourceService | null = null;

  constructor(private intentionRegistry: IntentionRegistry) {
    this.textParser = new TextParser();
  }

  setResourceService(resourceService: ResourceService): void {
    this.resourceService = resourceService;
  }

  createAction(query: string, params: any = {}): Action | null {
    // Parse the query to extract entities
    const parsed = this.textParser.parse(query);
    
    // Try to match intention from parsed query first
    let match: { intention: any; score: number } | null = null;
    
    if (parsed.intention) {
      const intention = this.intentionRegistry.getIntention(parsed.intention);
      if (intention) {
        match = { intention, score: 1.0 };
      }
    }
    
    // Fallback to keyword matching if parsing didn't work
    if (!match || match.score < 0.3) {
      match = this.intentionRegistry.findBestMatch(query);
      if (!match || match.score < 0.3) {
        return null;
      }
    }

    const intention = match.intention;

    // Merge parsed params with provided params (provided params take precedence)
    const extractedParams = parsed.intention 
      ? this.textParser.extractParams(parsed, parsed.intention)
      : {};
    const finalParams = { ...extractedParams, ...params };

    return {
      intent: intention.name,
      params: finalParams,
      execute: async () => {
        return await intention.execute(finalParams);
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

  async searchActions(query: string, threshold: number = 0.3): Promise<ActionSuggestion[]> {
    // Parse query to extract entities
    const parsed = this.textParser.parse(query);

    // Get all matching intentions
    const matches = this.intentionRegistry.findAllMatches(query, threshold);

    // If parser found a specific intention, prioritize it
    if (parsed.intention) {
      const parsedIntention = this.intentionRegistry.getIntention(parsed.intention);
      if (parsedIntention) {
        const existingMatch = matches.find(m => m.intention.name === parsed.intention);
        if (!existingMatch) {
          matches.unshift({ intention: parsedIntention, score: 0.9 });
        } else {
          // Boost score for parsed intention
          existingMatch.score = Math.max(existingMatch.score, 0.9);
        }
      }
    }

    // Sort by score (descending)
    matches.sort((a, b) => b.score - a.score);

    const suggestions: ActionSuggestion[] = matches.map(match => {
      const intention = match.intention;
      const params = parsed.intention === intention.name
        ? this.textParser.extractParams(parsed, intention.name)
        : {};

      // Generate human-readable title and subtitle
      const { title, subtitle } = this.generateActionLabels(intention.name, params, parsed);

      return {
        intent: intention.name,
        score: match.score,
        description: intention.description,
        title,
        subtitle,
        params
      };
    });

    // Search for resources by name if query doesn't match a specific intention
    if (this.resourceService && query.trim().length >= 2) {
      const resourceSuggestions = await this.searchResourcesByName(query.trim());
      suggestions.push(...resourceSuggestions);
    }

    // Sort all suggestions by score
    suggestions.sort((a, b) => b.score - a.score);

    return suggestions;
  }

  /**
   * Search for resources by name and generate contextual action suggestions
   */
  private async searchResourcesByName(query: string): Promise<ActionSuggestion[]> {
    if (!this.resourceService) return [];

    try {
      // Cast to any to access the included extraWork relation
      const resources = await this.resourceService.search(query) as any[];
      const suggestions: ActionSuggestion[] = [];

      for (const resource of resources) {
        const availability = resource.availability || 'available';
        const availabilityLabel = availability === 'available' ? 'Disponible'
          : availability === 'busy' ? 'Ocupado'
          : 'No disponible';

        // Suggestion: View/open resource details
        suggestions.push({
          intent: 'view_resource',
          score: 0.85,
          description: `Ver detalles del recurso "${resource.name}"`,
          title: `Ver recurso: "${resource.name}"`,
          subtitle: `Tipo: ${resource.type} | ${availabilityLabel}`,
          params: {
            resourceId: resource.id,
            resourceName: resource.name,
            resourceType: resource.type,
            availability: availability
          }
        });

        // If resource is assigned to an ExtraWork, suggest viewing that ExtraWork
        if (resource.extraWorkId && resource.extraWork) {
          suggestions.push({
            intent: 'open_extrawork_for_resource',
            score: 0.8,
            description: `Ver ExtraWork donde está asignado "${resource.name}"`,
            title: `Ver ExtraWork de "${resource.name}"`,
            subtitle: `ExtraWork: ${resource.extraWork.title}`,
            params: {
              resourceId: resource.id,
              resourceName: resource.name,
              extraWorkId: resource.extraWorkId,
              extraWorkTitle: resource.extraWork.title
            }
          });
        }

        // Suggestion: Assign resource to an ExtraWork (if available)
        if (availability === 'available' && !resource.extraWorkId) {
          suggestions.push({
            intent: 'assign_resource_suggestion',
            score: 0.7,
            description: `Asignar "${resource.name}" a un ExtraWork`,
            title: `Asignar "${resource.name}" a ExtraWork`,
            subtitle: 'Recurso disponible para asignación',
            params: {
              resourceId: resource.id,
              resourceName: resource.name
            }
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error searching resources by name:', error);
      return [];
    }
  }

  private generateActionLabels(intent: string, params: any, parsed: ParsedQuery): { title: string; subtitle?: string } {
    switch (intent) {
      case 'create_extrawork':
        if (params.title) {
          return {
            title: `Crear ExtraWork: "${params.title}"`,
            subtitle: 'Crear un nuevo ExtraWork'
          };
        }
        return { title: 'Crear nuevo ExtraWork' };

      case 'search_extrawork':
        if (params.query) {
          return {
            title: `Buscar ExtraWorks: "${params.query}"`,
            subtitle: 'Buscar en todos los ExtraWorks'
          };
        }
        return { title: 'Ver todos los ExtraWorks' };

      case 'open_extrawork':
        if (params.code || params.id) {
          return {
            title: `Abrir ${params.code || params.id}`,
            subtitle: 'Abrir detalle del ExtraWork'
          };
        }
        return { title: 'Abrir ExtraWork' };

      case 'assign_resource_to_extrawork':
        if (params.resourceName && params.extraWorkId) {
          return {
            title: `Asignar "${params.resourceName}" a ${params.extraWorkId}`,
            subtitle: 'Asignar recurso a ExtraWork'
          };
        }
        return { title: 'Asignar recurso a ExtraWork' };

      case 'search_resource':
        if (params.query) {
          return {
            title: `Buscar recursos: "${params.query}"`,
            subtitle: 'Buscar en todos los recursos'
          };
        }
        return { title: 'Ver todos los recursos' };

      case 'create_resource':
        return { title: 'Crear nuevo recurso' };

      default:
        return { title: intent };
    }
  }
}
