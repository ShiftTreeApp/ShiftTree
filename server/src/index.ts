import "@/patch-express";
import process from "node:process";
import cors from "cors";
import "dotenv/config";
import express from "express";
import yaml from "js-yaml";
import fs from "fs";
import swaggerUI from "swagger-ui-express";
import path from "path";
import OpenApiValidator from "express-openapi-validator";
import { Request, Response, NextFunction } from "express";

import * as auth from "@/auth";
import * as registration from "@/registration";
import * as schedules from "@/schedules";
import * as invites from "@/invites";
import * as autoschedule from "@/autoscheduling";
import * as ICS from "@/ICSFile";
import * as reset from "@/passwordResets";

//Setup
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const apiSpec = path.join(__dirname, "../api/openapi.yaml");
const apidoc = yaml.load(fs.readFileSync(apiSpec, "utf8"));
//Backend configuration for swagger/automatic validation
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(apidoc as any));

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({
    error: err.message,
  });
});

// Add routes here
// app.REQUESTTYPE('endpoint',{put middleware(authentication) here}, file.FunctionName)
app.post("/login", auth.login);
app.post("/register", registration.registerUser);
app.get("/confirmResetCodeValid", reset.confirmResetCodeValid);
app.post("/resetPassword", reset.resetPassword);
app.post("/schedules", auth.authorizationCheck, schedules.create);
app.get("/schedules", auth.authorizationCheck, schedules.list);
app.get(
  "/schedules/:scheduleId",
  auth.authorizationCheck,
  schedules.getSchedule,
);
app.delete(
  "/schedules/:scheduleId",
  auth.authorizationCheck,
  schedules.deleteSchedule,
);
app.get(
  "/schedules/:scheduleId/shifts",
  auth.authorizationCheck,
  schedules.getShifts,
);
app.get(
  "/schedules/:scheduleId/members",
  auth.authorizationCheck,
  schedules.getMembers,
);
app.get(
  "/schedules/:scheduleId/signups",
  auth.authorizationCheck,
  schedules.getSignups,
);
app.get(
  "/schedules/:scheduleId/assignments",
  auth.authorizationCheck,
  schedules.getAssignments,
);
app.post(
  "/schedules/:scheduleId/shifts",
  auth.authorizationCheck,
  schedules.createShift,
);
app.delete("/shifts/:shiftId", auth.authorizationCheck, schedules.deleteShift);
app.put("/shifts/:shiftId", auth.authorizationCheck, schedules.editShift);
app.post("/signups/:shiftId", auth.authorizationCheck, schedules.addSignup);
app.delete(
  "/signups/:shiftId",
  auth.authorizationCheck,
  schedules.deleteSignup,
);

app.get(
  "/schedules/:scheduleId/user-signups",
  auth.authorizationCheck,
  schedules.getUserSignups,
);

app.get(
  "/schedules/:scheduleId/user-assigned",
  auth.authorizationCheck,
  schedules.getUserAssignments,
);

app.get(
  "/shiftTreeCodeExisting",
  auth.authorizationCheck,
  invites.getExistingJoinCode,
);
app.get(
  "/shiftTreeCodeGenerate",
  auth.authorizationCheck,
  invites.generateJoinCode,
);
app.put("/joinShiftTree", auth.authorizationCheck, invites.joinShiftTree);
app.post(
  "/autoschedule/:scheduleId",
  auth.authorizationCheck,
  autoschedule.sendShifts,
);
app.delete(
  "/removeUser/:scheduleID",
  auth.authorizationCheck,
  invites.removeUserFromShiftTree,
);
app.get(
  "/schedules/:scheduleId/csv",
  auth.authorizationCheck,
  schedules.getCsv,
);
app.get("/schedules/:scheduleId/ics", auth.authorizationCheck, ICS.getICSFile);

app.use((err: Error, _rq: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const port = process.env.SHIFTTREE_PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/api-docs`);
});
