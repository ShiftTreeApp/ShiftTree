import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import {
  Container,
  Grid2 as Grid,
  Typography,
  Box,
  Tab,
  Tabs,
} from "@mui/material";

export default function EditTree() {
  return (
    <Grid container direction="column" spacing={1}>
      <Navbar />
      <NavbarPadding />
      <Container component="main">
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: theme => theme.palette.background.paper,
            display: "flex",
            height: 500,
          }}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: "divider" }}
          >
            <Tab label="Shifts" />
            <Tab label="Members" />
            <Tab label="Signups" />
            <Tab label="Assign" />
          </Tabs>
        </Box>
      </Container>
    </Grid>
  );
}
