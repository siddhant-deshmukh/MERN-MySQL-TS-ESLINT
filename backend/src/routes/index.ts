import { Router } from 'express';

import authRoutes from '@src/routes/auth.routes';
import userRoutes from '@src/routes/user.routes';
import productRoutes from '@src/routes/product.routes';
import orderRoutes from '@src/routes/order.routes';
import exchangeRoutes from '@src/routes/exchange.routes';

import { authenticateToken } from '@src/middleware/authToken';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();


apiRouter.use('/', authRoutes);
apiRouter.use('/u', authenticateToken, userRoutes);
apiRouter.use('/products', authenticateToken, productRoutes);
apiRouter.use('/orders', authenticateToken, orderRoutes);
apiRouter.use('/exc', authenticateToken, exchangeRoutes);



/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
