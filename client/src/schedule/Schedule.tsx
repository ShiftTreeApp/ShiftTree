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
  Avatar,
} from "@mui/material";
import { useParams } from "react-router";
import {
  Edit as EditIcon,
  HowToReg as RegisterIcon,
  EventBusy as LeaveShiftTreeIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";

import { useApi } from "../client";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import EditShiftDrawer from "./EditShiftDrawer";
import { ShiftCalendar, ShiftDetails } from "./ShiftCalendar";
import { createRandomPfpUrl } from "./EditMembersTab";
import { useEmployeeActions } from "@/hooks/useEmployeeActions";
import theme from "@/theme";
import { useNotifier } from "@/notifier";
import { useShifts } from "@/hooks/useShifts";

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
  const empActions = useEmployeeActions(scheduleId ? scheduleId : "");
  const notifier = useNotifier();

  // TODO: Change this to useSearchParam
  const { selectedShift, setSelectedShift, clearSelectedShift } =
    useSelectedShiftParam();

  const drawerOpen = selectedShift !== null;

  const api = useApi();

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

  const signedUpIndicators = useMemo(
    () =>
      Object.fromEntries(
        signedUpShifts.map((shiftId: string) => [shiftId, SignedUpIndicator]),
      ),
    [signedUpShifts],
  );

  const assignedIndicators = useMemo(
    () =>
      Object.fromEntries(
        assignedShifts.map((shiftId: string) => [shiftId, AssignedIndicator]),
      ),
    [assignedShifts],
  );

  const userIndicators = useMemo(
    () =>
      Object.fromEntries(
        empActions.allAssignments?.map(({ shiftId, user }) => [
          shiftId,
          () => (
            <UserIndicators
              name={user?.displayName ?? ""}
              id={user?.id ?? ""}
            />
          ),
        ]) ?? [],
      ),
    [empActions.allAssignments],
  );

  const bothIndicators = useMemo(
    () => ({ ...signedUpIndicators, ...assignedIndicators, ...userIndicators }),
    [signedUpIndicators, assignedIndicators, userIndicators],
  );

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
      shiftId: selectedShift ?? "",
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

  const isManager =
    scheduleData?.role == "manager" || scheduleData?.role == "owner";

  const isSignedUpForSelectedShift = useMemo(
    () => selectedShift && signedUpShifts.includes(selectedShift),
    [selectedShift, signedUpShifts],
  );

  function ManagerPerShiftStackContent(props: { shiftIds: string[] }) {
    const shiftIds = useMemo(() => new Set(props.shiftIds), [props.shiftIds]);
    const assignedUsers = useMemo(
      () =>
        empActions.allAssignments
          ?.filter(asgn => asgn.shiftId && shiftIds.has(asgn.shiftId))
          .map(asgn => asgn.user)
          .filter(u => u !== undefined) ?? [],
      [shiftIds],
    );

    return (
      <>
        {assignedUsers.map(user => (
          <Chip
            key={user.id}
            avatar={
              <Avatar src={createRandomPfpUrl(user.displayName, user.id)} />
            }
            label={user.displayName}
            color="primary"
          />
        ))}
      </>
    );
  }

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
            <Grid
              sx={{ display: "flex", flexDirection: "row-reverse", gap: 1 }}
            >
              {isManager ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  component={RouterLink}
                  to={`/schedule/${scheduleId}/edit`}
                  sx={{
                    backgroundColor: theme => theme.palette.info.main,
                  }}
                >
                  Edit mode
                </Button>
              ) : null}
              {!isManager ? (
                <Button
                  variant="contained"
                  startIcon={<LeaveShiftTreeIcon />}
                  sx={{
                    backgroundColor: theme => theme.palette.error.dark,
                  }}
                >
                  <Typography>Leave Shift Tree</Typography>
                </Button>
              ) : null}
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <EditShiftDrawer
            open={drawerOpen}
            onClose={clearSelectedShift}
            title={isManager ? "Shift Info" : "Sign-Up"}
          >
            {!isManager && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Typography gutterBottom>Request Weight</Typography>
                  <Slider
                    defaultValue={50}
                    aria-label="Request weight"
                    valueLabelDisplay="auto"
                    sx={{ width: { md: 300 } }}
                    shiftStep={30}
                    step={10}
                    marks
                    max={100}
                    min={10}
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
                      isSignedUpForSelectedShift
                        ? handleUnregister
                        : handleRegister
                    }
                  >
                    {isSignedUpForSelectedShift ? "Unregister" : "Register"}
                  </Button>
                </Box>
              </>
            )}
            {isManager && (
              <>
                <Typography variant="h6">Registered Members</Typography>
                {/* Chips for users that are signed up */}

                <UserChips
                  scheduleId={scheduleId}
                  shiftId={selectedShift ?? undefined}
                ></UserChips>
              </>
            )}
          </EditShiftDrawer>
          <ShiftCalendar
            onClickShift={shiftId => setSelectedShift(shiftId)}
            startDate={dayjs(scheduleData?.startTime ?? dayjs().toISOString())}
            endDate={dayjs(scheduleData?.endTime ?? dayjs().toISOString())}
            selectedShifts={selectedShift ? [selectedShift] : []}
            customContentMap={bothIndicators}
            shifts={formattedShifts}
            CustomContent={
              isManager
                ? ManagerPerShiftStackContent
                : MemberPerShiftStackContent
            }
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

interface UserIndicatorsProps {
  name: string;
  id: string;
}

function UserIndicators(props: UserIndicatorsProps) {
  return (
    <Chip
      avatar={<Avatar src={createRandomPfpUrl(props.name, props.id)}></Avatar>}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: "white",
      }}
      label={props.name}
      color="primary"
    />
  );
}

interface UserChipsProps {
  scheduleId?: string;
  shiftId?: string;
}

function UserChips(props: UserChipsProps) {
  const api = useApi();

  // This request is required to get the users that are signed up in each schedule
  const { data: scheduleSignups } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/signups",
    { params: { path: { scheduleId: props.scheduleId as string } } },
  );

  const shifts = useShifts(props.scheduleId ?? "");

  const stackShiftIds = useMemo(
    () => new Set(shifts.matchingShifts(props.shiftId ?? "").map(s => s.id)),
    [props.shiftId, shifts],
  );

  const users = scheduleSignups
    ?.filter(shift => stackShiftIds.has(shift.id)) // Match the shiftId
    .flatMap(shift => shift.signups?.map(signup => signup.user))
    .filter(u => u !== undefined);

  return (
    <Box>
      {users?.map(user => {
        return (
          <Chip
            key={user.id}
            avatar={
              <Avatar src={createRandomPfpUrl(user.displayName, user.id)} />
            }
            label={user.displayName}
            variant="outlined"
          />
        );
      })}
    </Box>
  );
}
