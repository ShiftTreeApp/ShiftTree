import { Grid2 as Grid, Typography, Paper, Divider, Box } from "@mui/material";
import { useState } from "react";
import ResponsiveDrawer from "./LeftDrawer";
import "dayjs/locale/en";
import * as React from "react";
import dayjs from "dayjs";
import { useDatabaseQueries } from "@/hooks/useDatabaseQueries";

const drawerWidth = 360;

import Navbar from "@/Navbar";
import ShiftTreeCard from "./ShiftTreeCard";

interface LeftDrawerContextType {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isClosing: boolean;
  setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LeftDrawerContext = React.createContext<LeftDrawerContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
  isClosing: false,
  setIsClosing: () => {},
});

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const queries = useDatabaseQueries();

  const handleDateChange = (date: string | null) => {
    console.log("Selected: " + date);
  };

  // Making the times into readable format
  const formatTimes = (startTime: string | null, endTime: string | null) => {
    if (startTime && endTime) {
      const formattedStart = dayjs(startTime).format("MMMM D, h:mm A");
      const formattedEnd = dayjs(endTime).format("MMMM D, h:mm A");
      return `${formattedStart} - ${formattedEnd}`;
    }

    return "No Shifts";
  };

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
        value={{
          mobileOpen,
          setMobileOpen,
          isClosing,
          setIsClosing,
        }}
      >
        <Navbar />
        <ResponsiveDrawer onDateChange={handleDateChange} />
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
            {/* Create a card from each schedule from query */}
            {queries.schedules?.map(schedule => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={schedule.id}>
                <ShiftTreeCard
                  name={schedule.name}
                  status={schedule.state}
                  dates={formatTimes(schedule.startTime, schedule.endTime)}
                  description={schedule.description}
                  id={schedule.id}
                  role={schedule.role}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}></Grid>
          </Grid>
        </Paper>
      </Box>
    </Grid>
  );
}
