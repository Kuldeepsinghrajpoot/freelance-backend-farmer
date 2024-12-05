import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app: Express = express();

// CORS Options
const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors({ ...corsOptions }));
app.use(express.json({ limit: "56kb" }));
app.use(express.urlencoded({ extended: true, limit: "56kb" }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes Import
import user from './app/routes/user.routes';
import admin from './app/routes/admin.routes';
import product from './app/routes/product.routes';
import order from './app/routes/order.routes';
import cart from './app/routes/cart.routes';
import payment from './app/routes/payment.routes';

// Routes Middleware
app.use('/api/v1/user', user);
app.use('/api/v1/admin', admin);
app.use('/api/v1/product', product);
app.use('/api/v1/order', order);
app.use('/api/v1/cart', cart);
app.use('/api/v1/payment', payment);

// Health Check Endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API is running fine!' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

export default app;
