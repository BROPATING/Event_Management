/**
 * @file AuthController.ts
 * @description Manages User Registration, Password Security, and JWT Generation.
 * * SECURITY PROTOCOLS:
 * 1. Password Hashing: Uses bcrypt with a salt round of 10. Never store raw passwords.
 * 2. Uniqueness: Email is used as the primary identifier; checked before registration.
 * 3. JWT Strategy: Tokens are signed with a 7-day expiration (expiresIn: "7d").
 * 4. Error Masking: Login uses generic "Invalid credentials" for both email/password failures to prevent user enumeration.
 * * FLOW:
 * - Register: Email Check -> Hash -> Save -> 201.
 * - Login: Find User -> Hash Comparison -> Sign Token -> 200.
 */

import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * REGISTER:
User sends name + email + password
→ Check email not taken
→ Hash the password
→ Save to database
→ Return 201 success

LOGIN:
User sends email + password
→ Find user by email
→ Compare password with stored hash
→ If match → create JWT token
→ Return token to user
→ User uses token for all future requests
 */

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
