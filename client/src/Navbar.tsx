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
//import NotificationsIcon from "@mui/icons-material/Notifications"; // Will return once we have notifs implemented
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
//import SettingsIcon from "@mui/icons-material/Settings"; // Will return once we have a use for settings page
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "@/auth";
import JoinTree from "./JoinTree";
import { LeftDrawerContext } from "./Home";
import { CustomTooltip } from "./customComponents/CustomTooltip";

interface ModalContextType {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ModalContext = React.createContext<ModalContextType>({
  modalOpen: false,
  setModalOpen: () => {},
});

export interface NavbarProps {
  showMenu?: boolean | undefined;
}

export default function Navbar({ showMenu }: NavbarProps) {
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
  const [joinType, setJoinType] = React.useState<"ShiftTree">("ShiftTree");

  const handleModalOpen = (type: "ShiftTree") => {
    setJoinType(type);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Grid container>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar
            position="fixed"
            sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
          >
            <Toolbar
              sx={{
                justifyContent: "space-between",
                backgroundColor: "primary",
              }}
            >
              {showMenu && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: "none" } }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <CustomTooltip title="Return to Dashboard" placement="bottom">
                <Link component={RouterLink} to="/">
                  <Typography fontSize={24} color={"white"}>
                    ShiftTree
                  </Typography>
                </Link>
              </CustomTooltip>

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
                  <MenuItem onClick={() => handleModalOpen("ShiftTree")}>
                    <Button>Join ShiftTree</Button>
                  </MenuItem>
                </Menu>
                {/* TODO: Implement notifications later on
                <CustomTooltip title="Notifications" placement="bottom">
                  <IconButton aria-label="notif" size="small" sx={{ ml: 2 }}>
                    <NotificationsIcon fontSize="medium" />
                  </IconButton>
                </CustomTooltip>
                */}
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
                {/* TODO: Implement user profiles later on
                <ListItemButton>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Edit Profile" />
                </ListItemButton>
                */}
                {/* TODO: Implement settings page
                <ListItemButton>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
                */}
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
    </>
  );
}
