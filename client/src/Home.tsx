import {
  Button,
  Grid2 as Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/en";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useAuth } from "@/auth";

export default function Home() {
  // https://mui.com/x/react-date-pickers/date-calendar/#dynamic-data

  return (
    <Grid container direction="column" spacing={2}>
      {/* Dashboard */}
      <Navbar />

      <Grid container spacing={2}>
        <Grid>
          <Typography>one</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar renderLoading={() => <DayCalendarSkeleton />} />
          </LocalizationProvider>
        </Grid>
        <Grid style={{ backgroundColor: "blue" }}>
          <Typography>two</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

export function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    auth.logout();
    // after logout, navigate("/") takes you to sign in
    navigate("/");
  }

  return (
    <Grid container>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Link href="/">
              <Typography fontSize={24} color={"white"}>
                ShiftTree
              </Typography>
            </Link>
            <Button color="inherit" onClick={onLogout}>
              Log out
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
    </Grid>
  );
}
