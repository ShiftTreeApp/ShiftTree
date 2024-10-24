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
    with filtered as (
      select info.*, se.start_time, se.end_time
      from schedule_info as info
      join schedule_start_end as se on info.schedule_id = se.schedule_id
      where true
        and info.user_id = $1
        and info.user_role in (select json_array_elements($2) #>> '{}' as r)
      order by se.start_time asc, info.schedule_name asc
    )
    select coalesce(json_agg(json_build_object(
      'id', s.schedule_id,
      'name', s.schedule_name,
      'description', '',
      'owner', (
        select json_build_object(
          'id', ua.id,
          'displayName', ua.username,
          'email', ua.email,
          'profileImageUrl', '' -- TODO: Add profile image url
        )
        from user_account as ua
        where ua.id = s.owner_id
      ),
      'role', s.user_role,
      'startTime', (to_json(s.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
      'endTime', (to_json(s.end_time)#>>'{}')||'Z',
      'state', 'open'
    )), json_array()) as json
    from filtered as s
  `;

  const result = await pool.query({
    text: query,
    values: [userId, JSON.stringify(Array.from(new Set(params.role)))],
  });

  res.json(result.rows[0].json);
}

export async function getSchedule(req: Request, res: Response) {
  const scheduleId = req.params.scheduleId;
  const userId = await getUserId(req);

  const query = /* sql */ `
    with selected_schedule as (
      select info.*, se.start_time, se.end_time
      from schedule_info as info
      join schedule_start_end as se on info.schedule_id = se.schedule_id
      where info.user_id = $1 and info.id = $2
    )
    select json_build_object(
      'id', s.schedule_id,
      'name', s.schedule_name,
      'description', '',
      'owner', (
        select json_build_object(
          'id', ua.id,
          'displayName', ua.username,
          'email', ua.email,
          'profileImageUrl', '' -- TODO: Add profile image url
        )
        from user_account as ua
        where ua.id = s.owner_id
      ),
      'role', s.user_role,
      'startTime', (to_json(s.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
      'endTime', (to_json(s.end_time)#>>'{}')||'Z',
      'state', 'open'
    ) as json
    from selected_schedule as s
  `;

  const results = await pool.query({
    text: query,
    values: [userId, scheduleId],
  });

  if (results.rows.length < 1) {
    res.status(404).json({ error: "Schedule not found" });
  } else {
    res.status(200).json(results.rows[0].json);
  }
}

export async function deleteSchedule(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId as string;

  const schedulesQuery = /* sql */ `
    select * from schedule_info
    where schedule_info.user_id = $1 and schedule_info.id = $2
  `;

  const schedulesResult = await pool.query({
    text: schedulesQuery,
    values: [userId, scheduleId],
  });

  if (schedulesResult.rows.length < 1) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  const schedule = schedulesResult.rows[0];

  if (!(schedule.user_role === "owner" || schedule.user_role === "manager")) {
    res
      .status(403)
      .json({ error: "You do not have permission to delete this schedule" });
    return;
  }

  await pool.query({
    text: /* sql */ `
      update schedule
      set removed = current_timestamp
      where id = $1
    `,
    values: [scheduleId],
  });

  res.status(204).send();
}

export async function getShifts(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId as string;

  // Check that user can access the schedule
  {
    const results = await pool.query({
      text: /* sql */ `
        select *
        from schedule_info as info
        where info.user_id = $1 and info.schedule_id = $2
      `,
      values: [userId, scheduleId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
  }

  const results = await pool.query({
    text: /* sql */ `
      with sorted as
      (
        select *
        from shift as s
        where s.schedule_id = $1
        order by s.start_time asc
      )
      select json_agg(json_build_object(
        'id', s.id,
        'name', '', -- TODO: Add shift name to the schema
        'startTime', (to_json(s.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
        'endTime', (to_json(s.end_time)#>>'{}')||'Z'
      )) as json
      from sorted as s
    `,
    values: [scheduleId],
  });

  res.status(200).json(results.rows[0].json);
}

export async function createShift(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId as string;

  // Check that user can access the schedule and has permission to create shifts
  {
    const results = await pool.query({
      text: /* sql */ `
        select *
        from schedule_info as info
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
        error: "You do not have permission to create shifts for this schedule",
      });
      return;
    }
  }

  const results = await pool.query({
    text: /* sql */ `
      insert into shift (schedule_id, start_time, end_time)
      values ($1, $2, $3)
      returning json_build_object(
        'id', shift.id,
        'name', '', -- TODO: Add shift name to the schema
        'startTime', (to_json(shift.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
        'endTime', (to_json(shift.end_time)#>>'{}')||'Z'
      ) as json
    `,
    values: [scheduleId, req.body.startTime, req.body.endTime],
  });

  res.status(201).json(results.rows[0].json);
}
