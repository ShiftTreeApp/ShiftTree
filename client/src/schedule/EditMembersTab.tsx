import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Fragment } from "react";

import { useApi } from "@/client";

interface EditMembersTabProps {
  scheduleId: string;
}

export default function EditMembersTab(props: EditMembersTabProps) {
  const api = useApi();

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  const { data: membersData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/members",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  // TODO: Add the base url as an environment variable so it can be set during build
  const inviteCode = "http://localhost:5173?join=[code here]";

  function copyInviteCode() {
    navigator.clipboard.writeText(inviteCode);
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
        <Button>Regenerate</Button>
      </Box>
      <Typography variant="h5">Members</Typography>
      {membersData?.map((member, i) => (
        <Fragment key={member.id}>
          {i !== 0 && <Divider />}
          <MemberItem
            displayName={member.displayName}
            email={member.email}
            userId={member.id}
            profilePictureUrl={createRandomPfpUrl(
              member.displayName,
              member.id,
            )}
          />
        </Fragment>
      ))}
    </Box>
  );
}

function createRandomPfpUrl(name: string, id: string) {
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
  userId: string;
  onKick?: () => void;
}

function MemberItem(props: MemberItemProps) {
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
        <Avatar src={props.profilePictureUrl} />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography fontWeight="bold">{props.displayName}</Typography>
          <Typography color="textSecondary">{props.email}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
        <Button color="error">Kick</Button>
      </Box>
    </Box>
  );
}
