import process from "node:process";
const cors = require('cors')
import "dotenv/config";
import express from "express";
const yaml = require('js-yaml')
import fs from 'fs';
const swaggerUI = require('swagger-ui-express')
import path from 'path';
import OpenApiValidator from 'express-openapi-validator';

// IMPORT FILES HERE
import { router } from "@/router";
const auth = require('./auth');

//Setup
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


const apiSpec = path.join(__dirname, '../api/openapi.yaml');
const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));
//Backend configuration for swagger/automatic validation
app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(apidoc),
)

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  })
)

// Add routes here
// app.REQUESTTYPE('endpoint',{put middleware(authentication) here}, file.FunctionName)
app.get("/*", router);
app.post('/login', auth.login);
app.post('/register', auth.registerUser)

app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  })

})



const port = process.env.SHIFTTREE_PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/api-docs`);
});
