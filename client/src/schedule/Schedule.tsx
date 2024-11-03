import {
  Container,
  Grid2 as Grid,
  Typography,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import { ShiftCalendar } from "./ShiftCalendar";
import EditShiftDrawer from "./EditShiftDrawer";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";

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
    <Grid container direction="column" alignItems="center" sx={{ padding: 2 }}>
      <Navbar />
      <NavbarPadding />
      <Paper elevation={3} sx={{ padding: 2, width: "100%", maxWidth: 800 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid>
            <Typography variant="h5">shiftTreeName</Typography>
          </Grid>
          <Grid>
            <Button variant="contained" color="primary">
              <Typography>Edit Shift Tree (Manager only)</Typography>
            </Button>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Grid container direction="column" spacing={1}>
          <EditShiftDrawer
            open={drawerOpen}
            onClose={clearSelectedShift}
            title="View shift"
          >
            <Typography variant="body1">Shift details</Typography>
            <Typography variant="body1">Shift id: {selectedShift}</Typography>
          </EditShiftDrawer>
          <Container
            component="main"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
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
      </Paper>
    </Grid>
  );
}
