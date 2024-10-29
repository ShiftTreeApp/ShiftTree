import {
  Button,
  Grid2 as Grid,
  Typography,
  Paper,
  Card,
  Divider,
  Box,
} from "@mui/material";
import ResponsiveDrawer from "./LeftDrawer";
import "dayjs/locale/en";
import * as React from "react";

const drawerWidth = 360;

import Navbar from "@/Navbar";
import ShiftTreeCard from "./ShiftTreeCard";
export const LeftDrawerContext = React.createContext();
export default function Home() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  return (
    <Grid
      container
      direction="column"
      spacing={0.5}
      sx={{
        paddingTop: { xs: "52px", sm: "60px", md: "64px" }, // Add top margin to account for AppBar height
        paddingLeft: { xs: 0.5, md: `${drawerWidth + 8}px` }, // Add left margin to account for drawer width (measured spacing 1 with inspect)
        paddingRight: { xs: 0.5, md: 1 }, // Remove right margin on mobile
      }}
    >
      <LeftDrawerContext.Provider
        value={{ mobileOpen, setMobileOpen, isClosing, setIsClosing }}
      >
        <Navbar />
        <ResponsiveDrawer />
      </LeftDrawerContext.Provider>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        <Paper
          sx={{
            backgroundColor: theme => theme.palette.background.paper,
            minHeight: 600,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <Grid
            container
            spacing={1}
            // sx={{ pt: 1, pb: 2, justifyContent: "space-between" }}
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
          </Grid>
          <Divider variant="middle" />
          <Grid container spacing={2} sx={{ padding: 2 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}></Grid>
          </Grid>
        </Paper>
      </Box>
    </Grid>
  );
}
