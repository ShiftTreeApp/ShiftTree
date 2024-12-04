import { Box, Drawer, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import NavbarPadding from "@/NavbarPadding";
import { type ReactNode } from "react";

export interface EditMembersDrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode | string;
  children?: ReactNode | string | undefined;
}

export default function EditShiftDrawer(props: EditMembersDrawerProps) {
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
            flexDirection: "",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{props.title}</Typography>
          <IconButton onClick={props.onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {props.children}
        </Box>
      </Box>
    </Drawer>
  );
}
