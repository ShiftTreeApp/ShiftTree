import { Box, Drawer, Typography, IconButton, Divider } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import NavbarPadding from "@/NavbarPadding";
import { type ReactNode } from "react";

export interface EditShiftDrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode | string;
  children?: ReactNode | string | undefined;
}

export default function EditShiftDrawer(props: EditShiftDrawerProps) {
  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      anchor="right"
      sx={theme => ({
        ".MuiDrawer-paper": {
          [theme.breakpoints.down("md")]: {
            width: "100%",
          },
        },
      })}
    >
      <NavbarPadding />
      <Box
        sx={theme => ({
          [theme.breakpoints.up("md")]: {
            width: theme => theme.spacing(96),
          },
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: 2,
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{props.title}</Typography>
          <IconButton onClick={props.onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ marginBottom: 1 }} />
        {props.children}
      </Box>
    </Drawer>
  );
}
