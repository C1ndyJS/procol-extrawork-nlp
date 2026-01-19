import { BaseIntention } from '../Intention';
import { ResourceService } from '../../domain/ResourceService';

export class AddResourceIntention extends BaseIntention {
  name = 'add_resource';
  keywords = ['add', 'attach', 'resource', 'file', 'link'];
  description = 'Adds a resource to an ExtraWork item';

  constructor(private resourceService: ResourceService) {
    super();
  }

  async execute(params: { extraWorkId: string; name: string; type: string; url?: string; metadata?: string }): Promise<any> {
    const { extraWorkId, name, type, url, metadata } = params;
    
    const resource = await this.resourceService.create({
      name,
      type,
      url,
      metadata,
      extraWork: {
        connect: { id: extraWorkId }
      }
    });

    return {
      success: true,
      data: resource,
      message: `Resource "${name}" added successfully`
    };
  }
}
