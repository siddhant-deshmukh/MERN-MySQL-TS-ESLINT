import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import * as jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';

import { ICreateUser, User } from '@src/models/User'; // Import the Sequelize User model
import { expressRouterValidator } from '@src/routes/common/util';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import ENV from '@src/common/constants/ENV';

const router = Router();

// User Registration
router.post(
  '/register',
  [
    body('username')
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
      .isAlphanumeric().withMessage('Username must be alphanumeric'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { username, password } = req.body as ICreateUser;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(HttpStatusCodes.CONFLICT).json({ msg: 'Username already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    const token = generateToken(newUser.id);
    // Avoid sending back the hashed password directly in the response
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
    };

    res.status(201).json({ msg: 'User registered successfully', user: userResponse, token });
  },
);

// User Login
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const { username, password } = req.body as ICreateUser;

    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: 'Invalid credentials' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials' });
      return;
    }
    const token = generateToken(user.id);

    // In a real application, you would generate a JWT token here
    // For this example, we'll just send a success msg.
    const userResponse = {
      id: user.id,
      username: user.username,
    };

    res.status(200).json({ msg: 'Logged in successfully', user: userResponse, token });
  },
);

function generateToken(userId: number): string {
  return jwt.sign({ id: userId }, ENV.JwtSecret, { expiresIn: ENV.JwtSecretExpiryTime == 'TRUE' ? 24*60*60 : 240*60*60 });
}


export default router;