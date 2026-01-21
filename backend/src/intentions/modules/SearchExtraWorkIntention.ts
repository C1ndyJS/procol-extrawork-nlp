import { BaseIntention } from '../Intention';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

export class SearchExtraWorkIntention extends BaseIntention {
  name = 'search_extrawork';
  keywords = ['search', 'buscar', 'find', 'encontrar', 'look', 'ver', 'mostrar', 'query', 'extrawork', 'trabajo', 'trabajos', 'list', 'listar'];
  description = 'Busca o lista ExtraWorks';

  constructor(private extraWorkService: ExtraWorkService) {
    super();
  }

  async execute(params: { query?: string }): Promise<any> {
    const { query } = params;
    
    let extraWorks;
    if (query) {
      extraWorks = await this.extraWorkService.search(query);
    } else {
      extraWorks = await this.extraWorkService.findAll();
    }

    return {
      success: true,
      data: extraWorks,
      message: `Found ${extraWorks.length} ExtraWork items`
    };
  }
}
