import * as React from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
// import PropTypes from 'prop-types';

function SimpleDialog(props: { onClose: () => void; open: boolean }) {
  const { onClose, open } = props;
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Send this Code to Employees</DialogTitle>
    </Dialog>
  );
}
//   SimpleDialog.propTypes = {
//     open: PropTypes.bool.isRequired,
//     onClose: PropTypes.func.isRequired,
//   };

export default function InviteButton() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    // Make a request to backend
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ "& > :not(style)": { m: 1 } }}>
      <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
        <AddIcon />
      </Fab>
      <SimpleDialog onClose={handleClose} open={open} />
    </Box>
  );
}
