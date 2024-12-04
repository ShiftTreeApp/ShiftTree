import {
  Grid2 as Grid,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  DeleteForever as DeleteShiftTreeIcon,
  RotateLeft as ResetIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import DeleteShiftTreeModal from "./DeleteShiftTreeModal";

import useSchedule from "@/hooks/useSchedule";
import { useNotifier } from "@/notifier";
import { CustomTooltip } from "@/customComponents/CustomTooltip";

interface ShiftTreeSettingsProps {
  scheduleId: string;
}

export default function ShiftTreeSettings(props: ShiftTreeSettingsProps) {
  const schedule = useSchedule({ scheduleId: props.scheduleId });
  const navigate = useNavigate();
  const notifier = useNotifier();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteShiftTreeClick = () => {
    setDeleteModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    await schedule.deleteSchedule().catch(notifier.error);
    notifier.message("ShiftTree deleted");
    setDeleteModalOpen(false);
    navigate("/");
  };

  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleResetShiftTreeClick = () => {
    setResetModalOpen(true);
  };
  const handleResetConfirm = async () => {
    await schedule.deleteAllAssignments().catch(notifier.error);
    notifier.message("Assignments reset");
    setResetModalOpen(false);
  };

  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: "start",
      }}
    >
      <Breadcrumbs>
        <Link component={RouterLink} to={`/schedule/${props.scheduleId}`}>
          {schedule.name ?? "Schedule"}
        </Link>
        <Typography>Settings</Typography>
      </Breadcrumbs>
      <Typography variant="h5">ShiftTree Settings</Typography>
      <CustomTooltip title="Reset All Assignments" placement="top">
        <Button
          variant="contained"
          startIcon={<ResetIcon />}
          onClick={handleResetShiftTreeClick}
          sx={{
            backgroundColor: theme => theme.palette.error.dark,
          }}
        >
          <Typography>Reset Assignments</Typography>
        </Button>
      </CustomTooltip>
      <CustomTooltip title="Delete Entire ShiftTree" placement="top">
        <Button
          variant="contained"
          startIcon={<DeleteShiftTreeIcon />}
          onClick={handleDeleteShiftTreeClick}
          sx={{
            backgroundColor: theme => theme.palette.error.dark,
          }}
        >
          <Typography>Delete ShiftTree</Typography>
        </Button>
      </CustomTooltip>
      <DeleteShiftTreeModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
      <ResetModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </Grid>
  );
}

interface ResetModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reset Assignments</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Are you sure you want to reset all assignments? This will clear the generated schedule. (This cannot be undone)"
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="primary">
          Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
};
