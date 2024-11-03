import { useState } from "react";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import {
  Container,
  Grid2 as Grid,
  Tab,
  Tabs,
  Paper,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";

export default function EditTree() {
  // Get the state of the selected tab
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event: any, newValue: number) => {
    setSelectedTab(newValue);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Grid container direction="column" spacing={1}>
      <Navbar />
      <NavbarPadding />
      <Container component="main">
        <Paper
          sx={theme => ({
            flexGrow: 1,
            backgroundColor: theme => theme.palette.background.paper,
            display: "flex",
            [theme.breakpoints.down("md")]: {
              flexDirection: "column",
            },
          })}
        >
          <Tabs
            orientation={isMobile ? "horizontal" : "vertical"}
            variant={isMobile ? "fullWidth" : "scrollable"}
            aria-label="Vertical tabs example"
            sx={theme => ({
              [theme.breakpoints.up("md")]: {
                borderRight: 1,
                borderColor: theme.palette.divider,
              },
              [theme.breakpoints.down("md")]: {
                borderBottom: "solid 1px",
                borderColor: theme.palette.divider,
              },
            })}
            value={selectedTab}
            onChange={handleTabChange}
          >
            <Tab label="Shifts" />
            <Tab label="Members" />
            <Tab label="Signups" />
            <Tab label="Assign" />
          </Tabs>
          <Grid
            sx={{
              padding: 1,
              paddingLeft: 1.5,
              paddingRight: 1.5,
            }}
          >
            {/* Shift Settings */}
            {selectedTab === 0 && (
              <>
                <Typography>Hello, world</Typography>
              </>
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
              >
                Member Settings
              </Paper>
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
              >
                Signup Settings
              </Paper>
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
              >
                Assign Settings
              </Paper>
            )}
          </Grid>
        </Paper>
      </Container>
    </Grid>
  );
}
