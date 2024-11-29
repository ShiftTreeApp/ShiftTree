import { pool } from "@/pool";
import { Request, Response } from "express";
import { z } from "zod";
const tokenPayload = z.object({ email: z.string(), name: z.string() });
import * as jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { json } from "stream/consumers";

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

export const getLogData = async (req: Request, res: Response) => {
  const userId = await getUserId(req);
  const scheduleId = req.params.scheduleId;

  // Checking that the user has correct permissions
  const schedulesQuery = /* sql */ `
    SELECT * FROM schedule_info
    WHERE schedule_info.user_id = $1 AND schedule_info.schedule_id = $2
  `;

  const schedulesResult = await pool.query({
    text: schedulesQuery,
    values: [userId, scheduleId],
  });

  if (schedulesResult.rows.length < 1) {
    res.status(404).send();
    return;
  }

  const schedule = schedulesResult.rows[0];

  if (!(schedule.user_role === "owner" || schedule.user_role === "manager")) {
    res.status(403).send();
    return;
  }

  // Fetch the JSON data for the specified schedule
  const query = /* sql */ `
    SELECT data
    FROM schedule
    WHERE id = $1
  `;
  const result = await pool.query({
    text: query,
    values: [scheduleId],
  });

  if (result.rows.length < 1) {
    res.status(404).send();
    return;
  }

  let jsonData = result.rows[0];

  const userIds = jsonData.data.assignments.map(
    (assignment: any) => assignment.user_id,
  );
  const shiftIds = jsonData.data.assignments.map(
    (assignment: any) => assignment.shift_id,
  );

  const userEmailsQuery = /* sql */ `
  SELECT id, email
  FROM user_account
  WHERE id = ANY($1::uuid[])
`;
  const userEmailsResult = await pool.query({
    text: userEmailsQuery,
    values: [userIds],
  });

  const shiftTimesQuery = /* sql */ `
  SELECT id, start_time, end_time
  FROM shift
  WHERE id = ANY($1::uuid[])
`;
  const shiftTimesResult = await pool.query({
    text: shiftTimesQuery,
    values: [shiftIds],
  });
  const userEmails = userEmailsResult.rows.reduce((acc: any, row: any) => {
    acc[row.id] = row.email;
    return acc;
  }, {});
  //TODO: Might be a time zone issue here
  console.log(userEmails);
  const shiftTimes = shiftTimesResult.rows.reduce((acc: any, row: any) => {
    acc[row.id] = {
      start_time: dayjs(row.start_time).format("MMMM D, YYYY"),
      end_time: dayjs(row.end_time).format("MMMM D, YYYY"),
      start_timestamp: row.start_time, // Keep the original timestamp for sorting
    };
    return acc;
  }, {});

  jsonData.data.assignments = jsonData.data.assignments.map(
    (assignment: any) => ({
      ...assignment,
      user_id: userEmails[assignment.user_id],
      shift_id: `${shiftTimes[assignment.shift_id].start_time} - ${shiftTimes[assignment.shift_id].end_time}`,
      start_timestamp: shiftTimes[assignment.shift_id].start_timestamp, // Add start timestamp for sorting
    }),
  );
  jsonData.data.assignments.sort(
    (a: any, b: any) =>
      new Date(a.start_timestamp).getTime() -
      new Date(b.start_timestamp).getTime(),
  );
  jsonData.data.assignments = jsonData.data.assignments.map(
    (assignment: any) => {
      const { start_timestamp, ...rest } = assignment;
      return rest;
    },
  );

  res.status(200).json({ logData: jsonData });
};
