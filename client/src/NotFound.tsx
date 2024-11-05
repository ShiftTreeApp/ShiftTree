import { Grid2 as Grid, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";

export default function NotFoundPage() {
  return (
    <Grid container direction="column" alignItems="center" sx={{ padding: 2 }}>
      <Navbar />
      <NavbarPadding />
      <Typography variant="h2">404</Typography>
      <Typography variant="h3">Not found</Typography>
      <Link component={RouterLink} to="/">
        Return to dashboard
      </Link>
    </Grid>
  );
}
