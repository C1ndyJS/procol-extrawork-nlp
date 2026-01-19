import { Router, Request, Response } from 'express';
import { ActionFactory } from '../../utils/ActionFactory';

export function createActionRoutes(actionFactory: ActionFactory): Router {
  const router = Router();

  // Search actions by natural language query
  router.post('/search', async (req: Request, res: Response) => {
    try {
      const { query, threshold } = req.body;
      
      if (!query) {
        return res.status(400).json({ success: false, error: 'Query is required' });
      }

      const actions = actionFactory.searchActions(query, threshold);
      res.json({ success: true, data: actions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute action by natural language query
  router.post('/execute', async (req: Request, res: Response) => {
    try {
      const { query, params } = req.body;
      
      if (!query) {
        return res.status(400).json({ success: false, error: 'Query is required' });
      }

      const action = actionFactory.createAction(query, params);
      
      if (!action) {
        return res.status(404).json({ 
          success: false, 
          error: 'No matching action found for the query' 
        });
      }

      const result = await action.execute();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute action by intent name
  router.post('/execute/:intent', async (req: Request, res: Response) => {
    try {
      const { intent } = req.params;
      const { params } = req.body;

      const action = actionFactory.createActionByIntent(intent, params);
      
      if (!action) {
        return res.status(404).json({ 
          success: false, 
          error: `Intent "${intent}" not found` 
        });
      }

      const result = await action.execute();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
