import { BaseIntention } from '../Intention';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

export class ChangeExtraWorkStatusIntention extends BaseIntention {
  name = 'change_extrawork_status';
  keywords = ['change', 'update', 'status', 'state', 'extrawork', 'pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
  description = 'Changes the status of an ExtraWork item';

  constructor(private extraWorkService: ExtraWorkService) {
    super();
  }

  async execute(params: { id: string; status: string }): Promise<any> {
    const { id, status } = params;
    
    if (!id || !status) {
      throw new Error('ExtraWork ID and status are required');
    }

    const extraWork = await this.extraWorkService.changeStatus(id, status);

    return {
      success: true,
      data: extraWork,
      message: `ExtraWork status changed to ${status} successfully`
    };
  }
}
