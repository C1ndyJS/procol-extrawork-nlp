import { BaseIntention } from '../Intention';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

export class CreateExtraWorkIntention extends BaseIntention {
  name = 'create_extrawork';
  keywords = ['create', 'new', 'add', 'extrawork', 'work', 'task'];
  description = 'Creates a new ExtraWork item';

  constructor(private extraWorkService: ExtraWorkService) {
    super();
  }

  async execute(params: { title: string; description: string; status?: string; priority?: string }): Promise<any> {
    const { title, description, status, priority } = params;
    
    const extraWork = await this.extraWorkService.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium'
    });

    return {
      success: true,
      data: extraWork,
      message: `ExtraWork "${title}" created successfully`
    };
  }
}
