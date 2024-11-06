import { pool } from "@/pool";
import { Request, Response } from "express";
import { z } from "zod";
const tokenPayload = z.object({ email: z.string(), name: z.string() });
import * as jwt from "jsonwebtoken";
//Scuffed copy paste
async function getUserId(req: Request) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("Missing token");
  }
  const decoded = tokenPayload.parse(
    jwt.verify(token, process.env.SHIFTTREE_JWT_PK as string),
  );

  const query = /* sql */ `
    SELECT u.id
    FROM user_account AS u
    WHERE u.email = $1
  `;
  const result = await pool.query({
    text: query,
    values: [decoded.email],
  });
  return result.rows[0].id as string;
}

// async function checkAuth(req: Request, ShiftTreeID) {}

// Fetches the join-code for a ShiftTree
export const getExistingJoinCode = async (req: Request, res: Response) => {
  try {
    const { ShiftTreeID } = req.query;
    const statement = "SELECT code FROM schedule WHERE id = $1";
    const query = {
      text: statement,
      values: [ShiftTreeID],
    };
    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      return res.status(404).send();
    }
    res.status(200).json({ code: rows[0].code });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// Generates a new join-code for a ShiftTree
export const generateJoinCode = async (req: Request, res: Response) => {
  try {
    const { ShiftTreeID } = req.query;
    console.log(ShiftTreeID);
    const statement =
      "UPDATE schedule SET code = gen_random_uuid() WHERE id = $1 RETURNING code";
    const query = {
      text: statement,
      values: [ShiftTreeID],
    };
    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      return res.status(404).send();
    }
    res.status(200).json({ code: rows[0].code });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// Adds a user to the ShiftTree
export const joinShiftTree = async (req: Request, res: Response) => {
  try {
    const { JoinCode } = req.query;
    console.log(JoinCode);
    const findScheduleQuery = {
      text: "SELECT id FROM schedule WHERE code = $1",
      values: [JoinCode],
    };
    const scheduleResult = await pool.query(findScheduleQuery);
    const UserID = await getUserId(req);
    if (scheduleResult.rows.length === 0) {
      return res.status(404).send("Invalid join code");
    }

    const scheduleID = scheduleResult.rows[0].id;
    console.log(scheduleID);
    console.log(UserID);
    const statement = `
      INSERT INTO user_schedule_membership (id, user_id, schedule_id)
      VALUES (gen_random_uuid(), $1, $2)
      ON CONFLICT (user_id, schedule_id) DO NOTHING
    `;
    const query = {
      text: statement,
      values: [UserID, scheduleID],
    };
    await pool.query(query);
    const result = await pool.query(query);
    console.log(result);

    res.status(200).send("User added to ShiftTree");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const removeUserFromShiftTree = async (req: Request, res: Response) => {
  const ShiftTreeID = req.params.scheduleID;
  const UserID = req.query.userID;
  const statement = `
    DELETE FROM user_schedule_membership
    WHERE user_id = $1 AND schedule_id = $2;
  `;
  const query = {
    text: statement,
    values: [UserID, ShiftTreeID],
  };
  //TODO: Add check actually removed user
  await pool.query(query);
  await pool.query(query);
  res.status(204).send("User removed from ShiftTree");
};
