import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
} from "@mui/material";

interface GenerateShiftModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const GenerateShiftModal: React.FC<GenerateShiftModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    onConfirm();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          boxShadow: 24,
        }}
      >
        <Card
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {!loading ? (
            <>
              <Typography variant="body1">
                Are you sure want to generate the schedule? <br /> (This will
                automatically close the ShiftTree)
              </Typography>
              <Button variant="contained" onClick={handleConfirm}>
                Confirm
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6">Generating schedule...</Typography>
              <CircularProgress />
              <Button variant="contained" component={RouterLink} to={"../"}>
                Go to Dashboard
              </Button>
            </>
          )}
        </Card>
      </Box>
    </Modal>
  );
};

export default GenerateShiftModal;
