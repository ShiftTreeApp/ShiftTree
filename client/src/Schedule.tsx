// REPLACE WITH THE REAL SCHEDULE
import { Grid2 as Grid, Typography } from "@mui/material";

import Navbar from "@/Navbar";

export default function Schedule() {
  return (
    <Grid container direction="column" spacing={2}>
      <Navbar />
      <Typography variant="h3" align="center">
        ShiftTree Design Here!
      </Typography>
    </Grid>
  );
}
