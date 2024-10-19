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
} from "@mui/material";

import { useAuth } from "@/auth";

export default function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    auth.logout();
    // after logout, navigate("/") takes you to sign in
    navigate("/");
  }

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
            <Button color="inherit" onClick={onLogout}>
              Log out
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
    </Grid>
  );
}
