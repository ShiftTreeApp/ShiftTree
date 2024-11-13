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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete ShiftTree</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this shiftTree? (This cannot be
          undone)
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="primary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteShiftTreeModal;
