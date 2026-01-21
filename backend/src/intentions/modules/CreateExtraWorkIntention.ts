import { BaseIntention } from '../Intention';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

export class CreateExtraWorkIntention extends BaseIntention {
  name = 'create_extrawork';
  keywords = ['create', 'crear', 'new', 'nuevo', 'add', 'añadir', 'agregar', 'extrawork', 'trabajo', 'work', 'task', 'tarea'];
  description = 'Crea un nuevo ExtraWork';

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
