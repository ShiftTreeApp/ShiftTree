import { Request, Response } from "express";
import { pool } from "@/pool";

export const confirmResetCodeValid = async (req: Request, res: Response) => {
  const resetCode = req.query.resetCode;
  const emailAddress = req.query.email;
  console.log("Hello");
  console.log(emailAddress);
  const statement = `
    SELECT email FROM user_account 
    WHERE reset_code = encode(digest($1, 'sha256'), 'hex') 
    AND email = $2
  `;
  const results = await pool.query({
    text: statement,
    values: [resetCode, emailAddress],
  });
  console.log(results);
  if (results.rows.length < 1) {
    res.status(401).send();
    return;
  }
  res.status(200).send();
};

export const resetPassword = async (req: Request, res: Response) => {
  const resetCode = req.query.resetCode;
  const newPassword = req.query.newPassword;
  console.log(newPassword);
  const statement = `
    UPDATE user_account
    SET password_hash = encode(digest($1, 'sha256'), 'hex')
    WHERE reset_code = encode(digest($2, 'sha256'), 'hex')
  `;
  try {
    await pool.query({
      text: statement,
      values: [newPassword, resetCode],
    });
    res.status(201).send();
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).send();
  }
};
