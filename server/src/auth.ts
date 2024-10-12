const jwt = require('jsonwebtoken');
const {Pool} = require('pg');

//Pool to send DB queries to.
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dev',
  user: 'admin',
  password: '1234',
});

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

export const login = async (req, res) => {
  const {email, password} = req.body;
  console.log(email);
  console.log(password);
  const statement =   'SELECT username, email FROM user_account WHERE email = $1 AND password_hash = crypt($2, password_hash)';
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
      'ShiftTree', {
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