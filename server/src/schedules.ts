import { Request, Response } from "express";
import { z } from "zod";
import * as jwt from "jsonwebtoken";
import * as csv from "csv-stringify";

import { pool } from "@/pool";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const tokenPayload = z.object({ email: z.string(), name: z.string() });

export async function create(req: Request, res: Response) {
  const userId = await getUserId(req);

  const scheduleInfo = req.body as {
    name: string;
    description?: string | null;
  };

  const result = await pool.query({
    text: /* sql */ `
      insert into schedule (owner_id, schedule_name, schedule_description)
      values ($1, $2, $3)
      returning id
    `,
    values: [userId, scheduleInfo.name, scheduleInfo.description ?? ""],
  });
  if (result.rows.length < 1) {
    console.error("Failed to create schedule");
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
  const scheduleId = result.rows[0].id as string;
  res.status(201).json({ scheduleId });
}

const listParams = z.object({
  role: z.array(z.enum(["owner", "member", "manager"])),
});

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

export async function list(req: Request, res: Response) {
  const params = listParams.parse(req.query);
  const userId = await getUserId(req);
  const date = req.query.date ? req.query.date : null;

  const query = /* sql */ `
    with filtered as (
      select info.*, se.start_time, se.end_time, ss.schedule_state
      from schedule_info as info
      join schedule_start_end as se on info.schedule_id = se.schedule_id
      join schedule_state as ss on info.schedule_id = ss.schedule_id
      where true
        and info.user_id = $1
        and info.user_role in (select json_array_elements($2) #>> '{}' as r)
        and (
          ($3::date is null) or (
            $3::date BETWEEN se.start_time::date AND se.end_time::date
          )
        )
      order by se.start_time asc, info.schedule_name asc
    )
    select coalesce(json_agg(json_build_object(
      'id', s.schedule_id,
      'name', s.schedule_name,
      'description', s.schedule_description,
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
      'state', s.schedule_state
    )), json_array()) as json
    from filtered as s
  `;

  const result = await pool.query({
    text: query,
    values: [userId, JSON.stringify(Array.from(new Set(params.role))), date],
  });

  res.json(result.rows[0].json);
}

export async function getSchedule(req: Request, res: Response) {
  const scheduleId = req.params.scheduleId;
  const userId = await getUserId(req);

  const query = /* sql */ `
    with selected_schedule as (
      select info.*, se.start_time, se.end_time, ss.schedule_state
      from schedule_info as info
      join schedule_start_end as se on info.schedule_id = se.schedule_id
      join schedule_state as ss on info.schedule_id = ss.schedule_id
      where info.user_id = $1 and info.schedule_id = $2
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
      'state', s.schedule_state
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
    where schedule_info.user_id = $1 and schedule_info.schedule_id = $2
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
      select coalesce(json_agg(json_build_object(
        'id', s.id,
        'name', s.shift_name,
        'description', s.shift_description,
        'startTime', (to_json(s.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
        'endTime', (to_json(s.end_time)#>>'{}')||'Z',
        'numSlots', s.num_slots
      )), json_build_array()) as json
      from sorted as s
    `,
    values: [scheduleId],
  });

  res.status(200).json(results.rows[0].json);
}

