import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
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
  );
};

export default DeleteShiftTreeModal;
