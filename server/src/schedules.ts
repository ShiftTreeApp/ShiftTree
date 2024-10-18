import { Request, Response } from "express";
import { z } from "zod";
import * as jwt from "jsonwebtoken";

import { pool } from "@/pool";

const createScheduleInfo = z.object({
  name: z.string(),
  owner: z.string().optional(),
  description: z.string().optional(),
});

const tokenPayload = z.object({ email: z.string(), name: z.string() });

export async function create(req: Request, res: Response) {
  // TODO: Come up with a better way of doing this
  const token = req.headers.authorization?.split(" ")[1]!;
  const decoded = tokenPayload.parse(
    jwt.verify(token, process.env.SHIFTTREE_JWT_PK as string),
  );

  const scheduleInfo = createScheduleInfo.parse(req.body);
  const query = `
    WITH owner AS (
      SELECT u.id
      FROM user_account AS u
      WHERE u.email = $1
    )
    INSERT INTO schedule (owner_id, schedule_name)
    SELECT o.id, $2
    FROM owner AS o
    RETURNING id as schedule_id
  `;
  const result = await pool.query({
    text: query,
    values: [decoded.email, scheduleInfo.name],
  });
  const scheduleId = result.rows[0].schedule_id as string;
  res.status(201).json({ scheduleId });
}
