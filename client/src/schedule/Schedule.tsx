import {
  Container,
  Grid2 as Grid,
  Typography,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
  Chip,
} from "@mui/material";
import { useParams } from "react-router";
import {
  Edit as EditIcon,
  HowToReg as RegisterIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useApi } from "../client";

import { ShiftCalendar } from "./ShiftCalendar";
import EditShiftDrawer from "./EditShiftDrawer";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import { useMemo } from "react";

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

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
  const { scheduleId } = useParams();

  // TODO: Change this to useSearchParam
  const { selectedShift, setSelectedShift, clearSelectedShift } =
    useSelectedShiftParam();

  const drawerOpen = selectedShift !== null;

  const api = useApi();

  // TODO: Get this from API
  const signedUpShifts = useMemo(() => ["1", "3"], []);

  const signedUpIndicators = useMemo(
    () =>
      Object.fromEntries(
        signedUpShifts.map(shiftId => [shiftId, SignedUpIndicator]),
      ),
    [signedUpShifts],
  );

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: scheduleId as string } } },
  );

  return (
    <Grid container direction="column" spacing={1}>
      <Navbar />
      <NavbarPadding />
      <Container
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Paper elevation={3} sx={{ padding: 2 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid sx={{ paddingLeft: 2 }}>
              <Typography variant="h5">{scheduleData?.name}</Typography>
            </Grid>
            <Grid>
              <CustomTooltip title="Edit ShiftTree" placement="bottom">
                <IconButton
                  component={RouterLink}
                  to={`/schedule/${scheduleId}/edit`}
                >
                  <EditIcon />
                </IconButton>
              </CustomTooltip>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <EditShiftDrawer
            open={drawerOpen}
            onClose={clearSelectedShift}
            title="View shift"
          >
            <Typography variant="body1">Shift details</Typography>
            <Typography variant="body1">Shift id: {selectedShift}</Typography>
          </EditShiftDrawer>
          <ShiftCalendar
            onClickShift={shiftId => setSelectedShift(shiftId)}
            startDate={dayjs("2024-10-27, 8:00")}
            endDate={dayjs("2024-11-20, 3:00")}
            selectedShifts={selectedShift ? [selectedShift] : []}
            customContentMap={signedUpIndicators}
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
        </Paper>
      </Container>
    </Grid>
  );
}

function SignedUpIndicator() {
  return <Chip icon={<RegisterIcon />} label="Signed up" color="info" />;
}
