import { BaseIntention } from '../Intention';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

/**
 * Opens/navigates to a specific ExtraWork by ID or code
 */
export class OpenExtraWorkIntention extends BaseIntention {
  name = 'open_extrawork';
  keywords = [
    'open', 'abrir', 'ver', 'mostrar', 'ir', 'go',
    'extrawork', 'trabajo',
    'ew-', 'ew'
  ];
  description = 'Abre o navega a un ExtraWork específico';

  constructor(private extraWorkService: ExtraWorkService) {
    super();
  }

  async execute(params: { 
    id?: string; 
    code?: string;
  }): Promise<any> {
    const { id, code } = params;

    if (!id && !code) {
      throw new Error('ExtraWork ID or code is required');
    }

    let extraWork;

    if (id) {
      extraWork = await this.extraWorkService.findById(id);
    } else if (code) {
      // Try to find by code if we have a method for it
      // For now, try ID first, then search
      extraWork = await this.extraWorkService.findById(code);
      if (!extraWork) {
        // Search by code in title or description as fallback
        const results = await this.extraWorkService.search(code);
        extraWork = results.find(ew => ew.code === code) || results[0];
      }
    }

    if (!extraWork) {
      throw new Error(`ExtraWork not found with id/code: ${id || code}`);
    }

    return {
      success: true,
      data: extraWork,
      message: `ExtraWork ${extraWork.code || extraWork.id} opened successfully`,
      // Include navigation hint for frontend
      navigate: true,
      extraWorkId: extraWork.id
    };
  }
}
