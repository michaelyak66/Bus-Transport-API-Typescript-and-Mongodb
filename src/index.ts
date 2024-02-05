import express, { Request, Response, NextFunction } from 'express';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { logger } from './helpers/utils';
import auth from './routes/auth';
import bus from './routes/bus';
import trip from './routes/trip';
import booking from './routes/booking';
import {connectToDatabase} from './controllers/db';


const swaggerDocument = YAML.load('./swagger.yaml');
dotenv.config();

const app = express();

const port: number = parseInt(process.env.PORT || '1337', 10); // Define the port for the server

// Log requests to the console.
app.use(morgan('dev'));

app.use(helmet())
  .disable('x-powered-by')
  .use(cors());

app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/api/v1', (req: Request, res: Response) => res.status(200).send({
  status: 'success',
  message: 'Welcome Save A Seat API'
}));

// Routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/buses', bus);
app.use('/api/v1/trips', trip);
app.use('/api/v1/bookings', booking);

// Swagger Documentation
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const startServer = async () => {
    try {
      const db = await connectToDatabase();
      app.listen(port, ()=> {
        console.log(`Node API app is running on port ${port}`)
        logger().info(`App running on port ${port}`);

    });} 
    catch (error) {
      console.error('Error starting the server:', error);
    }
  };
  
  startServer();
  
export default app;
