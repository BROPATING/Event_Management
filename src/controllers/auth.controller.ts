import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRepo = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = userRepo.create({ name, email, passwordHash });
    await userRepo.save(user);

    res.status(201).json({ message: "User registered successfully", userId: user.id });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    res.json({ token, userId: user.id });
  } catch (err) {
    next(err);
  }
};