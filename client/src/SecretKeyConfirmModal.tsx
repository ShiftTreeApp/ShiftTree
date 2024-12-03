import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  Alert,
  AlertTitle,
} from "@mui/material";

interface DeleteShiftTreeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteShiftTreeModal: React.FC<DeleteShiftTreeModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <>
      <Dialog open={open} onClose={onClose} color="black">
        <DialogTitle>Warning!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Have you stored your key in a safe place? This is the last time you
            will be able to see your secret key!
            {/* Havent implemented yet */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            Go Back
          </Button>
          <Button onClick={onConfirm} color="primary">
            Continue to log in
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ width: "100%", marginTop: 2 }}>
        <Alert severity="error">
          <AlertTitle>Warning</AlertTitle>
          You only have access to this key once.
        </Alert>
      </Box>
    </>
  );
};

export default DeleteShiftTreeModal;
