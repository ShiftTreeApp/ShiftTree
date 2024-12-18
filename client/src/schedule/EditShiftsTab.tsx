import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
  Menu,
  MenuItem,
  Chip,
  Avatar,
} from "@mui/material";
import React from "react";
import dayjs from "dayjs";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  AutoMode as GenerateSchedule,
  CloudDownload as DownloadIcon,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import "dayjs/locale/en";
import {
  DateTimePicker,
  LocalizationProvider,
  renderTimeViewClock,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Link as RouterLink } from "react-router-dom";

import { ShiftCalendar } from "./ShiftCalendar";
import EditShiftDrawer from "./EditShiftDrawer";
import { useSearchParam } from "@/useSearchParam";
import MultiDateCalendar from "@/schedule/MultiDateCalendar";
import { useNotifier } from "@/notifier";
import useSchedule from "@/hooks/useSchedule";
import { useManagerActions } from "@/hooks/useManagerActions";
import { downloadFile } from "@/utils";
import { useEmployeeActions } from "@/hooks/useEmployeeActions";
import { useApi } from "@/client";
import { useShifts } from "@/hooks/useShifts";
import { createRandomPfpUrl } from "@/schedule/EditMembersTab";
import { CustomTooltip } from "@/customComponents/CustomTooltip";

interface EditShiftsTabProps {
  scheduleId: string;
}

export default function EditShiftsTab(props: EditShiftsTabProps) {
  const { scheduleId } = props;
  const [currentlyEditing, setCurrentlyEditing] = useSearchParam("shift");

  //const navigate = useNavigate();
  //const notifier = useNotifier();
  const schedule = useSchedule({ scheduleId: props.scheduleId });

  async function createNewShiftAndEdit() {
    if (schedule.shifts.length === 0) {
      const now = dayjs().startOf("hour");
      const { id } = await schedule.createShift({
        name: "First shift",
        description: "",
        startTime: now,
        endTime: now.add(1, "hour"),
        count: 1,
      });
      setCurrentlyEditing(id);
    } else {
      const lastEnd = dayjs(
        schedule.shifts[schedule.shifts?.length - 1].endTime,
      );
      const { id } = await schedule.createShift({
        name: "New shift",
        description: "",
        startTime: lastEnd,
        endTime: lastEnd.add(1, "hour"),
        count: 1,
      });
      setCurrentlyEditing(id);
    }
  }

  function EmptyShifts() {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: "center",
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        <Typography variant="h5">This ShiftTree is currently empty.</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={createNewShiftAndEdit}
          sx={{
            backgroundColor: theme => theme.palette.info.light,
          }}
        >
          Create first shift
        </Button>
      </Box>
    );
  }

  const managerActions = useManagerActions(props.scheduleId);

  const notifier = useNotifier();

  async function downloadLogData() {
    const result = await schedule.getLogData();
    downloadFile({
      data: new Blob([JSON.stringify(result.data, null, "\t")], {
        type: "application/json",
      }),
      filename: `${schedule.name ?? ""} - logData.json`,
    });
  }
  async function autogenerate() {
    if (empActions.allAssignments?.length !== 0) {
      notifier.error(
        "Reset assignments in settings tab if you would like to create a new schedule.",
      );
      return;
    }
    await managerActions.triggerAutoSchedule({ scheduleId: props.scheduleId });
    const logData = (await schedule.getLogData()).data as {
      [key: string]: any;
    };
    if (logData["status"] !== "optimal") {
      console.error("Scheduling failed", logData);
      notifier.error("Scheduling failed. Check logs for more information.");
    } else {
      notifier.message(
        "Schedule created! Download LogData for algorithim logs.",
      );
    }
  }

  async function downloadCsv() {
    const csv = await schedule.getAssignmentsCsv();
    downloadFile({
      data: new Blob([csv], { type: "text/csv" }),
      filename: `${schedule.name ?? ""} - Assigned Shifts.csv`,
    });
  }
  async function downloadIcs() {
    const ics = await schedule.getICS();
    downloadFile({
      data: new Blob([ics], { type: "text/ics" }),
      filename: `${schedule.name ?? ""} - Assigned Shifts.ics`,
    });
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const empActions = useEmployeeActions(scheduleId);

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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: { md: "column" },
            gap: 0.5,
          }}
        >
          {assignedUsers.map(user => (
            <UserIndicators
              key={user.id}
              name={user.displayName}
              id={user.id}
              email={user.email}
            />
          ))}
        </Box>
      </>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        flexGrow: 1,
        gap: 1,
      }}
    >
      <Breadcrumbs>
        <Link component={RouterLink} to={`/schedule/${props.scheduleId}`}>
          {schedule.name ?? schedule.data?.id ?? "Schedule"}
        </Link>
        <Typography>Edit shifts</Typography>
      </Breadcrumbs>
      {schedule.shifts.length === 0 && <EmptyShifts />}
      {schedule.shifts.length !== 0 && (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row-reverse",
              gap: 1,
            }}
          >
            <CustomTooltip title="Create New Shift" placement="top">
              <Button
                variant="contained"
                onClick={createNewShiftAndEdit}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: theme => theme.palette.info.light,
                }}
              >
                <Typography>Add Shift</Typography>
              </Button>
            </CustomTooltip>

            <CustomTooltip title="Auto-generate Schedule" placement="top">
              <Button
                variant="contained"
                onClick={autogenerate}
                startIcon={<GenerateSchedule />}
                sx={{
                  backgroundColor: theme => theme.palette.info.dark,
                }}
              >
                <Typography>Generate</Typography>
              </Button>
            </CustomTooltip>

            <CustomTooltip title="Download Schedule/Info" placement="top">
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{
                  backgroundColor: theme => theme.palette.info.main,
                }}
                onClick={handleClick}
              >
                Download
              </Button>
            </CustomTooltip>
            <Menu
              id="download-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={downloadCsv}>Download CSV</MenuItem>
              <MenuItem onClick={downloadIcs}>Download ICS</MenuItem>
              <MenuItem onClick={downloadLogData}>Download LogData</MenuItem>
            </Menu>
          </Box>
          <ShiftCalendar
            shifts={schedule.shifts}
            startDate={schedule.startTime}
            endDate={schedule.endTime}
            onClickShift={shiftId => setCurrentlyEditing(shiftId)}
            selectedShifts={currentlyEditing ? [currentlyEditing] : []}
            CustomContent={ManagerPerShiftStackContent}
          />
        </>
      )}
      <EditShiftDrawer
        open={currentlyEditing != null}
        onClose={() => setCurrentlyEditing(null)}
        title={"Shift Details"}
      >
        {currentlyEditing && (
          <EditShift
            key={props.scheduleId}
            scheduleId={props.scheduleId}
            shiftId={currentlyEditing}
            onClose={() => setCurrentlyEditing(null)}
          />
        )}
      </EditShiftDrawer>
    </Box>
  );
}

