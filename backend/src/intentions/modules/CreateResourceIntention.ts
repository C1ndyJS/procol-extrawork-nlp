import { BaseIntention } from '../Intention';
import { ResourceService } from '../../domain/ResourceService';

export class CreateResourceIntention extends BaseIntention {
  name = 'create_resource';
  keywords = ['create', 'add', 'new', 'resource', 'assign', 'allocate'];
  description = 'Creates and assigns a new resource to an ExtraWork';

  constructor(private resourceService: ResourceService) {
    super();
  }

  async execute(params: { name: string; type: string; extraWorkId: string; url?: string; metadata?: string }): Promise<any> {
    const { name, type, extraWorkId, url, metadata } = params;
    
    if (!name || !type || !extraWorkId) {
      throw new Error('Name, type, and extraWorkId are required');
    }

    const resource = await this.resourceService.create({
      name,
      type,
      url: url || undefined,
      metadata: metadata || undefined,
      extraWork: { connect: { id: extraWorkId } }
    });

    return {
      success: true,
      data: resource,
      message: `Resource "${name}" created and assigned successfully`
    };
  }
}
