import { body, param } from 'express-validator';
import { Router, Request, Response } from 'express';

import Product, { IProduct } from '@src/models/Product';
import { RouteError } from '@src/common/util/route-errors';
import { expressRouterValidator } from '@src/routes/common/util';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

const router = Router();

// GET all products
router.get('/', async (_: Request, res: Response) => {
  const products: IProduct[] = await Product.find();
  res.status(HttpStatusCodes.OK).json(products);
});

// GET product by ID
router.get(
  '/:_id',
  [
    param('_id').isMongoId().withMessage('Invalid Product ID'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { _id } = req.params;
    const product = await Product.findById(_id).lean();

    if (!product) 
      throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Product Not Found');
      
    res.status(HttpStatusCodes.OK).json(product);
  },
);

// CREATE a new product
router.post(
  '/',
  [
    body('name')
      .notEmpty().withMessage('Product name is required')
      .isLength({ min: 3 }).withMessage('Product name must be at least 3 characters long'),
    body('price')
      .notEmpty().withMessage('Product price is required')
      .isFloat({ min: 0.2, max: 1000000 }).withMessage('Product price must be between 0.2 and 1,000,000'),
    body('description')
      .optional() // Description is optional
      .isLength({ max: 1000 }).withMessage('Product description cannot exceed 1000 characters'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { name, price,description } = req.body as IProduct;
    const savedProduct = await Product.create({
      name,
      price,
      description,
    });
    res.status(HttpStatusCodes.CREATED).json({
      ...savedProduct.toObject()
    });
  },
);

// UPDATE a product by ID
router.put(
  '/:_id',
  [
    param('_id').isMongoId().withMessage('Invalid Product ID'),
    body('name')
      .optional() // Allow partial updates
      .isLength({ min: 3 }).withMessage('Product name must be at least 3 characters long'),
    body('price')
      .optional() // Allow partial updates
      .isFloat({ min: 0.2, max: 1000000 }).withMessage('Product price must be between 0.2 and 1,000,000'),
    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('Product description cannot exceed 1000 characters'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { _id } = req.params;
    const { name, price, description } = req.body as IProduct; 

    const toUpdate: Partial<IProduct> = {};
    if(name) toUpdate.name = name;
    if(price) toUpdate.price = price;
    if(description || typeof description == 'string') toUpdate.description = description;
    
    const updatedProduct: IProduct | null = await Product.findByIdAndUpdate(
      _id,
      toUpdate,
      { new: true },
    );

    if (!updatedProduct)
      throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Product Not Found');
    
    res.status(HttpStatusCodes.OK).json(updatedProduct);
  },
);

// DELETE a product by ID
router.delete(
  '/:_id',
  [
    param('_id').isMongoId().withMessage('Invalid Product ID'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { _id } = req.params;
    const deletedProduct: IProduct | null = await Product.findByIdAndDelete(_id);

    if (!deletedProduct) 
      throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Product Not Found');

    res.status(HttpStatusCodes.NO_CONTENT).send(); // 204 No Content for successful deletion
  },
);

export default router;