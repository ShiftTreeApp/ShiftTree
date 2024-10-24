import {
  Button,
  Grid2 as Grid,
  Typography,
  Paper,
  Card,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/en";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Navbar from "@/Navbar";
import ShiftTreeCard from "./ShiftTreeCard";

export default function Home() {
  // https://mui.com/x/react-date-pickers/date-calendar/#dynamic-data

  return (
    <Grid container direction="column" spacing={2}>
      {/* Contians everything */}
      <Navbar />

      {/* Grid for everything below navbar */}
      <Grid container spacing={2} sx={{ paddingLeft: 2, paddingRight: 2 }}>
        {/* Grid contains Calendar and org */}
        <Grid>
          <Paper
            sx={{
              backgroundColor: theme => theme.palette.background.default,
              minHeight: 600,
            }}
          >
            {/* Weird Calendar Shit */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar renderLoading={() => <DayCalendarSkeleton />} />
            </LocalizationProvider>

            {/* Grid that contains Organizations */}
            <Grid container color="primary" sx={{ pt: 1, pb: 1 }}>
              <Grid size={6}>
                <Typography
                  sx={{ marginLeft: 1, pt: 0.5, pb: 0.5, textAlign: "center" }}
                  color={"black"}
                  variant="h6"
                >
                  Organizations
                </Typography>
              </Grid>
            </Grid>
            <Divider variant="middle" />
            <Paper
              sx={{
                margin: 2, // Set margin on all sides
                flexGrow: 1,
                height: "calc(100% - 100px)", // Adjust height based on spacing needs
              }}
            >
              <Typography sx={{ padding: 2 }}> Sample Organization</Typography>
            </Paper>
          </Paper>
        </Grid>

        {/* Grid that contains shiftTrees info */}
        <Grid sx={{ flexGrow: 1 }}>
          {/* Grids that contains shiftTree buttons, first one for formatting */}
          <Paper
            sx={{
              backgroundColor: theme => theme.palette.background.default,
              minHeight: 600, // Adjust this value to set initial space
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Grid
              container
              spacing={1}
              sx={{ pt: 1, pb: 2, justifyContent: "space-between" }}
            >
              <Grid size={8}>
                <Typography
                  variant="h4"
                  color={"black"}
                  sx={{ marginLeft: 5, pt: 2 }}
                >
                  Your ShiftTrees
                </Typography>
              </Grid>
              {/* Grid that contains Buttons */}
            </Grid>
            <Divider variant="middle" />
            {/* ShiftTrees Cards Grid */}
            <Grid container spacing={2} sx={{ padding: 2 }}>
              {/* Example cards for ShiftTrees */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ShiftTreeCard
                  name="Open Shift"
                  status="open"
                  dates="Oct 1 - Oct 31"
                  description="description description description"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ShiftTreeCard
                  name="Closed Shift"
                  status="closed"
                  dates="Sept 1 - Sept 30"
                  description="This shift is closed. Hours schedlued: 120."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ShiftTreeCard
                  name="Your Shift"
                  status="owned"
                  dates="Aug 1 - Aug 31"
                  description="You own this shift. Description, maybe a button to close the schedule as well"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                {/* Another column for shiftTree card */}
              </Grid>
            </Grid>
          </Paper>
          {/* Grid that contains actual shiftTree cards */}
          <Grid></Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
