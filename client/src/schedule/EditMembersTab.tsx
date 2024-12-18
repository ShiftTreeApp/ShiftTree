import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  TextField,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Fragment, useState, useEffect } from "react";
import dayjs from "dayjs";

import { useApi } from "@/client";
import { useManagerActions } from "@/hooks/useManagerActions";
import { useNotifier } from "@/notifier";
import EditMembersDrawer from "./EditMembersDrawer";
import CompactNumberInput from "@/customComponents/CompactNumberInput";

interface EditMembersTabProps {
  scheduleId: string;
}

export default function EditMembersTab(props: EditMembersTabProps) {
  const api = useApi();
  const managerActions = useManagerActions(props.scheduleId);
  const notifier = useNotifier();

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  const { data: membersData, refetch: refetchMembers } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/members",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  // TODO: Add the base url as an environment variable so it can be set during build
  const [inviteCode, setInviteCode] = useState<string>("");

  useEffect(() => {
    if (managerActions.existingCode) {
      setInviteCode(managerActions.existingCode);
    }
  }, [managerActions.existingCode]);

  function copyInviteCode() {
    navigator.clipboard.writeText(inviteCode);
    notifier.message("Invite code copied to clipboard");
  }

  const [userToKick, setUserToKick] = useState<
    { id: string; displayName: string } | undefined
  >();

  const { mutateAsync: sendKickUser } = api.useMutation(
    "delete",
    "/removeUser/{scheduleID}",
    {
      onSuccess: async () => {
        await refetchMembers();
        setUserToKick(undefined);
      },
    },
  );

  const handleRegenerateClick = async () => {
    const newCode = await managerActions.generate({
      shiftTreeId: props.scheduleId,
    });
    setInviteCode(newCode || "Code Generation Failed, please try again");
  };

  async function kickUser(id: string) {
    await sendKickUser({
      params: {
        path: { scheduleID: props.scheduleId },
        query: { userID: id },
      },
    });
  }

  const [suggestedShifts, setSuggestedShifts] = useState<{
    [key: string]: number;
  }>({});

  const [lastSubmittedSuggestions, setLastSubmittedSuggestions] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (membersData) {
      const suggestedShiftsFromDB: { [key: string]: number } = {};
      for (const member of membersData) {
        suggestedShiftsFromDB[member.id] = member.suggestedShifts ?? -100;
      }
      setSuggestedShifts(suggestedShiftsFromDB);
      setLastSubmittedSuggestions(suggestedShiftsFromDB);
    }
  }, [membersData]);

  const handleSuggestedChange = (userId: string, value: number | null) => {
    const checkValue = value ?? 0;
    setSuggestedShifts(prevState => ({
      ...prevState,
      [userId]: checkValue,
    }));
  };

  const handleSuggestionsSubmit = async () => {
    for (const [userId, numShifts] of Object.entries(suggestedShifts)) {
      await managerActions.updateRecommendedNumShifts({
        scheduleId: props.scheduleId,
        targetUserId: userId,
        numShifts: numShifts,
      });
    }
    notifier.message("Updated Recommended Shifts for Employees");
    setLastSubmittedSuggestions(suggestedShifts);
  };

  const unsubmittedRecommendationChanges = () => {
    return (
      JSON.stringify(suggestedShifts) !==
      JSON.stringify(lastSubmittedSuggestions)
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        flexGrow: 1,
        gap: 1.5,
      }}
    >
      <Breadcrumbs>
        <Link component={RouterLink} to={`/schedule/${props.scheduleId}`}>
          {scheduleData?.name ?? scheduleData?.id ?? "Schedule"}
        </Link>
        <Typography>Manage invites and members</Typography>
      </Breadcrumbs>
      <Typography variant="h5">Invite code</Typography>
      <TextField
        value={inviteCode}
        size="small"
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: <Button onClick={copyInviteCode}>Copy</Button>,
            sx: theme => ({
              fontFamily: "Monospace",
              [theme.breakpoints.up("md")]: { width: theme.spacing(48) },
            }),
          },
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Button onClick={handleRegenerateClick}>Regenerate</Button>
      </Box>
      <KickDialog
        user={userToKick}
        onKick={kickUser}
        onClose={() => setUserToKick(undefined)}
      />
      <Typography variant="h5">Members</Typography>
      {membersData?.map((member, i) => (
        <Fragment key={member.id}>
          {i !== 0 && <Divider />}
          <MemberItem
            displayName={member.displayName}
            email={member.email}
            userId={member.id}
            scheduleId={props.scheduleId}
            profilePictureUrl={createRandomPfpUrl(
              member.displayName,
              member.id,
            )}
            onKick={() => setUserToKick(member)}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <CompactNumberInput
              suggestedShifts={suggestedShifts[member.id] ?? 0}
              onChange={newValue => handleSuggestedChange(member.id, newValue)}
            />
          </Box>
        </Fragment>
      ))}
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="h5">Confirm</Typography>
        <Button
          variant="contained"
          onClick={handleSuggestionsSubmit}
          disabled={!unsubmittedRecommendationChanges()}
          sx={{
            backgroundColor: theme => theme.palette.info.light,
            "&.Mui-disabled": {
              opacity: 0.4,
              backgroundColor: theme =>
                theme.palette.info.light + " !important",
              color: "#FFFFFF",
            },
          }}
        >
          Submit Suggested Shifts
        </Button>
      </Box>
    </Box>
  );
}