export async function createShift(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId as string;

  // Validate that the start date is before the end date
  if (req.body.startTime && req.body.endTime) {
    if (new Date(req.body.startTime) > new Date(req.body.endTime)) {
      res.status(400).json({
        error: "Shift start time must be before shift end time",
      });
      return;
    }
  }

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
      insert into shift (schedule_id, start_time, end_time, shift_name, shift_description, num_slots)
      values ($1, $2, $3, $4, $5, $6)
      returning json_build_object(
        'id', shift.id,
        'name', shift.shift_name,
        'description', shift.shift_description,
        'startTime', (to_json(shift.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
        'endTime', (to_json(shift.end_time)#>>'{}')||'Z',
        'numSlots', shift.num_slots
      ) as json
    `,
    values: [
      scheduleId,
      req.body.startTime,
      req.body.endTime,
      req.body.name,
      req.body.description ?? "",
      req.body.numSlots ?? 1,
    ],
  });

  res.status(201).json(results.rows[0].json);
}

export async function getMembers(req: Request, res: Response) {
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

    // TODO: Allow for members to view other members if the permission is set
    const role = results.rows[0].user_role;
    if (!(role === "owner" || role === "manager")) {
      res.status(403).json({
        error: "You do not have permission to view members of this schedule",
      });
      return;
    }
  }

  const results = await pool.query({
    text: /* sql */ `
      select coalesce(json_agg(json_build_object(
        'id', ua.id,
        'displayName', ua.username,
        'email', ua.email,
        'profileImageUrl', '',
        'suggestedShifts',
          CASE
            WHEN sc.base_min_per_employee + usm.shift_count_offset < 0 THEN 0
            ELSE sc.base_min_per_employee + usm.shift_count_offset
          END
      )), json_build_array()) as json
      from user_schedule_membership as usm
      join user_account as ua on usm.user_id = ua.id
      join schedule_counts as sc on usm.schedule_id = sc.schedule_id
      where usm.schedule_id = $1
    `,
    values: [scheduleId],
  });

  res.status(200).json(results.rows[0].json);
}

export async function getSignups(req: Request, res: Response) {
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
        'name', shift.shift_name,
        'description', shift.shift_description,
        'startTime', (to_json(shift.start_time)#>>'{}')||'Z', -- converting to ISO 8601 time
        'endTime', (to_json(shift.end_time)#>>'{}')||'Z',
        'numSlots', shift.num_slots,
        'signups', (
          select coalesce(json_agg(json_build_object(
            'id', signup.id,
            'weight', signup.user_weighting,
            'user', json_build_object(
              'id', ua.id,
              'displayName', ua.username,
              'email', ua.email,
              'profileImageUrl', ''
            )
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

  res.status(200).json(results.rows[0].json);
}

export async function getAssignments(req: Request, res: Response) {
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
        error:
          "You do not have permission to view assignments for this schedule",
      });
      return;
    }
  }

  const results = await pool.query({
    text: /* sql */ `
      select coalesce(json_agg(json_build_object(
        'shiftId', shift.id,
        'users', (
          select coalesce(json_agg(json_build_object(
            'id', ua.id,
            'displayName', ua.username,
            'email', ua.email,
            'profileImageUrl', ''
          )), json_build_array())
          from user_shift_assignment as usa
          join user_account as ua on usa.user_id = ua.id
          where usa.shift_id = shift.id
        )
      )), json_array()) as json
      from shift
      where shift.schedule_id = $1
    `,
    values: [scheduleId],
  });

  res.status(200).json(results.rows[0].json);
}

export async function deleteShift(req: Request, res: Response) {
  const userId = await getUserId(req);
  const shiftId = req.params.shiftId as string;

  // Check that user can access the shift
  {
    const results = await pool.query({
      text: /* sql */ `
        select *
        from shift
        join schedule_info as info on shift.schedule_id = info.schedule_id
        where info.user_id = $1 and shift.id = $2
      `,
      values: [userId, shiftId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (!(role === "owner" || role === "manager")) {
      res.status(403).json({
        error: "You do not have permission to delete this shift",
      });
      return;
    }
  }

  await pool.query({
    text: /* sql */ `
      delete from shift
      where id = $1
    `,
    values: [shiftId],
  });

  res.status(204).send();
}

export async function editShift(req: Request, res: Response) {
  const userId = await getUserId(req);
  const shiftId = req.params.shiftId as string;

  // Validate that the start date is before the end date
  if (req.body.startTime && req.body.endTime) {
    if (new Date(req.body.startTime) > new Date(req.body.endTime)) {
      res.status(400).json({
        error: "Shift start time must be before shift end time",
      });
      return;
    }
  }

  // Check that user can access the shift
  {
    const results = await pool.query({
      text: /* sql */ `
        select *
        from shift
        join schedule_info as info on shift.schedule_id = info.schedule_id
        where info.user_id = $1 and shift.id = $2
      `,
      values: [userId, shiftId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (!(role === "owner" || role === "manager")) {
      res.status(403).json({
        error: "You do not have permission to edit this shift",
      });
      return;
    }
  }

  await pool.query({
    text: /* sql */ `
      update shift
      set
        start_time = coalesce($2, start_time),
        end_time = coalesce($3, end_time),
        shift_name = coalesce($4, shift_name),
        shift_description = coalesce($5, shift_description),
        num_slots = coalesce($6, num_slots)
      where id = $1
    `,
    values: [
      shiftId,
      req.body.startTime,
      req.body.endTime,
      req.body.name,
      req.body.description,
      req.body.numSlots,
    ],
  });

  res.status(204).send();
}

export async function addSignup(req: Request, res: Response) {
  const userId = await getUserId(req);
  const shiftId = req.params.shiftId as string;
  const targetUserId = req.body.userId as string | null;
  const weight = req.body.weight as number | null;
  // If target user is specified, check that the current user has permission to sign users up in the schedule
  // and that the target user is a member of the schedule
  if (targetUserId && targetUserId !== userId && targetUserId != "none") {
    const results = await pool.query({
      text: /* sql */ `
          select info.user_role
          from schedule_info as info
          join shift on info.schedule_id = shift.schedule_id
          join user_schedule_membership as usm on info.schedule_id = usm.schedule_id
          where info.user_id = $1 and shift.id = $2
        `,
      values: [userId, shiftId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (!(role === "owner" || role === "manager")) {
      res.status(403).json({
        error: "You do not have permission to sign users up for this shift",
      });
      return;
    }

    // Ensure target user is a member of the schedule
    const targetUserResults = await pool.query({
      text: /* sql */ `
          select info.user_role
          from schedule_info as info
          join shift on info.schedule_id = shift.schedule_id
          where info.user_id = $1
        `,
      values: [targetUserId],
    });

    if (
      targetUserResults.rows.length < 1 ||
      targetUserResults.rows[0].user_role !== "member"
    ) {
      res.status(400).json({
        error: "Target user does not exist or is not a member of the schedule",
      });
      return;
    }
    await pool.query({
      text: /* sql */ `
        insert into user_shift_signup (user_id, shift_id, user_weighting)
        values ($1, $2, $3)
        on conflict (user_id, shift_id) do nothing
      `,
      values: [targetUserId, shiftId, weight ?? 1],
    });
  } else {
    // Ensure that the current user is a member of the schedule
    const results = await pool.query({
      text: /* sql */ `
        select info.user_role
        from schedule_info as info
        join shift on info.schedule_id = shift.schedule_id
        where info.user_id = $1 and shift.id = $2
      `,
      values: [userId, shiftId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (role !== "member") {
      res.status(403).json({
        error: "You are not allowed to sign up for this shift",
      });
      return;
    }
    await pool.query({
      text: /* sql */ `
        insert into user_shift_signup (user_id, shift_id, user_weighting)
        values ($1, $2, $3)
        on conflict (user_id, shift_id) do nothing
      `,
      values: [userId, shiftId, weight ?? 1],
    });
  }
  res.status(204).send();
}

export async function deleteSignup(req: Request, res: Response) {
  const userId = await getUserId(req);
  const shiftId = req.params.shiftId as string;
  const targetUserId = req.query.userId as string | null;

  // If target user is specified, check that the current user has permission to sign users up in the schedule
  // and that the target user is a member of the schedule
  if (targetUserId && targetUserId !== userId) {
    const results = await pool.query({
      text: /* sql */ `
          select info.user_role
          from schedule_info as info
          join shift on info.schedule_id = shift.schedule_id
          join user_schedule_membership as usm on info.schedule_id = usm.schedule_id
          where info.user_id = $1 and shift.id = $2
        `,
      values: [userId, shiftId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (!(role === "owner" || role === "manager")) {
      res.status(403).json({
        error:
          "You do not have permission to remove other users from this shift",
      });
      return;
    }

    // Ensure target user is a member of the schedule
    const targetUserResults = await pool.query({
      text: /* sql */ `
          select info.user_role
          from schedule_info as info
          join shift on info.schedule_id = shift.schedule_id
          where info.user_id = $1
        `,
      values: [targetUserId],
    });

    if (
      targetUserResults.rows.length < 1 ||
      targetUserResults.rows[0].user_role !== "member"
    ) {
      res.status(400).json({
        error: "Target user does not exist or is not a member of the schedule",
      });
      return;
    }
  } else {
    // Ensure that the current user is a member of the schedule
    const results = await pool.query({
      text: /* sql */ `
        select info.user_role
        from schedule_info as info
        join shift on info.schedule_id = shift.schedule_id
        where info.user_id = $1 and shift.id = $2
      `,
      values: [userId, shiftId],
    });

    if (results.rows.length < 1) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    const role = results.rows[0].user_role;
    if (role !== "member") {
      res.status(403).json({
        error: "You are not allowed to give up this shift",
      });
      return;
    }
  }

  await pool.query({
    text: /* sql */ `
      delete from user_shift_signup
      where user_id = $1 and shift_id = $2
    `,
    values: [targetUserId ?? userId, shiftId],
  });

  res.status(204).send();
}

export async function getUserSignups(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId;

  const query = /* sql */ `
      with shifts as (
        select *
        from shift as s
        where s.schedule_id = $1
      ),
      user_signups as (
        select uss.*
        from user_shift_signup as uss
        join shifts as s on uss.shift_id = s.id
      )
      select coalesce(json_agg(uss.shift_id), json_build_array()) as json
      from user_signups as uss
      where uss.user_id = $2
    `;

  const result = await pool.query({
    text: query,
    values: [scheduleId, userId],
  });

  if (result.rows.length < 1) {
    res
      .status(404)
      .json({ error: "No signups found OR user/schedule not found" });
    return;
  }

  res.json(result.rows[0].json);
}

export async function getUserAssignments(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId;

  const query = /* sql */ `
      with shifts as (
        select *
        from shift as s
        where s.schedule_id = $1
      ),
      user_assignments as (
        select usa.*
        from user_shift_assignment as usa
        join shifts as s on usa.shift_id = s.id
      )
      select coalesce(json_agg(ua.shift_id), json_build_array()) as json
      from user_assignments as ua
      where ua.user_id = $2
    `;

  const result = await pool.query({
    text: query,
    values: [scheduleId, userId],
  });

  if (result.rows.length < 1) {
    res
      .status(404)
      .json({ error: "No signups found OR user/schedule not found" });
    return;
  }

  res.json(result.rows[0].json);
}

async function getUserRole({
  userId,
  scheduleId,
}: {
  userId: string;
  scheduleId: string;
}): Promise<"owner" | "manager" | "member" | null> {
  const query = /* sql */ `
    select *
    from schedule_info as info
    where info.user_id = $1 and info.schedule_id = $2
  `;

  const results = await pool.query({
    text: query,
    values: [userId, scheduleId],
  });

  if (results.rows.length < 1) {
    return null;
  }

  return results.rows[0].user_role;
}

export async function getCsv(req: Request, res: Response) {
  const userId = await getUserId(req);
  const { scheduleId } = req.params as {
    scheduleId: string;
  };

  const { tz, type } = req.query as {
    tz: string;
    type: "shifts" | "assignments";
  };

  if (type === "shifts") {
    console.error("not implemented");
    res.sendStatus(500);
    return;
  }

  const userRole = await getUserRole({ userId, scheduleId });
  if (!userRole) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  if (userRole === "member") {
    res.status(403).json({
      error: "You do not have permission to view assignments for this schedule",
    });
    return;
  }

  const results = await pool.query({
    text: /* sql */ `
      select json_agg(json_build_object(
        'name', ua.username,
        'email', ua.email,
        'start_time', (to_json(s.start_time)#>>'{}')||'Z',
        'end_time', (to_json(s.end_time)#>>'{}')||'Z',
        'shift_name', s.shift_name,
        'multi_day', case when s.start_time::date <> s.end_time::date then 'yes' else 'no' end,
        'shift_description', s.shift_description
      )) as json
      from user_shift_assignment as usa
      join shift as s on usa.shift_id = s.id
      join user_account as ua on usa.user_id = ua.id
      where s.schedule_id = $1
    `,
    values: [scheduleId],
  });

  const rows = results.rows[0].json.map((row: Record<string, any>) => {
    const start = dayjs(row.start_time).tz(tz);
    const end = dayjs(row.end_time).tz(tz);
    return Object.assign(row, {
      shift_start: start.format("YYYY-MM-DD"),
      shift_start_time: start.format("HH:mm"),
      shift_end: end.format("YYYY-MM-DD"),
      shift_end_time: end.format("HH:mm"),
    });
  });

  const columns = {
    name: "Name",
    email: "Email",
    shift_start: "Shift Start Date",
    shift_end: "Shift End Date",
    shift_start_time: "Shift Start Time",
    shift_end_time: "Shift End Time",
    multi_day: "Spans Multiple Days?",
    shift_name: "Shift Name",
    shift_description: "Shift Description",
  };

  const csvString = await new Promise<string>((resolve, reject) =>
    csv.stringify(rows, { header: true, columns }, (err, str) => {
      if (err) {
        reject(err);
      } else {
        resolve(str);
      }
    }),
  );

  res.status(200).send({ csv: csvString });
}

export async function modifyRecommendedShifts(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId;
  const targetUserId = req.body.userId as string | null;
  const newRecommendedShifts = req.body.recommendedNumShifts as number | null;

  // Ensure that user exists and has perms to manage the schedule
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
      res.status(404).json({
        error: "Schedule not found or user does not exist",
      });
      return;
    }

    const role = results.rows[0].user_role;
    if (!(role == "owner" || role == "manager")) {
      res.status(403).json({
        error:
          "You do not have permission to modify the recommended shifts for a user",
      });
      return;
    }
  }

  const query = /* sql */ `
    update user_schedule_membership as usm
    set shift_count_offset = $1 - sc.base_min_per_employee
    from schedule_counts as sc
    where usm.schedule_id = sc.schedule_id
      and usm.user_id = $2 
      and usm.schedule_id = $3
  `;

  const results = await pool.query({
    text: query,
    values: [newRecommendedShifts, targetUserId, scheduleId],
  });

  if (!results.rowCount || results.rowCount < 1) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(204).send();
}

export async function deleteAllAssignments(req: Request, res: Response) {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId;

  console.log("delete assignments", scheduleId);

  // Ensure that user exists and has perms to manage the schedule
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
      res.status(404).json({
        error: "Schedule not found or user does not exist",
      });
      return;
    }

    const role = results.rows[0].user_role;
    if (!(role == "owner" || role == "manager")) {
      res.status(403).json({
        error:
          "You do not have permission to modify the recommended shifts for a user",
      });
      return;
    }
  }

  await pool.query({
    text: /* sql */ `
      delete from user_shift_assignment as usa
      using shift as s
      where s.schedule_id = $1 and usa.shift_id = s.id
    `,
    values: [scheduleId],
  });

  res.status(204).send();
}
