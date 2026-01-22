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

  // Get Resources by ExtraWork ID (must be before /:id route)
  router.get('/extrawork/:extraWorkId', async (req: Request, res: Response) => {
    try {
      const resources = await resourceService.findByExtraWorkId(req.params.extraWorkId);
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
      const { name, type, url, metadata, extraWorkId } = req.body;
      
      if (!name || !type || !extraWorkId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name, type, and extraWorkId are required' 
        });
      }

      const resource = await resourceService.create({
        name,
        type,
        url: url || undefined,
        metadata: metadata || undefined,
        extraWork: { connect: { id: extraWorkId } }
      });
      res.status(201).json({ success: true, data: resource });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update Resource
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { name, type, url, metadata } = req.body;
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (url !== undefined) updateData.url = url;
      if (metadata !== undefined) updateData.metadata = metadata;

      const resource = await resourceService.update(req.params.id, updateData);
      res.json({ success: true, data: resource });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Assign Resource to ExtraWork
  router.post('/:id/assign/:extraWorkId', async (req: Request, res: Response) => {
    try {
      const resource = await resourceService.assignToExtraWork(
        req.params.id,
        req.params.extraWorkId
      );
      res.json({ 
        success: true, 
        data: resource, 
        message: `Resource assigned to ExtraWork successfully` 
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete Resource
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const resource = await resourceService.delete(req.params.id);
      res.json({ success: true, data: resource, message: 'Resource deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  return router;
}
