import jwt from "jsonwebtoken";
import * as process from "node:process";
import { NextFunction, Request, Response } from "express";

import { pool } from "@/pool";

const jwtKey = process.env.SHIFTTREE_JWT_PK;
if (!jwtKey) {
  throw new Error("Environment variable SHIFTTREE_JWT_PK is not set");
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  const statement = `
  SELECT username, email
  FROM user_account
  WHERE email = $1 AND password_hash = encode(digest($2, 'sha256'), 'hex')
`;
  const query = {
    text: statement,
    values: [email, password],
  };
  const { rows } = await pool.query(query);
  console.log(rows);
  if (rows.length == 0) {
    res.status(401).send("Invalid Gmail Or Password");
    return;
  }
  if (rows[0]) {
    console.log("hello");
    // If we want to make this secure we should change the 'ShiftTree' to be
    // randomly generated key that is stored with our server instance on startup in environment.
    // This works for now though
    const accessToken = jwt.sign(
      { email: rows[0].email, name: rows[0].username },
      jwtKey,
      {
        expiresIn: "8h",
        algorithm: "HS256",
      },
    );
    res.status(200).json({ name: rows[0].username, accessToken: accessToken });
    return;
  }
};

// Verifys that the token provided is valid
export const authorizationCheck = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorizationHeader = req.headers.authorization as string;
  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    res.sendStatus(401).json({ error: "Missing token" });
    return;
  }
  jwt.verify(token, jwtKey, (err, user) => {
    if (err) {
      res.sendStatus(401).json({ error: "Invalid token" });
    }
    (req as any).user = user;
    next();
  });
};
