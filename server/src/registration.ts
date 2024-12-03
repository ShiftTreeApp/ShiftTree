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
    const genUUIDQuery = `
      SELECT gen_random_uuid() AS reset_token
    `;

    const uuidResult = await pool.query(genUUIDQuery);
    const secretKey = uuidResult.rows[0].reset_token;
    // Uncomment to get secretKey to test endpoints
    // console.log(secretKey);
    const insertUserStatement = `
      INSERT INTO user_account (username, email, password_hash, reset_code)
      VALUES ($1, $2, encode(digest($3, 'sha256'), 'hex'), encode(digest($4, 'sha256'), 'hex'))
      `;

    await pool.query(insertUserStatement, [
      username,
      email,
      password,
      secretKey,
    ]);

    // Can choose to send an access token later on if we want the user to automatically login after registration
    res.status(201).json({
      message: "Registration Successful",
      secretKey: secretKey,
    });
    return;
  } catch (err) {
    console.log("Registration Error:", err);
    res.status(500).send("Internal Server Error");
    return;
  }
};
