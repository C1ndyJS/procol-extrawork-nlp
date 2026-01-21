import { BaseIntention } from '../Intention';
import { ResourceService } from '../../domain/ResourceService';

export class DeleteResourceIntention extends BaseIntention {
  name = 'delete_resource';
  keywords = [
    'delete', 'eliminar', 'borrar', 'quitar', 'remover',
    'resource', 'recurso'
  ];
  description = 'Elimina un recurso';

  constructor(private resourceService: ResourceService) {
    super();
  }

  async execute(params: { id: string }): Promise<any> {
    const { id } = params;

    if (!id) {
      throw new Error('Resource ID is required');
    }

    const resource = await this.resourceService.delete(id);

    return {
      success: true,
      data: resource,
      message: `Resource "${resource.name}" deleted successfully`
    };
  }
}
