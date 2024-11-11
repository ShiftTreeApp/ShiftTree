import { Request, Response } from "express";
import { z } from "zod";
import * as jwt from "jsonwebtoken";

import { pool } from "@/pool";

const host = process.env.SHIFTTREE_PYTHON_HOST;
if (!host) {
  throw new Error("Environment variable SHIFTTREE_PYTHON_HOST is not set");
}

const tokenPayload = z.object({ email: z.string(), name: z.string() });

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

export async function sendShifts(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId as string;

  // Check that user can access the schedule
  {
    const results = await pool.query({
      text: /* sql */ `
          select * from schedule_info as info
          where info.user_id = $1 and info.schedule_id = $2
        `,
      values: [userId, scheduleId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (!(role === "owner" || role === "manager")) {
      res.status(403).json({
        error: "You do not have permission to view signups for this schedule",
      });
      return;
    }
  }

  const results = await pool.query({
    text: /* sql */ `
        select coalesce(json_agg(json_build_object(
          'id', shift.id,
          'start_time', (to_json(shift.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
          'end_time', (to_json(shift.end_time)#>>'{}')||'Z',
          'signups', (
            select coalesce(json_agg(json_build_object(
              'id', signup.id,
              'weight', signup.user_weighting,
              'user_id', signup.user_id
            )), json_array())
            from user_shift_signup as signup
            join user_account as ua on signup.user_id = ua.id
            where signup.shift_id = shift.id
          )
        )), json_build_array()) as json
        from shift
        join schedule on shift.schedule_id = schedule.id
        where schedule.id = $1
      `,
    values: [scheduleId],
  });
  console.log(results.rows[0].json);
  const result = await fetch(host + "/shifts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shifts: results.rows[0].json }),
  });
  console.log(await result.json());
  //   const insertQuery = await pool.query({
  //     text: "",
  //   });
  res.status(204).send();
}
