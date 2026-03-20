import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
   * It 1st check the header authorization section then if startwith !Bearer then throw res.json (401)
   else split that header into [Bearer](0) [eacuney.abc](1)
 * If valid they get in. If not they get rejected.
    Request arrives
     ↓
    authMiddleware checks token
        ↓
    Valid?   → passes to controller ✅
    Invalid? → returns 401 ❌

 */

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "No token provided" });
  
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload; // gets the logged in user's ID
    //Passes user data to next controller
    next(); //This is crucial. In Express middleware you MUST call `next()` to pass control to the next function in the chain. 
    // Without it the request hangs forever and never reaches the controller.
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * header.split(" ")[1];
 * "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.abc"
  `.split(" ")` splits it into an array by the space:
  ["Bearer", "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.abc"]
    [0]              [1]

 * `jwt.verify()` does two things at once:
  1. Checks the signature → was this token created with our secret key?
  2. Checks expiry       → has the 7 day expiry passed?

 */

/**
 * jwt.verify()Checks signature + expiry of token
 * req.user = payloadPasses user data to next controller
 */