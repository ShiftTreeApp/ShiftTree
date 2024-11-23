import { Request, Response } from "express";

import { pool } from "@/pool";

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const statement = `
    SELECT *
    FROM user_account
    WHERE email = $1
    `;
  const query = {
    text: statement,
    values: [email],
  };
  const { rows } = await pool.query(query);
  if (rows.length != 0) {
    res.status(400).send("User Already Has A ShiftTree Account");
    return;
  }

  try {
    /*
     * Matches the hash to that of the login's encode
     * Changes to hashing of either one requires changing the other
     */
    const insertUserStatement = `
      INSERT INTO user_account (username, email, password_hash)
      VALUES ($1, $2, encode(digest($3, 'sha256'), 'hex'))
      `;

    await pool.query(insertUserStatement, [username, email, password]);

    const selectKeyQuery = `
      SELECT reset_code FROM user_account WHERE email = $1
    `;
    const key = await pool.query(selectKeyQuery, [email]);

    console.log(key.rows[0]["reset_code"]);

    // Can choose to send an access token later on if we want the user to automatically login after registration
    res
      .status(201)
      .json({
        message: "Registration Successful",
        secretKey: key.rows[0]["reset_code"],
      });
    return;
  } catch (err) {
    console.log("Registration Error:", err);
    res.status(500).send("Internal Server Error");
    return;
  }
};
