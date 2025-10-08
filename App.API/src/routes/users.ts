import * as bcrypt from '@node-rs/bcrypt';
import express, { Request, Response, Router } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import { checkToken } from '../config/safeRoutes';
import ActiveSession from '../models/activeSession';
import User from '../models/user';
import { AppDataSource } from '../server/database';


const router: Router = express.Router();

// Joi schema for validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(4).max(15).optional(),
  password: Joi.string().required(),
});

// 🧩 REGISTER
router.post(
  '/register',
  async (
    req: Request & { body: { username: string; email: string; password: string } },
    res: Response
  ) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        msg: `Validation error: ${error.details[0].message}`,
      });
    }

    const { username, email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    try {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.json({ success: false, msg: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = userRepository.create({
        username,
        email,
        password: hashedPassword,
      });
      const savedUser = await userRepository.save(newUser);

      res.json({
        success: true,
        userID: savedUser.id,
        msg: 'The user was successfully registered',
      });
    } catch (err) {
      console.error('❌ Register error:', err);
      res.status(500).json({ success: false, msg: 'Internal server error' });
    }
  }
);

// 🧠 LOGIN
router.post(
  '/login',
  async (req: Request & { body: { email: string; password: string } }, res: Response) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        msg: `Validation error: ${error.details[0].message}`,
      });
    }

    const { email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const activeSessionRepository = AppDataSource.getRepository(ActiveSession);

    try {
      const user = await userRepository.findOne({ where: { email } });
      if (!user?.password) {
        return res.json({ success: false, msg: 'Wrong credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({ success: false, msg: 'Wrong credentials' });
      }

      if (!process.env.SECRET) {
        throw new Error('SECRET not provided');
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.SECRET,
        { expiresIn: 86400 } // 1 day
      );

      await activeSessionRepository.save({ userId: user.id, token });

      // Hide password in response
      (user as { password?: string }).password = undefined;

      res.json({ success: true, token, user });
    } catch (err) {
      console.error('❌ Login error:', err);
      res.status(500).json({ success: false, msg: 'Internal server error' });
    }
  }
);

// 🚪 LOGOUT
router.post(
  '/logout',
  checkToken,
  async (req: Request & { body: { token: string } }, res: Response) => {
    const { token } = req.body;
    const activeSessionRepository = AppDataSource.getRepository(ActiveSession);

    try {
      await activeSessionRepository.delete({ token });
      res.json({ success: true });
    } catch {
      res.json({ success: false, msg: 'Token revocation failed' });
    }
  }
);

// 🔍 CHECK SESSION
router.post('/checkSession', checkToken, (_req: Request, res: Response) => {
  res.json({ success: true });
});

// 👥 GET ALL USERS
router.post('/all', checkToken, async (_req: Request, res: Response) => {
  const userRepository = AppDataSource.getRepository(User);
  try {
    const users = await userRepository.find();
    const sanitizedUsers = users.map((u) => {
      const user = { ...u };
      delete (user as { password?: string }).password;
      return user;
    });
    res.json({ success: true, users: sanitizedUsers });
  } catch {
    res.json({ success: false });
  }
});

// ✏️ EDIT USER
router.post(
  '/edit',
  checkToken,
  async (
    req: Request & { body: { userID: string; username: string; email: string } },
    res: Response
  ) => {
    const { userID, username, email } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    try {
      const user = await userRepository.findOne({ where: { id: userID } });
      if (!user) {
        return res.json({ success: false, msg: 'User not found' });
      }

      user.username = username;
      user.email = email;
      await userRepository.save(user);

      res.json({ success: true });
    } catch (err) {
      console.error('❌ Edit error:', err);
      res.json({ success: false, msg: 'There was an error updating user' });
    }
  }
);

// 🔧 TEST ROUTE
router.get('/testme', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, msg: 'all good' });
});

export default router;
