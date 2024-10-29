import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import { LeftDrawerContext } from "./Home";
import {
  Button,
  Grid2 as Grid,
  Typography,
  Paper,
  Card,
  Divider,
} from "@mui/material";

import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const drawerWidth = 360;

export default function ResponsiveDrawer() {
  const LDC = React.useContext(LeftDrawerContext);
  const handleDrawerClose = () => {
    LDC.setIsClosing(true);
    LDC.setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    LDC.setIsClosing(false);
  };

  const drawer = (
    <div>
      <Grid container spacing={2} sx={{ padding: 2 }}>
        <Grid item xs={12}>
          <Paper
            sx={{
              backgroundColor: theme => theme.palette.background.default,
              minHeight: 600,
              padding: 2,
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar renderLoading={() => <DayCalendarSkeleton />} />
            </LocalizationProvider>

            <Grid container color="primary" sx={{ pt: 1, pb: 1 }}>
              <Grid item xs={12}>
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
                margin: 2,
                flexGrow: 1,
                height: "calc(100% - 100px)",
                overflow: "auto",
              }}
            >
              <Typography sx={{ padding: 2 }}> Sample Organization</Typography>
            </Paper>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} //BREAKPOINT
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={LDC.mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" }, //BREAKPOINT
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              paddingTop: "64px",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" }, //BREAKPOINT
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              paddingTop: "64px",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
