import { BaseIntention } from '../Intention';
import { ResourceService } from '../../domain/ResourceService';

export class UpdateResourceIntention extends BaseIntention {
  name = 'update_resource';
  keywords = [
    'update', 'actualizar', 'editar', 'modificar', 'cambiar',
    'resource', 'recurso'
  ];
  description = 'Actualiza un recurso existente';

  constructor(private resourceService: ResourceService) {
    super();
  }

  async execute(params: { 
    id: string; 
    name?: string; 
    type?: string;
    availability?: string;
  }): Promise<any> {
    const { id, ...updateData } = params;

    if (!id) {
      throw new Error('Resource ID is required');
    }

    const resource = await this.resourceService.update(id, updateData);

    return {
      success: true,
      data: resource,
      message: `Resource "${resource.name}" updated successfully`
    };
  }
}
