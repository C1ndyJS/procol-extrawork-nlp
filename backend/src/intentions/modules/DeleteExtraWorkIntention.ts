import { BaseIntention } from '../Intention';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

export class DeleteExtraWorkIntention extends BaseIntention {
  name = 'delete_extrawork';
  keywords = ['delete', 'remove', 'destroy', 'extrawork'];
  description = 'Deletes an ExtraWork item';

  constructor(private extraWorkService: ExtraWorkService) {
    super();
  }

  async execute(params: { id: string }): Promise<any> {
    const { id } = params;
    
    const extraWork = await this.extraWorkService.delete(id);

    return {
      success: true,
      data: extraWork,
      message: `ExtraWork deleted successfully`
    };
  }
}
