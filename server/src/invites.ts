import { pool } from "@/pool";

// Returns True if user in schedule at least once
const checkUserInSchedule = async (ID, user) =>{
    const statement = `
        SELECT usm.id
        FROM user_schedule_membership usm
        JOIN user_account ua ON usm.user_id = ua.id
        WHERE usm.schedule_id = $1 AND ua.email = $2
    `;
    const query = {
        text: statement,
        values: [ID, user],
    };
    const { rows } = await pool.query(query);
    return rows.length > 0;
}


export const fetchShiftTreeUUID = async (req, res) => { 
    const ShiftTree = req.query.ShiftTree;
    console.log(ShiftTree);
    const statement = 'SELECT id FROM schedule WHERE schedule_name = $1';
    const query = {
        text: statement,
        values: [ShiftTree],
      };
    const {rows} = await pool.query(query);
    if(rows.length == 0) {
        res.status(404).send();
    }
    console.log(rows[0]);
    res.status(200).json(rows[0]['id']);
}

// Handles user join requests, and confirms query was succesful.
export const requestToJoin = async (req, res) => {
    const ID = req.query.ShiftTreeID;
    const email = req.user['email']
    if(await checkUserInSchedule(ID, email)) {
        // If the user is already in the schedule, should requests just do nothing? Or send error?
        res.status(200).send();
        return;
    }
    console.log(req.user['email']);
    const statement = `
        INSERT INTO user_schedule_membership (id, user_id, schedule_id)
        VALUES (gen_random_uuid(), (SELECT id FROM user_account WHERE email = $2), $1)
    `;
    const query = {
        text: statement,
        values: [ID, email]
    }
    await pool.query(query);
    if(await checkUserInSchedule(ID, email)) {
        res.status(200).send();
        return;
    }
    res.status(500).send()
}