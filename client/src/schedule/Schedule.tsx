import {
  Container,
  Grid2 as Grid,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  Box,
  Slider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router";
import {
  HowToReg as RegisterIcon,
  EventBusy as LeaveShiftTreeIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";

import { useApi } from "../client";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import EditShiftDrawer from "./EditShiftDrawer";
import { ShiftCalendar, ShiftDetails } from "./ShiftCalendar";
import { useEmployeeActions } from "@/hooks/useEmployeeActions";
import theme from "@/theme";
import { useNotifier } from "@/notifier";
import { CustomTooltip } from "@/customComponents/CustomTooltip";

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
  const navigate = useNavigate();

  const { scheduleId } = useParams();
  const empActions = useEmployeeActions(scheduleId ? scheduleId : "");
  const notifier = useNotifier();

  // TODO: Change this to useSearchParam
  const { selectedShift, setSelectedShift, clearSelectedShift } =
    useSelectedShiftParam();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [weight, setWeight] = useState(5);
  const drawerOpen = selectedShift !== null;

  const api = useApi();

  const toggleSelectionMode = () => {
    setIsSelecting(prev => !prev);
    setSelectedShifts([]); // Clear selections when toggling
  };

  const [signedUpShifts, setSignedUpShifts] = useState(
    empActions.signedUpShifts,
  );

  const [assignedShifts, setAssignedShifts] = useState(
    empActions.assignedShifts,
  );

  useEffect(() => {
    const getUpdatedShiftStatuses = async () => {
      empActions.refetchUserSignups();
      empActions.refetchUserAssignments();
      setSignedUpShifts(empActions.signedUpShifts);
      setAssignedShifts(empActions.assignedShifts);
    };

    getUpdatedShiftStatuses();
  }, [empActions.signedUpShifts, empActions.assignedShifts, empActions]);

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: scheduleId as string } } },
  );

  const { data: shifts } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/shifts",
    { params: { path: { scheduleId: scheduleId as string } } },
  );

  const formattedShifts: ShiftDetails[] = (shifts || []).map(shift => ({
    id: shift.id,
    name: shift.name,
    startTime: dayjs(shift.startTime),
    endTime: dayjs(shift.endTime),
  }));

  const handleRegister = async () => {
    console.log(selectedShift);
    await empActions.signup({
      shiftId: selectedShift ? selectedShift : "",
      weight: weight,
    });

    empActions.refetchUserSignups();
    notifier.message("Registered for shift");
    clearSelectedShift();
  };

  async function handleUnregister() {
    await empActions.unregister({ shiftId: selectedShift as string });
    notifier.message("Unregistered from shift");
    clearSelectedShift();
  }

  const isSignedUpForSelectedShift = useMemo(
    () => selectedShift && signedUpShifts.includes(selectedShift),
    [selectedShift, signedUpShifts],
  );

  function MemberPerShiftStackContent(props: { shiftIds: string[] }) {
    const isRegistered = useMemo(
      () => props.shiftIds.some(id => signedUpShifts.includes(id)),
      [props.shiftIds],
    );

    const isAssigned = useMemo(
      () => props.shiftIds.some(id => assignedShifts.includes(id)),
      [props.shiftIds],
    );

    if (isAssigned) {
      return <AssignedIndicator />;
    } else if (isRegistered) {
      return <SignedUpIndicator />;
    } else {
      return <></>;
    }
  }

  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const handleOpenSTInfo = () => setInfoModalOpen(true);
  const handleCloseSTInfo = () => setInfoModalOpen(false);

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
            <Grid
              container
              alignItems="center"
              display="flex"
              sx={{ paddingLeft: 2, paddingBottom: 0, paddingTop: 1 }}
            >
              <Typography variant="h5">{scheduleData?.name}</Typography>

              <CustomTooltip
                title="Information About This ShiftTree"
                placement="right"
              >
                <IconButton onClick={handleOpenSTInfo}>
                  <InfoIcon />
                </IconButton>
              </CustomTooltip>

              <Dialog open={infoModalOpen} onClose={handleCloseSTInfo}>
                <DialogTitle>{scheduleData?.name} Information</DialogTitle>
                <DialogContent>
                  <Typography>
                    Manager: {scheduleData?.owner?.displayName}
                    <br />
                    Manager Email: {scheduleData?.owner?.email}
                    <br />
                    Number of Shifts: {shifts?.length}
                    <br />
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseSTInfo} color="primary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
            <Grid
              sx={{ display: "flex", flexDirection: "row-reverse", gap: 1 }}
            >
              <Button
                variant="contained"
                startIcon={<LeaveShiftTreeIcon />}
                sx={{
                  backgroundColor: theme => theme.palette.error.dark,
                }}
                onClick={async () => {
                  await empActions.leaveSchedule({
                    scheduleId: scheduleId ?? "",
                  });
                  navigate("/");
                }}
              >
                <Typography>Leave Shift Tree</Typography>
              </Button>
              <CustomTooltip title="Select multiple shifts" placement="top">
                <Button
                  variant="contained"
                  sx={{ backgroundColor: theme => theme.palette.info.main }}
                  onClick={() => {
                    if (isSelecting) {
                      setSelectedShifts([]);
                    }
                    setIsSelecting(prev => !prev);
                  }}
                >
                  {isSelecting ? "Cancel" : "Select"}
                </Button>
              </CustomTooltip>
              {isSelecting && (
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={async () => {
                      for (const shiftId of selectedShifts) {
                        await empActions.signup({ shiftId });
                      }
                      notifier.message("Registered for selected shifts");
                      empActions.refetchUserSignups();
                    }}
                  >
                    Register All
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: theme => theme.palette.error.dark,
                    }}
                    onClick={async () => {
                      for (const shiftId of selectedShifts) {
                        await empActions.unregister({ shiftId });
                      }
                      notifier.message("Unregistered from selected shifts");
                      empActions.refetchUserSignups();
                    }}
                  >
                    Unregister All
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <EditShiftDrawer
            open={drawerOpen}
            onClose={clearSelectedShift}
            title={"Sign-Up"}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <CustomTooltip
                title="(Note:
                      All your weights will be averaged. i.e. A weight of 100
                      for all registered shifts is equivalent to putting down 50
                      for all of them)"
                placement="top"
              >
                <Typography gutterBottom>
                  Request Weight: How badly do you want this shift?{" "}
                </Typography>
              </CustomTooltip>
              <Slider
                defaultValue={5}
                aria-label="Request weight"
                valueLabelDisplay="auto"
                sx={{ width: { md: 300 } }}
                shiftStep={3}
                step={1}
                marks
                max={10}
                min={1}
                value={weight}
                onChange={(_, newValue) => setWeight(newValue as number)}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<RegisterIcon />}
                sx={{
                  backgroundColor: theme => theme.palette.success.main,
                  "&:hover": {
                    backgroundColor: theme => theme.palette.success.dark,
                  },
                  color: "white",
                }}
                onClick={
                  isSignedUpForSelectedShift ? handleUnregister : handleRegister
                }
              >
                {isSignedUpForSelectedShift ? "Unregister" : "Register"}
              </Button>
            </Box>
          </EditShiftDrawer>
          <ShiftCalendar
            onClickShift={shiftId => {
              if (isSelecting) {
                setSelectedShifts(prev =>
                  prev.includes(shiftId)
                    ? prev.filter(id => id !== shiftId)
                    : [...prev, shiftId],
                );
              } else {
                setSelectedShift(shiftId); // Single selection behavior
              }
            }}
            startDate={dayjs(scheduleData?.startTime ?? dayjs().toISOString())}
            endDate={dayjs(scheduleData?.endTime ?? dayjs().toISOString())}
            selectedShifts={
              isSelecting
                ? selectedShifts
                : selectedShift
                  ? [selectedShift]
                  : []
            }
            shifts={formattedShifts}
            CustomContent={MemberPerShiftStackContent}
          />
        </Paper>
      </Container>
    </Grid>
  );
}

function SignedUpIndicator() {
  return (
    <Chip
      icon={<RegisterIcon sx={{ "&&": { color: "white" } }} />}
      label="Signed up"
      sx={{
        backgroundColor: theme.palette.info.main,
        color: "white",
      }}
    />
  );
}

function AssignedIndicator() {
  return (
    <Chip
      icon={<RegisterIcon />}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: "white",
      }}
      label="Assigned"
      color="primary"
    />
  );
}
