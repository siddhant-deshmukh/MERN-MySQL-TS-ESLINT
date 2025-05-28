import { Router, Request, Response } from 'express';

import { User } from '@src/models/User'; // Import the Sequelize User model
import { expressRouterValidator } from '@src/routes/common/util';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

const router = Router();

// User Registration
router.get(
  '/',
  expressRouterValidator,
  async (req: Request, res: Response) => {
    const existingUser = await User.findOne({ where: { id: req.user_id }, attributes: ['username', 'id'] });
    if (existingUser) {
      res.status(HttpStatusCodes.OK).json({ user: existingUser });
      return;
    }

    res.status(404).json({ msg: 'Not Found' });
  },
);

export default router;