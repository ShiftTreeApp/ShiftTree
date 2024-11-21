import { useState } from "react";
import { Button, Grid2 as Grid, Paper } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/en";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

export default function Calendar_and_Org({
  onDateChange,
}: {
  onDateChange: (date: string | null) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    onDateChange(date ? date.format("YYYY-MM-DD") : null);
  };

  // Set the calendar to today's date, then clear the selection
  const handleFilterResetClick = () => {
    const today = dayjs();
    setSelectedDate(today);
    onDateChange(null);
    setTimeout(() => setSelectedDate(null), 0);
  };

  return (
    <Grid sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
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
      </Paper>

      <Button
        variant="contained"
        onClick={handleFilterResetClick}
        sx={{ backgroundColor: theme => theme.palette.secondary.main }}
      >
        Reset Calendar Filter
      </Button>
    </Grid>
  );
}
