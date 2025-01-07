import express, { Application } from 'express';
import tasksRoutes from './routes/tasksRoutes';

const app: Application = express();
app.use(express.json());

// Rotas
app.use('/tasks', tasksRoutes);

app.get('/', (_, res) => {
    res.json({message: 'API is running' });
});

export default app;