export function createRandomPfpUrl(name: string, id: string) {
  const r = Math.floor(parseInt(id.substring(0, 2), 16) / 2)
    .toString(16)
    .padStart(2, "0");
  const g = Math.floor(parseInt(id.substring(2, 4), 16) / 2)
    .toString(16)
    .padStart(2, "0");
  const b = Math.floor(parseInt(id.substring(4, 6), 16) / 2)
    .toString(16)
    .padStart(2, "0");
  const nameStr = name
    .split(" ")
    .map(w => w[0])
    .join()
    .substring(0, 3);
  return `https://placehold.co/64x64/${r}${g}${b}/fff?text=${encodeURIComponent(nameStr)}`;
}

interface MemberItemProps {
  displayName: string;
  email: string;
  profilePictureUrl: string;
  scheduleId: string;
  userId: string;
  onKick?: () => void;
}

function MemberItem(props: MemberItemProps) {
  // Variables defining opening of drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // state of the drawer
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 1,
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton onClick={handleDrawerOpen}>
          <Avatar src={props.profilePictureUrl} />
        </IconButton>

        {/* Members Drawer */}
        <EditMembersDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          title="Member View"
        >
          <Avatar
            src={props.profilePictureUrl}
            sx={{ width: 100, height: 100, alignSelf: "center" }}
          />
          <Typography variant="h6" fontWeight="bold">
            {props.displayName}
          </Typography>
          <Typography variant="body1">
            {props.email}
            <br></br>
            <br></br>
          </Typography>
          <Divider sx={{ borderColor: "blue" }} />

          {drawerOpen && (
            <ShiftDisplay userId={props.userId} scheduleId={props.scheduleId} />
          )}

          <Typography variant="body2">
            <br></br>
            <br></br>UserID: {props.userId}
          </Typography>
          <Button color="error" onClick={props.onKick}>
            Kick
          </Button>
        </EditMembersDrawer>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography fontWeight="bold">{props.displayName}</Typography>
          <Typography color="textSecondary">{props.email}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
        <Button color="error" onClick={props.onKick}>
          Kick
        </Button>
      </Box>
    </Box>
  );
}

interface ShiftDisplayProps {
  userId: string;
  scheduleId: string;
}

function ShiftDisplay(props: ShiftDisplayProps) {
  const api = useApi();

  // Get the signups for the current shift tree
  const { data: scheduleSignups } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/signups",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  // Get the assignments for the current shift tree
  const { data: scheduleAssignments } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/assignments",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  // Get the assignments for the current shift tree
  const { data: shifts } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/shifts",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  // Cursed solution

  // Gets an array of all shiftIds that they're
  const shiftIds = scheduleAssignments
    ?.filter(assignment => assignment.user?.id === props.userId)
    .map(assignment => assignment.shiftId);

  // Gets the details for an individual shift
  function getShiftDetails(shiftId: string) {
    return shifts?.find(x => x.id == shiftId);
  }

  // The array of all the users shift details
  const shiftDetailsArray = shiftIds
    ?.filter(shiftId => shiftId !== undefined)
    .map(shiftId => getShiftDetails(shiftId));

  // Filtered signups
  const filteredSignups = scheduleSignups
    ?.filter(
      x =>
        x.signups?.find(signups => signups.user?.id === props.userId) !==
        undefined,
    )
    .map(shift => ({
      name: shift.name,
      startTime: dayjs(shift.startTime),
      endTime: dayjs(shift.endTime),
    }));

  console.log(shiftDetailsArray);

  // THIS IS INCREDIBLY CURSED ;-; //
  return (
    <Box>
      {/* Signups Section */}
      {shiftDetailsArray?.length === 0 &&
        filteredSignups !== undefined &&
        filteredSignups.length > 0 && (
          <>
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              Signups
            </Typography>
            {filteredSignups.map((signup, index) => (
              <Paper
                key={index}
                sx={{
                  padding: 1,
                  backgroundColor: theme => theme.palette.background.default,
                  marginBottom: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {dayjs(signup?.startTime).format("dddd")} (
                  {dayjs(signup?.startTime).format("M/D")})
                </Typography>
                <Typography>
                  {signup?.name} - {dayjs(signup?.startTime).format("HH:mm")} to{" "}
                  {dayjs(signup?.endTime).format("HH:mm")}
                </Typography>
              </Paper>
            ))}
          </>
        )}

      {/* Assignments Section */}
      {shiftDetailsArray && shiftDetailsArray.length > 0 && (
        <>
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            Assignments
          </Typography>
          {shiftDetailsArray?.map((shift, index) => (
            <Paper
              key={index}
              sx={{
                padding: 1,
                backgroundColor: theme => theme.palette.background.default,
                marginBottom: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {dayjs(shift?.startTime).format("dddd")} (
                {dayjs(shift?.startTime).format("M/D")})
              </Typography>
              <Typography>
                {shift?.name} - {dayjs(shift?.startTime).format("HH:mm")} to{" "}
                {dayjs(shift?.endTime).format("HH:mm")}
              </Typography>
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
}

interface KickDialogProps {
  user: { id: string; displayName: string } | undefined;
  onClose: () => void;
  onKick: (id: string) => void;
}

function KickDialog(props: KickDialogProps) {
  return (
    <Dialog open={props.user !== undefined} onClose={props.onClose}>
      <DialogTitle>{`Kick ${props.user?.displayName}?`}</DialogTitle>
      <DialogContent>
        <Typography>
          This will remove the user from the current ShiftTree. They can still
          rejoin using a join code.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          onClick={async () => {
            if (props.user) {
              props.onKick(props.user.id);
            }
            props.onClose();
          }}
        >
          Kick
        </Button>
      </DialogActions>
    </Dialog>
  );
}
