import React from "react";
import {
  Paper,
  Grid2 as Grid,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import Schedule from "./Schedule";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";

interface ScheduleViewProps {
  shiftTreeName: string;
  isManager: boolean;
}

export default function ScheduleView({
  shiftTreeName,
  isManager,
}: ScheduleViewProps) {
  return (
    <Grid container direction="column" alignItems="center" sx={{ padding: 2 }}>
      <Navbar />
      <NavbarPadding />
      <Paper elevation={3} sx={{ padding: 2, width: "100%", maxWidth: 800 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid>
            <Typography variant="h5">{shiftTreeName}</Typography>
          </Grid>
          {isManager && (
            <Grid>
              <Button variant="contained" color="primary">
                <Typography>Edit Shift Tree (Manager only)</Typography>
              </Button>
            </Grid>
          )}
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Grid container justifyContent="center">
          <Grid size={12}>
            <Schedule />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
