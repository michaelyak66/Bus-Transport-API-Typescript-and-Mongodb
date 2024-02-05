import express, { Router } from 'express';
import Auth from '../controllers/Auth';
import ValidateInput from '../helpers/validateInput';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../helpers/utils';


const { create, login } = Auth;
const { validateSignup, validateSignin } = ValidateInput;

const router: Router = express.Router();

router.post('/signup', validateSignup, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await create(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/signin', validateSignin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
