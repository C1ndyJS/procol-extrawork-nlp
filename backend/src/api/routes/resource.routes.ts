import { Router, Request, Response } from 'express';
import { ResourceService } from '../../domain/ResourceService';

export function createResourceRoutes(resourceService: ResourceService): Router {
  const router = Router();

  // Get all Resources
  router.get('/', async (req: Request, res: Response) => {
    try {
      const resources = await resourceService.findAll();
      res.json({ success: true, data: resources });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get Resource by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const resource = await resourceService.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }
      res.json({ success: true, data: resource });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create Resource
  router.post('/', async (req: Request, res: Response) => {
    try {
      const resource = await resourceService.create(req.body);
      res.status(201).json({ success: true, data: resource });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update Resource
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const resource = await resourceService.update(req.params.id, req.body);
      res.json({ success: true, data: resource });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete Resource
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const resource = await resourceService.delete(req.params.id);
      res.json({ success: true, data: resource });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  return router;
}
