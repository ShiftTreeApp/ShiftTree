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

const listParams = z.object({
  role: z.array(z.enum(["owner", "member", "manager"])),
});

async function getUserId(req: Request) {
  const token = req.headers.authorization?.split(" ")[1]!;
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

export async function list(req: Request, res: Response) {
  const params = listParams.parse(req.query);
  const userId = await getUserId(req);

  const query = /* sql */ `
    with all_schedules as (
      select *
      from (
        select schedule.*, 'owner' as user_role from schedule
        where owner_id = $1
      )
      union (
        select sch.*, 'member' as user_role from schedule as sch
        join user_schedule_membership as us on us.schedule_id = sch.id
        join user_account as ua on us.user_id = ua.id
        where ua.id = $1
      )
    ),
    filtered as (
      select
        sch.*, 
        (
          select shift.start_time
          from shift
          where shift.schedule_id = sch.id
          order by shift.start_time asc
          limit 1
        ) as start_time,
        (
          select shift.end_time
          from shift
          where shift.schedule_id = sch.id
          order by shift.end_time desc
          limit 1
        ) as end_time
      from all_schedules as sch
      where sch.user_role in (select json_array_elements($2) #>> '{}' as r)
      order by start_time asc, sch.schedule_name asc
    )
    select coalesce(json_agg(json_build_object(
      'id', f.id,
      'name', f.schedule_name,
      'description', '',
      'owner', (
        select json_build_object(
          'id', ua.id,
          'displayName', ua.username,
          'email', ua.email,
          'profileImageUrl', '' -- TODO: Add profile image url
        )
        from user_account as ua
        where ua.id = f.owner_id
      ),
      'role', f.user_role,
      'startTime', (to_json(f.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
      'endTime', (to_json(f.end_time)#>>'{}')||'Z',
      'state', 'open'
    )), json_array()) as json
    from filtered as f
  `;

  const result = await pool.query({
    text: query,
    values: [userId, JSON.stringify(Array.from(new Set(params.role)))],
  });

  res.json(result.rows[0].json);
}
