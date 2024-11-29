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
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
} from "@mui/material";
import React from "react";
import dayjs from "dayjs";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  //EventRepeat as GenerateSchedule,
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
import GenerateShiftModal from "./GenerateShiftModal";
import MultiDateCalendar from "@/schedule/MultiDateCalendar";
import { useNotifier } from "@/notifier";
import useSchedule from "@/hooks/useSchedule";
import { useManagerActions } from "@/hooks/useManagerActions";
import { downloadFile } from "@/utils";

interface EditShiftsTabProps {
  scheduleId: string;
}

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

export default function EditShiftsTab(props: EditShiftsTabProps) {
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

  // generate shift modal
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    //Fetch backend.
    setModalOpen(true);
    autogenerate();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    downloadLogData();
  };
  const managerActions = useManagerActions(props.scheduleId);

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
    await managerActions.triggerAutoSchedule({ scheduleId: props.scheduleId });
  }

  const handleConfirmModal = () => {
    // Add logic to generate the schedule here
    // For now, we'll just close the modal after a delay to simulate loading
    setTimeout(() => {
      setModalOpen(false);
    }, 2000);
  };

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
            <Button
              variant="contained"
              component={RouterLink}
              to={`/schedule/${props.scheduleId}`}
              startIcon={<PreviewIcon />}
              sx={{
                backgroundColor: theme => theme.palette.info.main,
              }}
            >
              <Typography>View mode</Typography>
            </Button>
            {schedule.data?.role == "owner" ||
            schedule.data?.role == "manager" ? (
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
            ) : null}

            {schedule.data?.role == "owner" ||
            schedule.data?.role == "manager" ? (
              <CustomTooltip title="Auto-generate Schedule" placement="top">
                <Button
                  variant="contained"
                  onClick={handleOpenModal}
                  startIcon={<GenerateSchedule />}
                  sx={{
                    backgroundColor: theme => theme.palette.info.dark,
                  }}
                >
                  <Typography>Generate</Typography>
                </Button>
              </CustomTooltip>
            ) : null}

            <GenerateShiftModal
              open={modalOpen}
              onClose={handleCloseModal}
              onConfirm={handleConfirmModal}
            />
            <CustomTooltip title="Download Generated Schedule" placement="top">
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
          />
        </>
      )}
      <EditShiftDrawer
        open={currentlyEditing != null}
        onClose={() => setCurrentlyEditing(null)}
        title={"Edit shift"}
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
  useEffect(() => {
    if (shift.data) {
      setNewName(shift.data.name);
      setNewDesc(shift.data.description);
      setNewStartTime(dayjs(shift.data.startTime));
      setNewEndTime(dayjs(shift.data.endTime));
    }
  }, [shift.data]);

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
        console.log(startTimeOffsetMin);
        const endTimeOffsetMin = newEndTime.diff(newStartTime, "minute");
        const startTime = date.startOf("day").add(startTimeOffsetMin, "minute");
        const endTime = startTime.add(endTimeOffsetMin, "minute");
        await schedule.createShift({
          name: newName,
          description: newDesc,
          startTime: startTime,
          endTime: endTime,
        });
      }),
    ).catch(notifier.error);
    notifier.message(`Copied shift to ${copyTargetDates.length} dates`);

    props.onClose();
  }

  return (
    <>
      <TextField
        id="name"
        label="Name"
        value={newName}
        onChange={event => setNewName(event.target.value)}
      />
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
            onChange={value => value && setNewStartTime(value)}
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
