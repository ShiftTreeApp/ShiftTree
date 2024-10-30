import { useState } from "react";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import { Container, Grid2 as Grid, Box, Tab, Tabs, Paper } from "@mui/material";

export default function EditTree() {
  // Get the state of the selected tab
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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
            value={selectedTab}
            onChange={handleTabChange}
          >
            <Tab label="Shifts" />
            <Tab label="Members" />
            <Tab label="Signups" />
            <Tab label="Assign" />
          </Tabs>
          <Grid>
            {/* Shift Settings */}
            {selectedTab === 0 && (
              <Paper
                sx={{
                  backgroundColor: "gray",
                  minHeight: "75vh",
                  minWidth: "75vw",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >Shift Settings</Paper>
            )}
            {/* Members Settings */}
            {selectedTab === 1 && (
              <Paper
                sx={{
                  backgroundColor: "gray",
                  minHeight: "75vh",
                  minWidth: "75vw",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >Member Settings</Paper>
            )}
            {/* Signups Settings */}
            {selectedTab === 2 && (
              <Paper
                sx={{
                  backgroundColor: "gray",
                  minHeight: "75vh",
                  minWidth: "75vw",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >Signup Settings</Paper>
            )}
            {/* Assign Settings */}
            {selectedTab === 3 && (
              <Paper
                sx={{
                  backgroundColor: "gray",
                  minHeight: "75vh",
                  minWidth: "75vw",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >Assign Settings</Paper>
            )}
          </Grid>
        </Box>
      </Container>
    </Grid>
  );
}
