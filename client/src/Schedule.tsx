import {
  Box,
  Container,
  Drawer,
  Grid2 as Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import NavbarPadding from "@/NavbarPadding";
import { ShiftCalendar } from "@/ShiftCalendar";

function useSelectedShiftParam() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedShift = searchParams.get("shift");
  function setSelectedShift(shiftId: string) {
    setSearchParams(prev => {
      prev.set("shift", shiftId);
      return prev;
    });
  }
  function clearSelectedShift() {
    setSearchParams(prev => {
      prev.delete("shift");
      return prev;
    });
  }

  return { selectedShift, setSelectedShift, clearSelectedShift };
}

export default function Schedule() {
  const { selectedShift, setSelectedShift, clearSelectedShift } =
    useSelectedShiftParam();

  const drawerOpen = selectedShift !== null;

  return (
    <Grid container direction="column" spacing={1}>
      <Drawer
        open={drawerOpen}
        onClose={clearSelectedShift}
        anchor="right"
        sx={theme => ({
          ".MuiDrawer-paper": {
            [theme.breakpoints.down("md")]: {
              width: "100%",
            },
          },
        })}
      >
        <NavbarPadding />
        <Box
          sx={theme => ({
            [theme.breakpoints.up("md")]: {
              width: theme => theme.spacing(96),
            },
            display: "flex",
            flexDirection: "column",
            gap: 1,
            padding: 2,
          })}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">View shift</Typography>
            <IconButton onClick={clearSelectedShift}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1">Shift details</Typography>
          <Typography variant="body1">Shift id: {selectedShift}</Typography>
        </Box>
      </Drawer>
      <Container
        component="main"
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <ShiftCalendar
          onClickShift={shiftId => setSelectedShift(shiftId)}
          startDate={dayjs("2024-10-27, 8:00")}
          endDate={dayjs("2024-11-20, 3:00")}
          selectedShifts={selectedShift ? [selectedShift] : []}
          shifts={[
            {
              id: "1",
              name: "Shift 1",
              startTime: dayjs("2024-10-27, 8:00"),
              endTime: dayjs("2024-10-27, 12:00"),
            },
            {
              id: "2",
              name: "Shift 2",
              startTime: dayjs("2024-10-27, 13:00"),
              endTime: dayjs("2024-10-27, 17:00"),
            },
            {
              id: "3",
              name: "Shift 3",
              startTime: dayjs("2024-10-28, 18:00"),
              endTime: dayjs("2024-10-28, 22:00"),
            },
            {
              id: "4",
              name: "Shift 4",
              startTime: dayjs("2024-10-28, 23:00"),
              endTime: dayjs("2024-10-29, 3:00"),
            },
            {
              id: "4",
              name: "Shift 4",
              startTime: dayjs("2024-10-31, 23:00"),
              endTime: dayjs("2024-10-31, 3:00"),
            },
          ]}
        />
      </Container>
    </Grid>
  );
}
