import { Button, Grid2 as Grid, Typography } from "@mui/material";
import { green, amber } from "@mui/material/colors";
import { useNavigate } from "react-router";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/en";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Navbar from "@/Navbar";

export default function Home() {
  // https://mui.com/x/react-date-pickers/date-calendar/#dynamic-data

  const navigate = useNavigate();

  const shiftTreeCreate = () => {
    // Navigate to the create a shift tree page
    navigate("/Create");
  };
  const shiftTreeJoin = () => {
    // Navigate to join a shiftTree page
    navigate("/JoinTree");
  };

  return (
    <Grid container direction="column" spacing={2}>
      {/* Contians everything */}
      <Navbar />

      {/* Grid for the Calendar and Organizations */}
      <Grid container spacing={2}>
        {/* Grid contains Calendar */}
        <Grid style={{ outline: "2px solid black", backgroundColor: "silver" }}>
          {/* Weird Calendar Shit */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar renderLoading={() => <DayCalendarSkeleton />} />
          </LocalizationProvider>

          {/* Grid that contains Organizations */}
          <Grid
            container
            style={{ backgroundColor: "green", outline: "2px solid black" }}
            sx={{ pt: 1, pb: 1 }}
          >
            <Grid size={6}>
              <Typography
                sx={{ marginLeft: 1, pt: 0.5, pb: 0.5, textAlign: "center" }}
                color={"white"}
                variant="h6"
              >
                Organizations
              </Typography>
            </Grid>
            <Grid
              container
              size={6}
              justifyContent={"flex-end"}
              sx={{ pt: 0.5, pb: 0.5, px: 2 }}
            >
              {/* Button for creating an organization */}
              <Button
                sx={{
                  backgroundColor: green[500],
                  "&:hover": { backgroundColor: green[700] },
                }}
              >
                <Typography color="black">Create</Typography>
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Grid that contains shiftTrees info */}
        <Grid
          size={8}
          style={{ backgroundColor: "lightgreen", outline: "2px solid black" }}
        >
          {/* Grids that contains shiftTree buttons, first one for formatting */}
          <Grid
            container
            spacing={1}
            style={{ backgroundColor: "green", outline: "2px solid black" }}
            sx={{ pt: 1, pb: 1 }}
          >
            <Grid size={6}>
              <Typography
                variant="h4"
                color={"white"}
                sx={{ marginLeft: 1, textAlign: "center", pt: 0.5, pb: 0.5 }}
              >
                Your ShiftTrees
              </Typography>
            </Grid>
            {/* Grid that contains Buttons */}

            <Grid container size={6} justifyContent="flex-end" sx={{ px: 2 }}>
              <Button
                sx={{
                  backgroundColor: green[500],
                  "&:hover": { backgroundColor: green[700] },
                }}
                onClick={shiftTreeCreate}
              >
                <Typography color="black">Create</Typography>
              </Button>
              <Button
                sx={{
                  backgroundColor: amber[500],
                  "&:hover": { backgroundColor: amber[700] },
                }}
                onClick={shiftTreeJoin}
              >
                <Typography color="black">Join</Typography>
              </Button>
            </Grid>
          </Grid>

          {/* Grid that contains actual shiftTree cards */}
          <Grid></Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
