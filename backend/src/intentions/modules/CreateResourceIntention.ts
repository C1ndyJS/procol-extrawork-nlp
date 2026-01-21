import { BaseIntention } from '../Intention';
import { ResourceService } from '../../domain/ResourceService';

export class CreateResourceIntention extends BaseIntention {
  name = 'create_resource';
  keywords = ['create', 'add', 'new', 'resource', 'assign', 'allocate'];
  description = 'Creates a new resource optionally assigned to an ExtraWork';

  constructor(private resourceService: ResourceService) {
    super();
  }

  async execute(params: { name: string; type: string; availability?: string; extraWorkId?: string; url?: string; metadata?: string }): Promise<any> {
    const { name, type, availability, extraWorkId, url, metadata } = params;
    
    if (!name || !type) {
      throw new Error('Name and type are required');
    }

    const createData: any = {
      name,
      type,
      availability: availability || 'available',
      url: url || undefined,
      metadata: metadata || undefined,
    };

    // Solo conectar a ExtraWork si se proporciona un ID
    if (extraWorkId) {
      createData.extraWork = { connect: { id: extraWorkId } };
    }

    const resource = await this.resourceService.create(createData);

    return {
      success: true,
      data: resource,
      message: `Resource "${name}" created successfully`
    };
  }
}
