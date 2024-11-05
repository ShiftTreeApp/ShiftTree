import * as React from "react";
import { useNavigate } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Grid2 as Grid,
  Link,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
  Drawer,
  List,
  //ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Dialog,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "@/auth";
import JoinTree from "./JoinTree";
import { LeftDrawerContext } from "./Home";

interface ModalContextType {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

export const ModalContext = React.createContext<ModalContextType | undefined>(
  undefined,
);

export default function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const LDC = React.useContext(LeftDrawerContext);
  const handleDrawerToggle = () => {
    if (!LDC.isClosing) {
      LDC.setMobileOpen(!LDC.mobileOpen);
    }
  };
  function onLogout() {
    auth.logout();
    // after logout, navigate("/") takes you to sign in
    navigate("/");
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const [modalOpen, setModalOpen] = React.useState(false);
  const [joinType, setJoinType] = React.useState<"ShiftTree" | "Organization">(
    "ShiftTree",
  );

  const handleModalOpen = (type: "ShiftTree" | "Organization") => {
    setJoinType(type);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <Grid container>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
          <Toolbar
            sx={{ justifyContent: "space-between", backgroundColor: "primary" }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Link component={RouterLink} to="/">
              <Typography fontSize={24} color={"white"}>
                ShiftTree
              </Typography>
            </Link>

            <Grid>
              <CustomTooltip title="Create/Join" placement="bottom">
                <IconButton
                  id="add-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  aria-label="add"
                  size="small"
                >
                  <AddIcon fontSize="medium" />
                </IconButton>
              </CustomTooltip>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "add-button",
                }}
              >
                <MenuItem onClick={handleClose}>
                  <Button component={RouterLink} to="/create">
                    Create ShiftTree
                  </Button>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Button>Create Organization</Button>
                </MenuItem>
                <MenuItem onClick={() => handleModalOpen("ShiftTree")}>
                  <Button>Join ShiftTree</Button>
                </MenuItem>
                <MenuItem onClick={() => handleModalOpen("Organization")}>
                  <Button>Join Organization</Button>
                </MenuItem>
              </Menu>
              <CustomTooltip title="Notifications" placement="bottom">
                <IconButton aria-label="notif" size="small" sx={{ ml: 2 }}>
                  <NotificationsIcon fontSize="medium" />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title="Profile" placement="bottom">
                <IconButton
                  aria-label="profile"
                  size="small"
                  sx={{ ml: 2 }}
                  onClick={handleDrawerOpen}
                >
                  <AccountCircleIcon fontSize="medium" />
                </IconButton>
              </CustomTooltip>
              {/* <Button color="inherit" onClick={onLogout}>
                Log out
              </Button> */}
            </Grid>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          sx={{ zIndex: theme => theme.zIndex.drawer + 1000 }}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={handleDrawerClose}
            onKeyDown={handleDrawerClose}
          >
            <List>
              <ListItemButton>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Edit Profile" />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
              <ListItemButton onClick={onLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>
        <Dialog open={modalOpen} onClose={handleModalClose}>
          <ModalContext.Provider value={{ modalOpen, setModalOpen }}>
            <JoinTree joinType={joinType} />
          </ModalContext.Provider>
        </Dialog>
      </Box>
    </Grid>
  );
}
