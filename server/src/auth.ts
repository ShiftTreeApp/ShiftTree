const jwt = require('jsonwebtoken');
const {Pool} = require('pg');
import * as process from "node:process";

//Pool to send DB queries to.
const pool = new Pool({
  host: process.env.SHIFTTREE_PG_HOST,
  port: process.env.SHIFTTREE_PG_PORT,
  database: process.env.SHIFTTREE_PG_DATABASE,
  user: process.env.SHIFTTREE_PG_USER,
  password: process.env.SHIFTTREE_PG_PASSWORD,
});
// TODO: Validate env vars

// Might not need this
// const getUsernameByEmail = async (email) => {
//   const statement = 'SELECT username FROM user_account WHERE email = $1';
//   const query = {
//     text: statement,
//     values: [email],
//   };
//   const {rows} = await pool.query(query);
//   return rows[0];
// };

const jwtKey = process.env.SHIFTTREE_JWT_PK;
if (!jwtKey) {
  throw new Error("Environment variable SHIFTTREE_JWT_PK is not set");
}

export const login = async (req, res) => {
  const {email, password} = req.body;
  console.log(email);
  console.log(password);
  const statement = `
  SELECT username, email
  FROM user_account
  WHERE email = $1 AND password_hash = encode(digest($2, 'sha256'), 'hex')
`;
  const query = {
    text: statement,
    values: [email, password],
  };
  const {rows} = await pool.query(query);
  console.log(rows);
  if (rows.length == 0) {
    res.status(401).send('Invalid Gmail Or Password');
    return;
  }
  if (rows[0]) {
    console.log('hello');
    // If we want to make this secure we should change the 'ShiftTree' to be
    // randomly generated key that is stored with our server instance on startup in environment.
    // This works for now though
    const accessToken = jwt.sign(
      {email: rows[0].email, name: rows[0].username},
      jwtKey, {
        expiresIn: '30m',
        algorithm: 'HS256',
      });
    res.status(200).json({name: rows[0].username, accessToken: accessToken});
    return;
};
}

// Verifys that the token provided is valid
export const authorizationCheck = (req,res,next) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader.split(' ')[1];
  jwt.verify(token, 'ShiftTree', (err,user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  })


}