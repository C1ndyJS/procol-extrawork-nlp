import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { ExtraWorkService } from './domain/ExtraWorkService';
import { ResourceService } from './domain/ResourceService';
import { IntentionRegistry } from './intentions/IntentionRegistry';
import { ActionFactory } from './utils/ActionFactory';
import { CreateExtraWorkIntention } from './intentions/modules/CreateExtraWorkIntention';
import { SearchExtraWorkIntention } from './intentions/modules/SearchExtraWorkIntention';
import { UpdateExtraWorkIntention } from './intentions/modules/UpdateExtraWorkIntention';
import { DeleteExtraWorkIntention } from './intentions/modules/DeleteExtraWorkIntention';
import { ChangeExtraWorkStatusIntention } from './intentions/modules/ChangeExtraWorkStatusIntention';
import { AddResourceIntention } from './intentions/modules/AddResourceIntention';
import { CreateResourceIntention } from './intentions/modules/CreateResourceIntention';
import { AssignResourceToExtraWorkIntention } from './intentions/modules/AssignResourceToExtraWorkIntention';
import { OpenExtraWorkIntention } from './intentions/modules/OpenExtraWorkIntention';
import { SearchResourceIntention } from './intentions/modules/SearchResourceIntention';
import { UpdateResourceIntention } from './intentions/modules/UpdateResourceIntention';
import { DeleteResourceIntention } from './intentions/modules/DeleteResourceIntention';
import { createExtraWorkRoutes } from './api/routes/extrawork.routes';
import { createResourceRoutes } from './api/routes/resource.routes';
import { createActionRoutes } from './api/routes/action.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const extraWorkService = new ExtraWorkService(prisma);
const resourceService = new ResourceService(prisma);

// Initialize intention system
const intentionRegistry = new IntentionRegistry();

// Register intentions
intentionRegistry.register(new CreateExtraWorkIntention(extraWorkService));
intentionRegistry.register(new SearchExtraWorkIntention(extraWorkService));
intentionRegistry.register(new UpdateExtraWorkIntention(extraWorkService));
intentionRegistry.register(new DeleteExtraWorkIntention(extraWorkService));
intentionRegistry.register(new ChangeExtraWorkStatusIntention(extraWorkService));
intentionRegistry.register(new AddResourceIntention(resourceService));
intentionRegistry.register(new CreateResourceIntention(resourceService));
intentionRegistry.register(new AssignResourceToExtraWorkIntention(resourceService, extraWorkService));
intentionRegistry.register(new OpenExtraWorkIntention(extraWorkService));
intentionRegistry.register(new SearchResourceIntention(resourceService));
intentionRegistry.register(new UpdateResourceIntention(resourceService));
intentionRegistry.register(new DeleteResourceIntention(resourceService));

// Initialize action factory
const actionFactory = new ActionFactory(intentionRegistry);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'ExtraWorks API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/extraworks', createExtraWorkRoutes(extraWorkService));
app.use('/api/resources', createResourceRoutes(resourceService));
app.use('/api/actions', createActionRoutes(actionFactory));

// Get all registered intentions
app.get('/api/intentions', (req: Request, res: Response) => {
  const intentions = intentionRegistry.getAllIntentions().map(intent => ({
    name: intent.name,
    keywords: intent.keywords,
    description: intent.description
  }));
  res.json({ success: true, data: intentions });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
