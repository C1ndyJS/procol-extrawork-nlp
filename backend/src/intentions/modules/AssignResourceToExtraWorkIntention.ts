import { BaseIntention } from '../Intention';
import { ResourceService } from '../../domain/ResourceService';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

/**
 * Assigns an existing resource to an ExtraWork by resource name and ExtraWork ID
 */
export class AssignResourceToExtraWorkIntention extends BaseIntention {
  name = 'assign_resource_to_extrawork';
  keywords = [
    'assign', 'asignar', 'añadir', 'agregar', 'poner',
    'resource', 'recurso',
    'extrawork', 'trabajo',
    'to', 'a', 'en'
  ];
  description = 'Asigna un recurso existente a un ExtraWork';

  constructor(
    private resourceService: ResourceService,
    private extraWorkService: ExtraWorkService
  ) {
    super();
  }

  async execute(params: { 
    resourceName: string; 
    extraWorkId: string;
    resourceId?: string;
  }): Promise<any> {
    const { resourceName, extraWorkId, resourceId } = params;

    if (!resourceName || !extraWorkId) {
      throw new Error('Resource name and ExtraWork ID are required');
    }

    // Verify ExtraWork exists
    const extraWork = await this.extraWorkService.findById(extraWorkId);
    if (!extraWork) {
      throw new Error(`ExtraWork with id ${extraWorkId} not found`);
    }

    let resource;

    // If resourceId is provided, use it directly
    if (resourceId) {
      resource = await this.resourceService.findById(resourceId);
      if (!resource) {
        throw new Error(`Resource with id ${resourceId} not found`);
      }
    } else {
      // Search for resource by name
      const resources = await this.resourceService.search(resourceName);
      if (resources.length === 0) {
        throw new Error(`Resource with name "${resourceName}" not found`);
      }
      // Use first match
      resource = resources[0];
    }

    // Assign resource to ExtraWork
    const updatedResource = await this.resourceService.assignToExtraWork(
      resource.id,
      extraWorkId
    );

    return {
      success: true,
      data: updatedResource,
      message: `Resource "${resource.name}" assigned to ExtraWork ${extraWork.code || extraWorkId} successfully`
    };
  }
}
