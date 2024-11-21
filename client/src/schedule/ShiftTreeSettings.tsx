import { Grid2 as Grid, Typography, Button } from "@mui/material";
import { DeleteForever as DeleteShiftTreeIcon } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import DeleteShiftTreeModal from "./DeleteShiftTreeModal";

import useSchedule from "@/hooks/useSchedule";
import { useNotifier } from "@/notifier";

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

  return (
    <Grid>
      <h1>ShiftTreeSettings</h1>
      {schedule.data?.role == "owner" || schedule.data?.role == "manager" ? (
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
      ) : null}
      <DeleteShiftTreeModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </Grid>
  );
}
