import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import { useSearchParam } from "@/useSearchParam";
import EditShiftsTab from "./EditShiftsTab";
import ShiftTreeSettings from "./ShiftTreeSettings";

import {
  Container,
  Grid2 as Grid,
  Tab,
  Tabs,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import EditMembersTab from "./EditMembersTab";
//import EditSignupsTab from "./EditSignupsTab"; // Will be added back later
import { useApi } from "../client";
import { useEffect } from "react";

const tabNames = {
  shifts: "shifts",
  members: "members",
  signups: "signups",
  settings: "settings",
} as const;

type TabName = (typeof tabNames)[keyof typeof tabNames];

export default function EditTree() {
  const { scheduleId } = useParams();
  const api = useApi();

  // Get the state of the selected tab
  const [selectedTab, setSelectedTab] = useSearchParam<TabName>("tab", {
    default: tabNames.shifts,
  });

  const handleTabChange = (_event: any, newValue: TabName) => {
    setSelectedTab(newValue);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: scheduleId as string } } },
  );

  useEffect(() => {
    if (scheduleData?.role === "member") {
      navigate(`/schedule/${scheduleId}`);
    }
  }, [scheduleData, scheduleId, navigate]);

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
            <Tab label="Shifts" value={tabNames.shifts} />
            <Tab label="Members" value={tabNames.members} />
            {/* <Tab label="Signups" value={tabNames.signups} /> */}
            <Tab label="Settings" value={tabNames.settings} />
          </Tabs>
          <Grid
            sx={{
              padding: 1,
              paddingLeft: 1.5,
              paddingRight: 1.5,
              flexGrow: 1,
            }}
          >
            {/* Shift Settings */}
            {selectedTab === "shifts" && (
              <>
                <EditShiftsTab scheduleId={scheduleId as string} />
              </>
            )}
            {/* Members Settings */}
            {selectedTab === "members" && (
              <>
                <EditMembersTab scheduleId={scheduleId as string} />
              </>
            )}
            {/* TODO: Add Signups Settings */}
            {/*
            {selectedTab === "signups" && (
              <EditSignupsTab scheduleId={scheduleId as string} />
            )}
            {/* ShiftTree Settings */}
            {selectedTab === "settings" && (
              <ShiftTreeSettings scheduleId={scheduleId as string} />
            )}
          </Grid>
        </Paper>
      </Container>
    </Grid>
  );
}
