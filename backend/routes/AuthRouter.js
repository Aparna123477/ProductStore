import express from 'express';
import { signupValidation, loginValidation } from '../middleware/AuthValidation.js';
import {signup,login,refresh,logout} from '../controller/AuthController.js';



const router = express.Router();

router.post('/login',loginValidation,login);

router.post('/signup', signupValidation,signup);

router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;