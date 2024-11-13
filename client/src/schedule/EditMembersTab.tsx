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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Fragment, useState, useMemo, useEffect } from "react";
import EditMembersDrawer from "./EditMembersDrawer";
import { useApi } from "@/client";
import dayjs from "dayjs";
import { useManagerActions } from "@/hooks/useManagerActions";

interface EditMembersTabProps {
  scheduleId: string;
}

export default function EditMembersTab(props: EditMembersTabProps) {
  const api = useApi();
  const managerActions = useManagerActions(props.scheduleId);

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
        </Fragment>
      ))}
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
            sx={{ width: "7vw", height: "7vw" }}
          />
          <Typography variant="h6" fontWeight="bold">
            {props.displayName}
          </Typography>
          <Typography variant="body1">
            {props.email}
            <br></br>
            <br></br>
            <br></br>
          </Typography>

          <Divider component="div" role="presentation" />

          <Typography variant="h5" sx={{ textDecoration: "underline" }}>
            Shift Details
          </Typography>
          {drawerOpen && (
            <ShiftDisplay userId={props.userId} scheduleId={props.scheduleId} />
          )}

          <Typography variant="body1">
            <br></br>
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

  // const signupData = useMemo();
  console.log("Unpacking");

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

  return (
    <Box>
      {filteredSignups !== undefined && filteredSignups.length > 0 ? (
        filteredSignups.map((signup, index) => (
          <Typography key={index}>
            {signup.startTime.format("dddd")} {signup.name} -{" "}
            {signup.startTime.format("HH:mm")} to{" "}
            {signup.endTime.format("HH:mm")}
          </Typography>
        ))
      ) : (
        <Typography>Loading signup data...</Typography>
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
