// src/routes/orderRoutes.ts
import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import Order, { IOrder } from '@src/models/Order'; // MongoDB Order Model
import Product, { IProduct } from '@src/models/Product'; // MongoDB Product Model
import { User } from '@src/models/User'; // MySQL User Model
import mongoose from 'mongoose'; // For ObjectId validation
import { authenticateToken } from '@src/middleware/authToken';
import { expressRouterValidator } from './common/util';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { Op } from 'sequelize';

const router = Router();

const checkUserExists = async (userId: number): Promise<boolean> => {
  const user = await User.findByPk(userId);
  return !!user; // Convert to boolean
};

const validateAndGetProductPrices = async (productIds: string[]) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { uniqueObjectIds: [], productPrices: null }; // Empty or invalid array
  }

  // Check for duplicate product IDs within the input array
  const uniqueProductIds = new Set(productIds.map(id => id.toString()));
  // if (uniqueProductIds.size !== productIds.length) {
  //   return null; // Duplicate product IDs found in the input array
  // }

  // Convert string IDs to Mongoose ObjectIds for querying if they are strings
  const uniqueObjectIds = Array.from(uniqueProductIds).map(id => new mongoose.Types.ObjectId(id));

  const products: IProduct[] = await Product.find({ _id: { $in: uniqueObjectIds } }).lean();

  // Check if all requested products were found
  if (products.length !== Array.from(uniqueProductIds).length) {
    return { uniqueObjectIds, productPrices: null }; // Some product IDs were not found
  }

  // Return an array of prices
  return { uniqueObjectIds, productPrices: products.map(p => p.price) };
};


// POST /api/orders - Create a new order
router.post(
  '/',
  authenticateToken, // Protect this route
  [
    body('userId')
      .notEmpty().withMessage('User ID is required')
      .isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    body('productIds')
      .notEmpty().withMessage('Product IDs are required')
      .isArray().withMessage('Product IDs must be an array')
      .custom((value: string[]) => {
        // Validate each element in the array as a valid MongoDB ObjectId string
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Product IDs array cannot be empty');
        }
        for (const id of value) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid product ID: ${id}`);
          }
        }
        return true;
      }),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { userId, productIds } = req.body as { userId: number, productIds: string[] };
    // const authenticatedUserId = req.user_id; // Get user ID from JWT

    //! Ensure the order is created for the authenticated user
    // if (authenticatedUserId && authenticatedUserId !== userId) {
    //   res.status(403).json({ message: 'Cannot create order for a different user ID.' });
    //   return;
    // }

    // 1. Validate User Exists
    const userExists = await checkUserExists(userId);
    if (!userExists) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ message: `User with ID ${userId} does not exist.` });
      return;
    }

    // 2. Validate Product IDs and get prices, check for duplicates
    const { uniqueObjectIds, productPrices } = await validateAndGetProductPrices(productIds);
    if (!productPrices) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'One or more product IDs are invalid, not found, or duplicates exist.' });
      return;
    }

    // 3. Calculate totalAmount
    const totalAmount = productPrices.reduce((sum, price) => sum + price, 0);

    // Create new order
    const newOrder: IOrder = new Order({
      userId,
      productIds: uniqueObjectIds, // Convert to ObjectId
      totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure two decimal places
    });

    const savedOrder: IOrder = await newOrder.save();
    res.status(HttpStatusCodes.CREATED).json(savedOrder);
  },
);

router.get(
  '/',
  authenticateToken, // Protect this route
  async (_: Request, res: Response) => {
    const orders = await Order.find().populate('productIds').lean();
    const uniqueUserIds = [...new Set(orders.map(order => order.userId))];

    const users = await User.findAll({
      where: { id: { [Op.in]: uniqueUserIds } },
      attributes: ['id', 'username'], // Select specific user fields
    });

    const userMap = new Map(users.map(user => [user.id, user.toJSON()])); // .toJSON() for plain JS object

    // 5. Enrich each order with user data
    const enrichedOrders = orders.map(order => {
      const user = userMap.get(order.userId);
      return {
        ...order,
        user: user ?? null,
      };
    });

    res.status(HttpStatusCodes.OK).json(enrichedOrders);
  },
);


// GET /api/orders/:_id - Retrieve an order by ID
router.get(
  '/:_id',
  authenticateToken, // Protect this route
  [
    param('_id').isMongoId().withMessage('Invalid Order ID'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { _id } = req.params;
    const order = await Order.findById(_id).populate('productIds').lean() as IOrder | null;

    if (!order) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'Order not found' });
      return;
    }
    const user = await User.findByPk(order?.userId);
    res.status(HttpStatusCodes.OK).json({order: { ...order, user }} );
  },
);

// PUT /api/orders/:_id - Update an order by ID
router.put(
  '/:_id',
  authenticateToken, // Protect this route
  [
    param('_id').isMongoId().withMessage('Invalid Order ID'),
    body('userId')
      .optional()
      .isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    body('productIds')
      .optional()
      .isArray().withMessage('Product IDs must be an array')
      .custom((value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Product IDs array cannot be empty');
        }
        for (const id of value) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid product ID: ${id}`);
          }
        }
        return true;
      }),
    // totalAmount should ideally be recalculated, but allowing it for flexibility
    body('totalAmount')
      .optional()
      .isFloat({ min: 0 }).withMessage('Total amount cannot be negative'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { _id } = req.params;
    const { userId, productIds, totalAmount } = req.body as { userId: number, productIds: string[], totalAmount?: number };
    // const authenticatedUserId = req.user_id;

    const updateData: Partial<IOrder> = {};

    if (userId) {
      // if (authenticatedUserId && authenticatedUserId !== userId) {
      //   res.status(403).json({ message: 'Cannot change order to a different user ID.' });
      //   return;
      // }
      const userExists = await checkUserExists(userId);
      if (!userExists) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ message: `User with ID ${userId} does not exist.` });
        return;
      }
      updateData.userId = userId;
    }

    // Handle productIds update and recalculate totalAmount
    if (productIds) {
      const { uniqueObjectIds, productPrices } = await validateAndGetProductPrices(productIds);
      if (!productPrices) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'One or more product IDs are invalid, not found, or duplicates exist.' });
        return;
      }
      updateData.productIds = uniqueObjectIds;
      updateData.totalAmount = parseFloat(productPrices.reduce((sum, price) => sum + price, 0).toFixed(2));
    } else if (totalAmount) {
      // If productIds are not updated but totalAmount is provided, use it directly
      // This assumes the client knows the correct totalAmount, which is less secure
      updateData.totalAmount = parseFloat(totalAmount.toFixed(2));
    }

    if (Object.keys(updateData).length === 0) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'No valid fields provided for update.' });
      return;
    }

    const updatedOrder: IOrder | null = await Order.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }, // `new: true` returns the updated document, `runValidators: true` runs schema validators
    );

    if (!updatedOrder) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'Order not found' });
      return;
    }
    res.status(HttpStatusCodes.OK).json(updatedOrder);
  },
);

// DELETE /api/orders/:_id - Delete an order by ID
router.delete(
  '/:_id',
  authenticateToken, // Protect this route
  [
    param('_id').isMongoId().withMessage('Invalid Order ID'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { _id } = req.params;
    const deletedOrder: IOrder | null = await Order.findByIdAndDelete(_id);

    if (!deletedOrder) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'Order not found' });
      return;
    }
    res.status(HttpStatusCodes.NO_CONTENT).send(); // 204 No Content for successful deletion
  },
);

export default router;