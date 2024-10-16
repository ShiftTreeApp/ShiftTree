import {
  Button,
  Grid2 as Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link,
} from "@mui/material";
import { green, amber } from '@mui/material/colors';
import { useNavigate } from "react-router";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/en";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useAuth } from "@/auth";


export default function Home() {
  // https://mui.com/x/react-date-pickers/date-calendar/#dynamic-data

  const navigate = useNavigate();

  const shiftTreeCreate = () => {
    // Navigate to the '/about' route
    navigate('/MyTrees');
  }

  return (
    
    <Grid container direction="column" spacing={2}>
      {/* Contians everything */}
      <Navbar />

      {/* Grid for the Calendar and Organizations */}
      <Grid container spacing={2}>

        {/* Grid contains Calendar */}
        <Grid size={4} style={{ outline: '2px solid black', backgroundColor: "silver" }}>

          {/* Weird Calendar Shit */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar renderLoading={() => <DayCalendarSkeleton />} />
          </LocalizationProvider>
          
          {/* Grid that contains Organizations */}
          <Grid style={{outline: '2px solid black', backgroundColor: 'gray' }}>
            <Typography sx={{ textAlign: 'center'}}>Organizations</Typography>
            
            {/* Button for creating an organization */}
            <Button color="inherit">
              Create
            </Button>
          </Grid>
        </Grid>

        {/* Grid that contains shiftTrees */}
        <Grid size={8} style={{ backgroundColor: "lightgreen", outline: "2px solid black" }}>
          <Typography sx={{ textAlign: 'center'}}>Your ShiftTrees</Typography>
          {/* Grid that contains actual shiftTree cards */}
          <Grid>
          </Grid>
          {/* Grids that contains shiftTree buttons, first one for formatting */}
          <Grid container spacing={2} style={{ backgroundColor: "green", outline: "2px solid black" }}>
            
            {/* Grid that contains Buttons */}
            <Grid spacing={2}>
              <Button sx={{ backgroundColor: green[500], '&:hover': { backgroundColor: green[700] } }} onClick={shiftTreeCreate}>
                <Typography sx={{ color: "black" }}>Create</Typography>
              </Button>
              <Button sx={{ backgroundColor: amber[500], '&:hover': { backgroundColor: amber[700] } }}>
                <Typography sx={{ color: "black" }}>Join</Typography>
              </Button>
            </Grid>


          </Grid>
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
          <Toolbar sx={{ justifyContent: "space-between", backgroundColor: "green" }}>
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
