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

  // Get ExtraWorks by status
  router.get('/status/:status', async (req: Request, res: Response) => {
    try {
      const extraWorks = await extraWorkService.findByStatus(req.params.status);
      res.json({ success: true, data: extraWorks });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
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
      const { title, description, priority, startDate, endDate } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ success: false, error: 'Title and description are required' });
      }

      const createData: any = {
        title,
        description,
        priority: priority || 'medium',
        status: 'pending'
      };
      if (startDate) createData.startDate = new Date(startDate);
      if (endDate) createData.endDate = new Date(endDate);

      const extraWork = await extraWorkService.create(createData);
      res.status(201).json({ success: true, data: extraWork });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update ExtraWork
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { title, description, priority, startDate, endDate } = req.body;
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);

      const extraWork = await extraWorkService.update(req.params.id, updateData);
      res.json({ success: true, data: extraWork });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Change ExtraWork status
  router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const extraWork = await extraWorkService.changeStatus(req.params.id, status);
      res.json({ success: true, data: extraWork, message: `Status changed to ${status}` });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete ExtraWork
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const extraWork = await extraWorkService.delete(req.params.id);
      res.json({ success: true, data: extraWork, message: 'ExtraWork deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  return router;
}
