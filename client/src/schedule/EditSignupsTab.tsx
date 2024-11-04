import {
  Switch,
  Breadcrumbs,
  Typography,
  Box,
  Link,
  Tooltip,
  MenuList,
  MenuItem,
  ButtonGroup,
  Grow,
  Popper,
  Paper
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useState, useRef } from "react";

import { useApi } from "@/client";

interface EditSignupsTabProps {
  scheduleId: string;
}

export default function EditSignupTab(props: EditSignupsTabProps) {
  const api = useApi();

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        flexGrow: 1,
        gap: 1.5,
      }}
    >
      <Breadcrumbs>
        <Link component={RouterLink} to={`/schedule/${props.scheduleId}`}>
          {scheduleData?.name ?? scheduleData?.id ?? "Schedule"}
        </Link>
        <Typography>Edit Signup Options</Typography>
      </Breadcrumbs>

      <SwitchButton buttonType={"off"} buttonText="Test" />
      <SwitchButton
        buttonType={"on"}
        buttonText="test2"
        buttonDesc="This button is very special and does this thing!"
      />
    </Box>
  );
}

/* 
  
  Button types for menu options:

  'on'       : by default the button (switch) is on
  'off'      : by default the button (switch) is off
  'disabed'  : button (switch) is disabled

*/

interface SwitchButtonProps {
  buttonType?: string; // Type of the button
  buttonText?: string; // Text to the right of the button
  buttonDesc?: string; // Additional Description when you hover over the button
}

function SwitchButton(props: SwitchButtonProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        flexGrow: 1,
        gap: 1.5,
      }}
    >
      <Typography>{props.buttonText}</Typography>

      {/* Type of button */}
      {props.buttonType == "on" && (
        <Tooltip title={props.buttonDesc || ""}>
          <Switch defaultChecked />
        </Tooltip>
      )}
      {props.buttonType == "off" && (
        <Tooltip title={props.buttonDesc || ""}>
          <Switch />
        </Tooltip>
      )}
      {props.buttonType == "disabled" && (
        <Tooltip title={props.buttonDesc || ""}>
          <Switch disabled />
        </Tooltip>
      )}
    </Box>
  );
}

