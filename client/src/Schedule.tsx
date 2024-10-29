import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import { Container, Grid2 as Grid, Typography } from "@mui/material";

export default function Schedule() {
  return (
    <Grid container direction="column" spacing={1}>
      <Navbar />
      <NavbarPadding />
      <Container component="main" sx={{}}>
        <Typography>Content</Typography>
      </Container>
    </Grid>
  );
}
