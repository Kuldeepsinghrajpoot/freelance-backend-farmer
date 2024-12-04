import express, { Express } from 'express';
import cors from 'cors';
const app: Express = express();
import cookieparsar from 'cookie-parser'

const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors({ ...corsOptions }));

app.use(express.json({ limit: "56kb" }))
app.use(express.urlencoded({ extended: true, limit: "56kb" }))
app.use(express.static('public'))
app.use(cookieparsar())

// here we are importing the prouduct from the controller

import prouduct from "./app/routes/product.routes"
import user from "./app/routes/user.routes"
app.use('/api/v1/product', prouduct);
app.use('/api/v1/', user);


export default app;