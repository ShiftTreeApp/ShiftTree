import {
  //Button,
  Grid2 as Grid,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
//import { Link } from "react-router-dom";

import Navbar from "@/Navbar";
import ShiftTreeCard from "./ShiftTreeCard";
import Calendar_and_Org from "./Calendar_and_Org_display";

export default function Home() {
  // https://mui.com/x/react-date-pickers/date-calendar/#dynamic-data

  return (
    <Grid container direction="column" spacing={2}>
      {/* Contians everything */}
      <Navbar />

      {/* Grid for everything below navbar */}
      <Grid container spacing={2} sx={{ paddingLeft: 2, paddingRight: 2 }}>
        {/* Grid contains Calendar and org */}
        <Calendar_and_Org />

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
