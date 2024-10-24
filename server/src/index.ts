import "@/patch-express";
import process from "node:process";
const cors = require('cors')
import "dotenv/config";
import express from "express";
const yaml = require('js-yaml')
import fs from 'fs';
const swaggerUI = require('swagger-ui-express')
import path from 'path';
import OpenApiValidator from 'express-openapi-validator';
import { Request, Response, NextFunction } from "express";

// IMPORT FILES HERE
import { router } from "@/router";
const auth = require('./auth');
const registration = require('./registration')
import * as schedules from "@/schedules";

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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({
    error: err.message,
  });
})

// Add routes here
// app.REQUESTTYPE('endpoint',{put middleware(authentication) here}, file.FunctionName)
app.get("/*", router);
app.post('/login', auth.login);
app.post('/register', registration.registerUser)
app.post('/schedules', auth.authorizationCheck, schedules.create);
app.get('/schedules', auth.authorizationCheck, schedules.list);
app.get('/schedules/:scheduleId', auth.authorizationCheck, schedules.getSchedule);
app.delete('/schedules/:scheduleId', auth.authorizationCheck, schedules.deleteSchedule);
app.get('/schedules/:scheduleId/shifts', auth.authorizationCheck, schedules.getShifts);
app.post('/schedules/:scheduleId/shifts', auth.authorizationCheck, schedules.createShift);

app.use((err: Error, _rq: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
})



const port = process.env.SHIFTTREE_PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/api-docs`);
});
