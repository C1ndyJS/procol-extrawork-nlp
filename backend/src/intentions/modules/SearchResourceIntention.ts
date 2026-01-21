import { BaseIntention } from '../Intention';
import { ResourceService } from '../../domain/ResourceService';

/**
 * Searches for resources by name or type
 */
export class SearchResourceIntention extends BaseIntention {
  name = 'search_resource';
  keywords = [
    'search', 'buscar', 'find', 'encontrar',
    'list', 'listar', 'ver', 'mostrar',
    'resource', 'recurso', 'recursos'
  ];
  description = 'Busca recursos por nombre o tipo';

  constructor(private resourceService: ResourceService) {
    super();
  }

  async execute(params: { query?: string }): Promise<any> {
    const { query } = params;
    
    let resources;
    if (query && query.trim()) {
      resources = await this.resourceService.search(query.trim());
    } else {
      resources = await this.resourceService.findAll();
    }

    return {
      success: true,
      data: resources,
      message: `Found ${resources.length} resource(s)`
    };
  }
}
