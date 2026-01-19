import { BaseIntention } from '../Intention';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

export class UpdateExtraWorkIntention extends BaseIntention {
  name = 'update_extrawork';
  keywords = ['update', 'modify', 'change', 'edit', 'extrawork'];
  description = 'Updates an existing ExtraWork item';

  constructor(private extraWorkService: ExtraWorkService) {
    super();
  }

  async execute(params: { id: string; title?: string; description?: string; status?: string; priority?: string }): Promise<any> {
    const { id, title, description, status, priority } = params;
    
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const extraWork = await this.extraWorkService.update(id, updateData);

    return {
      success: true,
      data: extraWork,
      message: `ExtraWork updated successfully`
    };
  }
}
