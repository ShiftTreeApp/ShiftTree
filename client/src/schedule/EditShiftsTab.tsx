import {
  Box,
  Breadcrumbs,
  Button,
  Link,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
} from "@mui/material";
import dayjs from "dayjs";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  //EventRepeat as GenerateSchedule,
  AutoMode as GenerateSchedule,
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

import { ShiftCalendar, type ShiftDetails } from "./ShiftCalendar";
import EditShiftDrawer from "./EditShiftDrawer";
import { useSearchParam } from "@/useSearchParam";
import { useApi } from "@/client";
import GenerateShiftModal from "./GenerateShiftModal";

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

interface EditShiftsTabProps {
  scheduleId: string;
}

export default function EditShiftsTab(props: EditShiftsTabProps) {
  const [currentlyEditing, setCurrentlyEditing] = useSearchParam("shift");

  const api = useApi();

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: props.scheduleId } } },
  );
  const startTime = useMemo(
    () => (scheduleData?.startTime ? dayjs(scheduleData.startTime) : dayjs()),
    [scheduleData?.startTime],
  );
  const endTime = useMemo(
    () => (scheduleData?.endTime ? dayjs(scheduleData.endTime) : dayjs()),
    [scheduleData?.endTime],
  );
  useEffect(() => console.log(scheduleData), [scheduleData]);

  const { data: shiftsData, refetch: refetchShifts } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/shifts",
    {
      params: { path: { scheduleId: props.scheduleId } },
    },
  );
  const shifts = useMemo(
    () =>
      shiftsData?.map(
        shift =>
          ({
            id: shift.id,
            name: shift.name,
            startTime: dayjs(shift.startTime),
            endTime: dayjs(shift.endTime),
          }) satisfies ShiftDetails,
      ),
    [shiftsData],
  );

  const { mutateAsync: postShift } = api.useMutation(
    "post",
    "/schedules/{scheduleId}/shifts",
    {
      onSuccess: async () => {
        await refetchShifts();
      },
    },
  );

  async function createNewShiftAndEdit() {
    if (shifts == undefined) {
      return;
    }
    if (shifts.length === 0) {
      const now = dayjs().startOf("hour");
      const { id } = await postShift({
        params: { path: { scheduleId: props.scheduleId } },
        body: {
          name: "First shift",
          startTime: now.toISOString(),
          endTime: now.add(1, "hour").toISOString(),
        },
      });
      setCurrentlyEditing(id);
    } else {
      const lastEnd = dayjs(shifts[shifts?.length - 1].endTime);
      const { id } = await postShift({
        params: { path: { scheduleId: props.scheduleId } },
        body: {
          name: "New shift",
          startTime: lastEnd.toISOString(),
          endTime: lastEnd.add(1, "hour").toISOString(),
        },
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
        >
          Create first shift
        </Button>
      </Box>
    );
  }

  // generate shift modal
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirmModal = () => {
    // Add logic to generate the schedule here
    // For now, we'll just close the modal after a delay to simulate loading
    setTimeout(() => {
      setModalOpen(false);
    }, 2000);
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
          {scheduleData?.name ?? scheduleData?.id ?? "Schedule"}
        </Link>
        <Typography>Edit shifts</Typography>
      </Breadcrumbs>
      {shifts?.length === 0 && <EmptyShifts />}
      {shifts?.length !== 0 && (
        <>
          <Box sx={{ display: "flex", flexDirection: "row-reverse", gap: 1 }}>
            <CustomTooltip title="To view mode" placement="top">
              <IconButton
                component={RouterLink}
                to={`/schedule/${props.scheduleId}`}
              >
                <PreviewIcon />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="Add Shift" placement="top">
              <IconButton onClick={createNewShiftAndEdit}>
                <AddIcon />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="Generate schedule" placement="top">
              <IconButton onClick={handleOpenModal}>
                <GenerateSchedule />
              </IconButton>
            </CustomTooltip>
            <GenerateShiftModal
              open={modalOpen}
              onClose={handleCloseModal}
              onConfirm={handleConfirmModal}
            />
            {/* <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={createNewShiftAndEdit}
            /> */}
          </Box>
          <ShiftCalendar
            shifts={shifts ?? []}
            startDate={startTime}
            endDate={endTime}
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
  const api = useApi();
  const { refetch: refetchSchedule } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: props.scheduleId } } },
  );

  const { data: shiftsData, refetch: refetchShifts } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/shifts",
    { params: { path: { scheduleId: props.scheduleId } } },
  );
  const shiftData = useMemo(
    () => shiftsData?.find(shift => shift.id === props.shiftId),
    [props.shiftId, shiftsData],
  );

  const { mutateAsync: sendDelete } = api.useMutation(
    "delete",
    "/shifts/{shiftId}",
    {
      onSuccess: async () => {
        await refetchShifts();
        await refetchSchedule();
      },
    },
  );

  async function deleteShift() {
    await sendDelete({ params: { path: { shiftId: props.shiftId } } });
    props.onClose();
  }

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStartTime, setNewStartTime] = useState(dayjs());
  const [newEndTime, setNewEndTime] = useState(dayjs());
  useEffect(() => {
    if (shiftData) {
      setNewName(shiftData.name);
      // TODO: set descripion
      setNewStartTime(dayjs(shiftData.startTime));
      setNewEndTime(dayjs(shiftData.endTime));
    }
  }, [shiftData]);

  useEffect(() => {
    if (newStartTime.isAfter(newEndTime)) {
      setNewEndTime(newStartTime.add(1, "hour"));
    }
  }, [newStartTime]);

  const { mutateAsync: updateShift } = api.useMutation(
    "put",
    "/shifts/{shiftId}",
    {
      onSuccess: async () => {
        await refetchShifts();
        await refetchSchedule();
      },
    },
  );

  async function saveChanges() {
    await updateShift({
      params: { path: { shiftId: props.shiftId } },
      body: {
        name: newName,
        // TODO: add description
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
      },
    });
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
          color="error"
          onClick={deleteShift}
        >
          Delete shift
        </Button>
      </Box>
    </>
  );
}
