import {
  Grid2 as Grid,
  Typography,
  Button,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
} from "@mui/material";
import { DeleteForever as DeleteShiftTreeIcon } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteShiftTreeModal from "./DeleteShiftTreeModal";

import useSchedule from "@/hooks/useSchedule";
import { useNotifier } from "@/notifier";

interface ShiftTreeSettingsProps {
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
      ) : null}
      <DeleteShiftTreeModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </Grid>
  );
}