interface EditShiftProps {
  scheduleId: string;
  shiftId: string;
  onClose: () => void;
}

function EditShift(props: EditShiftProps) {
  const notifier = useNotifier();

  const schedule = useSchedule({ scheduleId: props.scheduleId });
  const shift = schedule.useShift({ shiftId: props.shiftId });

  async function deleteShift() {
    await shift.delete_();
    notifier.message("Shift deleted");
    props.onClose();
  }

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStartTime, setNewStartTime] = useState(dayjs());
  const [newEndTime, setNewEndTime] = useState(dayjs());
  const [newCount, setNewCount] = useState(1);
  useEffect(() => {
    if (shift.data) {
      setNewName(shift.data.name);
      setNewDesc(shift.data.description);
      setNewStartTime(dayjs(shift.data.startTime));
      setNewEndTime(dayjs(shift.data.endTime));
      setNewCount(shift.stack.length);
    }
  }, [shift.data, shift.stack]);

  useEffect(() => {
    if (newStartTime.isAfter(newEndTime)) {
      setNewEndTime(newStartTime.add(1, "hour"));
    }
  }, [newStartTime, newEndTime]);

  async function saveChanges() {
    await shift.update({
      name: newName,
      description: newDesc,
      startTime: newStartTime,
      endTime: newEndTime,
      count: newCount,
    });
    props.onClose();
  }

  const [copyTargetDates, setCopyTargetDates] = useState<dayjs.Dayjs[]>([]);

  const copyDatesDescription = useMemo(() => {
    const sorted = copyTargetDates.sort((a, b) => a.diff(b));
    // Consecutive runs of days
    const runs = sorted.reduce((acc, date, i) => {
      if (i === 0) {
        return [[date]];
      }
      const lastRun = acc[acc.length - 1];
      const lastDate = lastRun[lastRun.length - 1];
      if (date.diff(lastDate, "day") === 1) {
        lastRun.push(date);
        return acc;
      } else {
        return [...acc, [date]];
      }
    }, [] as dayjs.Dayjs[][]);
    const runStrings = runs.map(run => {
      if (run.length === 1) {
        return run[0].format("MMM DD");
      } else {
        const start = run[0].format("MMM DD");
        const endDate = run[run.length - 1];
        const end = run[0].isSame(endDate, "month")
          ? endDate.format("DD")
          : endDate.format("MMM DD");
        return `${start} - ${end}`;
      }
    });
    return runStrings.join(", ");
  }, [copyTargetDates]);

  async function copyShift() {
    if (copyTargetDates.length === 0) {
      notifier.error("No dates selected to copy shift to");
    }
    await Promise.all(
      copyTargetDates.map(async date => {
        const startTimeOffsetMin = newStartTime.diff(
          newStartTime.startOf("day"),
          "minute",
        );
        const endTimeOffsetMin = newEndTime.diff(newStartTime, "minute");
        const startTime = date.startOf("day").add(startTimeOffsetMin, "minute");
        const endTime = startTime.add(endTimeOffsetMin, "minute");
        await schedule.createShift({
          name: newName,
          description: newDesc,
          startTime: startTime,
          endTime: endTime,
          count: newCount,
        });
      }),
    ).catch(notifier.error);
    notifier.message(`Copied shift to ${copyTargetDates.length} dates`);

    props.onClose();
  }

  const currentDate = dayjs();
  const startDateFloor = currentDate.subtract(5, "year").startOf("day");
  const startDateCeil = currentDate.add(14, "year").endOf("day");
  const handleStartTimeChange = (value: any) => {
    // wont be any, gets sent from mui dateTimePicker
    if (value) {
      setNewStartTime(value);
      const maxEndTime = value.add(2, "month");
      if (newEndTime.isAfter(maxEndTime) || newEndTime.isBefore(value)) {
        setNewEndTime(value.add(1, "hour"));
      }
    }
  };

  return (
    <>
      <Typography sx={{ fontWeight: "bold" }}>Registered Members</Typography>
      {/* Chips for users that are signed up */}
      <UserChips scheduleId={props.scheduleId} shiftId={props.shiftId} />
      <Divider sx={{ paddingTop: 1, paddingBottom: 1 }} />
      <Typography sx={{ fontWeight: "bold" }}>Edit Shift</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          id="name"
          label="Name"
          value={newName}
          onChange={event => setNewName(event.target.value)}
          sx={{ flexGrow: "1" }}
        />
        <TextField
          id="count"
          label="Count"
          type="number"
          value={newCount}
          onChange={event => setNewCount(parseInt(event.target.value))}
          inputProps={{ min: 0, max: 100 }}
        />
      </Box>
      <TextField
        id="desc"
        label="Description"
        multiline
        value={newDesc}
        onChange={event => setNewDesc(event.target.value)}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "stretch",
            gap: 1,
          }}
        >
          <DateTimePicker
            label="Start time"
            ampm={false}
            value={newStartTime}
            minDateTime={startDateFloor}
            maxDateTime={startDateCeil}
            onChange={handleStartTimeChange}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            sx={{ flexGrow: 1 }}
          />
          <DateTimePicker
            label="End time"
            ampm={false}
            value={newEndTime}
            minDateTime={newStartTime}
            maxDateTime={newStartTime.add(2, "month").endOf("day")}
            onChange={value => value && setNewEndTime(value)}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            sx={{ flexGrow: 1 }}
          />
        </Box>
      </LocalizationProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          justifyContent: "space-between",
          paddingTop: 1,
        }}
      >
        <Button
          startIcon={<SaveIcon />}
          variant="contained"
          onClick={saveChanges}
        >
          Save
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          variant="contained"
          sx={{ backgroundColor: theme => theme.palette.error.dark }}
          onClick={deleteShift}
        >
          Delete shift
        </Button>
      </Box>
      <Divider sx={{ paddingTop: 1, paddingBottom: 1 }} />
      <Typography sx={{ fontWeight: "bold" }}>Copy Shift</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
      >
        <MultiDateCalendar
          selectedDates={copyTargetDates}
          onSelectedDatesChange={setCopyTargetDates}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Typography>
            {copyDatesDescription &&
              `This shift will be copied to ${copyDatesDescription}.`}
          </Typography>
          {copyTargetDates.length !== 0 && (
            <Button variant="contained" onClick={copyShift}>
              Copy Shift
            </Button>
          )}
          {copyTargetDates.length === 0 && (
            <Typography>Select dates to copy this shift to</Typography>
          )}
        </Box>
      </Box>
    </>
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
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {users?.length === 0 && <Typography>No registered users</Typography>}
      {users?.map(user => {
        return (
          <CustomTooltip key={user.id} title={user.email}>
            <Chip
              avatar={
                <Avatar src={createRandomPfpUrl(user.displayName, user.id)} />
              }
              label={user.displayName}
              variant="outlined"
            />
          </CustomTooltip>
        );
      })}
    </Box>
  );
}

interface UserIndicatorsProps {
  name: string;
  id: string;
  email: string;
}

function UserIndicators(props: UserIndicatorsProps) {
  return (
    <CustomTooltip title={props.email}>
      <Chip
        avatar={
          <Avatar src={createRandomPfpUrl(props.name, props.id)}></Avatar>
        }
        sx={{
          backgroundColor: theme => theme.palette.primary.main,
          color: "white",
        }}
        label={props.name}
        variant="outlined"
      />
    </CustomTooltip>
  );
}
