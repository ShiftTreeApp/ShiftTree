import {
  Switch,
  Breadcrumbs,
  Typography,
  Box,
  Link

} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Fragment } from "react";

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
      
      <EditButton/>

    </Box>
  )
}


function EditButton(){
  return(
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        flexGrow: 1,
        gap: 1.5,
      }}
    >
      <Typography>test</Typography>
      <Switch/>
    </Box>
  )
}