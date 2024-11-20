import { pool } from "@/pool";
import { Request, Response } from "express";
import { z } from "zod";
const tokenPayload = z.object({ email: z.string(), name: z.string() });
import * as jwt from "jsonwebtoken";
import * as ics from "ics";
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

export const getICSFile = async (req: Request, res: Response) => {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId;

  //Checking that the user has correct permissions
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
      .json({ error: "You do not have permission to view this schedule" });
    return;
  }
  //TODO: Check shifts are assigned, and schedule is not still pending

  // Fetch relevant data for the ICS file from the schedule
  const query = /* sql */ `
      SELECT usa.id AS assignment_id,
             usa.user_id,
             usa.shift_id,
             usa.requested_weight,
             s.start_time,
             s.end_time,
             s.shift_name,
             s.shift_description,
             ua.email,
             ua.username
      FROM user_shift_assignment usa
      JOIN shift AS s ON usa.shift_id = s.id
      JOIN user_account AS ua ON usa.user_id = ua.id
      WHERE s.schedule_id = $1
    `;
  const result = await pool.query({
    text: query,
    values: [scheduleId],
  });
  const map = new Map<string, any[]>();

  result.rows.forEach(value => {
    const key = `${value.start_time}${value.end_time}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)?.push(value);
  });

  //TODO: Check if it's null
  const events = [];
  for (let [key, value] of map) {
    let title = value.map(v => v.username).join(" and ");
    let combinedEmails = value.map(v => v.email).join(", ");
    //Get all the data and not merge it
    events.push({
      start: [
        new Date(value[0].start_time).getFullYear(),
        new Date(value[0].start_time).getMonth() + 1,
        new Date(value[0].start_time).getDate(),
        new Date(value[0].start_time).getHours(),
        new Date(value[0].start_time).getMinutes(),
      ],
      end: [
        new Date(value[0].end_time).getFullYear(),
        new Date(value[0].end_time).getMonth() + 1,
        new Date(value[0].end_time).getDate(),
        new Date(value[0].end_time).getHours(),
        new Date(value[0].end_time).getMinutes(),
      ],
      title: schedule.schedule_name + ":" + title,
      description: combinedEmails,
      uid: value[0].assignment_id,
    });
  }
  ics.createEvents(events as any, (error, value) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error generating ICS file");
      return;
    }
    res.status(200).send({ ics: value });
  });
};
