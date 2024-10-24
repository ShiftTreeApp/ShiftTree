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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useAuth } from "@/auth";

export default function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();

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

  return (
    <Grid container>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar
            sx={{ justifyContent: "space-between", backgroundColor: "primary" }}
          >
            <Link component={RouterLink} to="/">
              <Typography fontSize={24} color={"white"}>
                ShiftTree
              </Typography>
            </Link>

            <Grid>
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
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "add-button",
                }}
              >
                <MenuItem onClick={handleClose}>Create ShiftTree</MenuItem>
                <MenuItem onClick={handleClose}>Create Organization</MenuItem>
                <MenuItem onClick={handleClose}>Join ShiftTree</MenuItem>
                <MenuItem onClick={handleClose}>Join Organization</MenuItem>
              </Menu>
              <IconButton aria-label="notif" size="small">
                <NotificationsIcon fontSize="medium" />
              </IconButton>
              <IconButton aria-label="profile" size="small">
                <AccountCircleIcon fontSize="medium" />
              </IconButton>
              <Button color="inherit" onClick={onLogout}>
                Log out
              </Button>
            </Grid>
          </Toolbar>
        </AppBar>
      </Box>
    </Grid>
  );
}
