import {
  //Button,
  Grid2 as Grid,
  Paper,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/en";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Org_display from "./Org_display";

export default function Calendar_and_Org() {
  return (
    <Grid sx={{ flexGrow: 1, display: "flex" }}>
      <Paper
        sx={{
          backgroundColor: theme => theme.palette.background.default,
          minHeight: 600,
          flexGrow: 1,
          borderRadius: 0,
        }}
      >
        {/* Weird Calendar Shit */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar renderLoading={() => <DayCalendarSkeleton />} />
        </LocalizationProvider>

        {/* Grid that contains Organizations */}
        <Org_display />
      </Paper>
    </Grid>
  );
}
