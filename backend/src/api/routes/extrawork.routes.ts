import { Router, Request, Response } from 'express';
import { ExtraWorkService } from '../../domain/ExtraWorkService';

export function createExtraWorkRoutes(extraWorkService: ExtraWorkService): Router {
  const router = Router();

  // Get all ExtraWorks
  router.get('/', async (req: Request, res: Response) => {
    try {
      const extraWorks = await extraWorkService.findAll();
      res.json({ success: true, data: extraWorks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get ExtraWork by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const extraWork = await extraWorkService.findById(req.params.id);
      if (!extraWork) {
        return res.status(404).json({ success: false, error: 'ExtraWork not found' });
      }
      res.json({ success: true, data: extraWork });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create ExtraWork
  router.post('/', async (req: Request, res: Response) => {
    try {
      const extraWork = await extraWorkService.create(req.body);
      res.status(201).json({ success: true, data: extraWork });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update ExtraWork
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const extraWork = await extraWorkService.update(req.params.id, req.body);
      res.json({ success: true, data: extraWork });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete ExtraWork
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const extraWork = await extraWorkService.delete(req.params.id);
      res.json({ success: true, data: extraWork });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  return router;
}
