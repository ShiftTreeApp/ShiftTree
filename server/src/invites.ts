import { pool } from "@/pool";
import { Request, Response } from "express";

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
    const { ShiftTreeID, UserID } = req.query;
    const statement = `
      INSERT INTO user_schedule_membership (id, user_id, schedule_id)
      VALUES (gen_random_uuid(), $1, $2)
      ON CONFLICT (user_id, schedule_id) DO NOTHING
    `;
    const query = {
      text: statement,
      values: [UserID, ShiftTreeID],
    };
    await pool.query(query);
    const result = await pool.query(query);
    console.log(result);
    // //Might not need, could just do 200 and act like was added
    // if (result.rowCount === 0) {
    //   return res.status(409).send("User is already a member of this schedule");
    // }
    res.status(200).send("User added to ShiftTree");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// WIP: Need to figure out join-schema adjustment?
// // Fetches the join-code for an Organization
// export const getExistingOrgJoinCode = async (req: Request, res: Response) => {
//   try {
//     const { OrgID } = req.query;
//     const statement = "SELECT code FROM organization WHERE id = $1";
//     const query = {
//       text: statement,
//       values: [OrgID],
//     };
//     const { rows } = await pool.query(query);
//     if (rows.length === 0) {
//       return res.status(404).send();
//     }
//     res.status(200).json({ code: rows[0].code });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// };

// // Generates a new join-code for an Organization
// export const generateOrgJoinCode = async (req: Request, res: Response) => {
//   try {
//     const { OrgID } = req.query;
//     const statement =
//       "UPDATE organization SET code = gen_random_uuid() WHERE id = $1 RETURNING code";
//     const query = {
//       text: statement,
//       values: [OrgID],
//     };
//     const { rows } = await pool.query(query);
//     if (rows.length === 0) {
//       return res.status(404).send();
//     }
//     res.status(200).json({ code: rows[0].code });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// };

// // Adds a user to the Organization
// export const joinOrganization = async (req: Request, res: Response) => {
//   try {
//     const { OrgID, UserID } = req.query;
//     const statement = `
//       INSERT INTO user_schedule_membership (id, user_id, schedule_id)
//       VALUES (gen_random_uuid(), $1, $2)
//       ON CONFLICT (user_id, schedule_id) DO NOTHING
//     `;
//     const query = {
//       text: statement,
//       values: [UserID, OrgID],
//     };
//     await pool.query(query);
//     const result = await pool.query(query);
//     console.log(result);
//     // //Might not need, could just do 200 and act like was added
//     // if (result.rowCount === 0) {
//     //   return res.status(409).send("User is already a member of this schedule");
//     // }
//     res.status(200).send("User added to ShiftTree");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// };
