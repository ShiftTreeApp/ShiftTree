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
    const userId = await getUserId(req);
    const { ShiftTreeID } = req.query;

    const schedulesQuery = /* sql */ `
    select * from schedule_info
    where schedule_info.user_id = $1 and schedule_info.schedule_id = $2
  `;

    const schedulesResult = await pool.query({
      text: schedulesQuery,
      values: [userId, ShiftTreeID],
    });
    console.log(schedulesResult.rows[0]);

    if (schedulesResult.rows.length < 1) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    const schedule = schedulesResult.rows[0];

    if (!(schedule.user_role === "owner" || schedule.user_role === "manager")) {
      res.status(403).json({
        error: "You do not have permission to invite users to this schedule",
      });
      return;
    }

    const statement = "SELECT code FROM schedule WHERE id = $1";
    const query = {
      text: statement,
      values: [ShiftTreeID],
    };
    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      res.status(404).send();
      return;
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
    const userId = await getUserId(req);
    const { ShiftTreeID } = req.query;
    const schedulesQuery = /* sql */ `
    select * from schedule_info
    where schedule_info.user_id = $1 and schedule_info.schedule_id = $2
  `;

    const schedulesResult = await pool.query({
      text: schedulesQuery,
      values: [userId, ShiftTreeID],
    });
    console.log(schedulesResult.rows[0]);
    if (schedulesResult.rows.length < 1) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    const schedule = schedulesResult.rows[0];

    if (!(schedule.user_role === "owner" || schedule.user_role === "manager")) {
      res.status(403).json({
        error: "You do not have permission to invite users to this schedule",
      });
      return;
    }
    const statement =
      "UPDATE schedule SET code = gen_random_uuid() WHERE id = $1 RETURNING code";
    const query = {
      text: statement,
      values: [ShiftTreeID],
    };
    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      res.status(404).send();
      return;
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
      text: "SELECT id, owner_id FROM schedule WHERE code = $1",
      values: [JoinCode],
    };
    const scheduleResult = await pool.query(findScheduleQuery);
    const UserID = await getUserId(req);
    if (scheduleResult.rows.length === 0) {
      res.status(404).send("Invalid join code");
      return;
    }

    if (scheduleResult.rows[0].owner_id === UserID) {
      res.status(403).json("Owner cannot join their own ShiftTree as a member");
      return;
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

    res.status(204).send("User added to ShiftTree");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const removeUserFromShiftTree = async (req: Request, res: Response) => {
  const currentUserId = await getUserId(req);
  const ShiftTreeID = req.params.scheduleID;
  const targetUserId = req.query.userID ?? currentUserId;
  const schedulesQuery = /* sql */ `
  select * from schedule_info
  where schedule_info.user_id = $1 and schedule_info.schedule_id = $2
`;

  const schedulesResult = await pool.query({
    text: schedulesQuery,
    values: [currentUserId, ShiftTreeID],
  });

  if (schedulesResult.rows.length < 1) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  // if (!(schedule.user_role === "owner" || schedule.user_role === "manager")) {
  //   res.status(403).json({
  //     error: "You do not have permission to invite users to this schedule",
  //   });
  //   return;
  // }
  // If the target user is not the current user, check if the current user is the owner
  if (targetUserId !== currentUserId) {
    const results = await pool.query({
      text: /* sql */ `
        select *
        from schedule_info as info
        where info.schedule_id = $1 and info.user_id = $2
      `,
      values: [ShiftTreeID, currentUserId],
    });

    if (results.rows.length === 0) {
      res.status(404).send({ error: "Schedule not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (role !== "owner") {
      res.status(403).send({
        error: "Current user does not have permission to remove other users",
      });
      return;
    }
  }

  // Check if the target user is the owner
  {
    const results = await pool.query({
      text: /* sql */ `
        select *
        from schedule_info as info
        where info.schedule_id = $1 and info.user_id = $2 and info.user_role = 'owner'
      `,
      values: [ShiftTreeID, targetUserId],
    });

    if (results.rows.length !== 0) {
      res.status(403).send({ error: "Owner cannot be removed from schedule" });
    }
  }

  // Otherwise the current user is the target user, so they can remove themself

  const statement = `
    DELETE FROM user_schedule_membership
    WHERE user_id = $1 AND schedule_id = $2;
  `;
  const query = {
    text: statement,
    values: [targetUserId, ShiftTreeID],
  };
  await pool.query(query);
  res.sendStatus(204);
};
