import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Button,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { HowToReg as RegisterIcon } from "@mui/icons-material";
import NavbarPadding from "@/NavbarPadding";
import { type ReactNode } from "react";
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
        {props.children}
      </Box>
    </Drawer>
  );
}
