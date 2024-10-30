import React, { useState } from "react";
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
import dayjs, { Dayjs } from "dayjs";

import Org_display from "./Org_display";

export default function Calendar_and_Org() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    if (date) {
      console.log(date.format("YYYY-MM-DD"));
    }
  };

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
          <DateCalendar
            renderLoading={() => <DayCalendarSkeleton />}
            value={selectedDate}
            onChange={handleDateChange}
          />
        </LocalizationProvider>

        {/* Grid that contains Organizations */}
        <Org_display />
      </Paper>
    </Grid>
  );
}
