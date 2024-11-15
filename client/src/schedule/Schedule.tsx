import {
  Container,
  Grid2 as Grid,
  Typography,
  Paper,
  Divider,
  IconButton,
  Button,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
  Chip,
  Box,
  Slider,
  Avatar,
} from "@mui/material";
import { useParams } from "react-router";
import {
  Edit as EditIcon,
  HowToReg as RegisterIcon,
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
  const empActions = useEmployeeActions(scheduleId ? scheduleId : "");

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
  }, [empActions.signedUpShifts, empActions.assignedShifts]);

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

  const bothIndicators = useMemo(
    () => ({ ...signedUpIndicators, ...assignedIndicators }),
    [signedUpIndicators, assignedIndicators],
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
      shiftId: selectedShift ? selectedShift : "",
      userId: "none",
    });

    empActions.refetchUserSignups();
  };

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
              {scheduleData?.role == "owner" ||
              scheduleData?.role == "manager" ? (
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
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <EditShiftDrawer
            open={drawerOpen}
            onClose={clearSelectedShift}
            title="Sign-Up"
          >
            <Divider sx={{ marginBottom: 2 }} />
            <Box width={300}>
              <Typography sx={{ marginBottom: 0.5 }}>Request Weight</Typography>
              <Slider
                defaultValue={50}
                aria-label="Request weight"
                valueLabelDisplay="off"
                sx={{ marginBottom: 1 }}
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
                onClick={handleRegister}
              >
                Register
              </Button>

              <Box>
                <Typography>Members signed up:</Typography>
                {/* Chips for users that are signed up */}
                {scheduleData?.role == "owner" && (
                  <UserChips
                    scheduleId={scheduleId}
                    shiftId={selectedShift ?? undefined}
                  ></UserChips>
                )}
              </Box>
            </Box>
          </EditShiftDrawer>
          <ShiftCalendar
            onClickShift={shiftId => setSelectedShift(shiftId)}
            startDate={dayjs(scheduleData?.startTime ?? dayjs().toISOString())}
            endDate={dayjs(scheduleData?.endTime ?? dayjs().toISOString())}
            selectedShifts={selectedShift ? [selectedShift] : []}
            customContentMap={bothIndicators}
            shifts={formattedShifts}
          />
        </Paper>
      </Container>
    </Grid>
  );
}

function SignedUpIndicator() {
  return <Chip icon={<RegisterIcon />} label="Signed up" color="info" />;
}

function AssignedIndicator() {
  return <Chip icon={<RegisterIcon />} label="Assigned" color="primary" />;
}

interface UserChipsProps {
  scheduleId?: string;
  shiftId?: string;
}

function UserChips(props: UserChipsProps) {
  const api = useApi();

  // This request is required to get the users avatars/names for the chips
  const { data: membersData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/members",
    { params: { path: { scheduleId: props.scheduleId as string } } },
  );

  // This request is required to get the users that are signed up in each schedule
  const { data: scheduleSignups } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/signups",
    { params: { path: { scheduleId: props.scheduleId as string } } },
  );

  const userIds =
    scheduleSignups
      ?.filter((shift: any) => shift.id === props.shiftId) // Match the shiftId
      .flatMap((shift: any) =>
        shift.signups.map((signup: any) => signup.user.id),
      ) || [];

  return (
    <Box>
      {userIds.map(userId => {
        // Find the corresponding member data by userId
        const member = membersData?.find((member: any) => member.id === userId);
        return member ? (
          <Chip
            avatar={
              <Avatar src={createRandomPfpUrl(member.displayName, member.id)} />
            }
            label={member.displayName}
            variant="outlined"
          />
        ) : null;
      })}
    </Box>
  );
}
