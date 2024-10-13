import { Button, Grid2, Typography } from "@mui/material";
import { useNavigate } from "react-router";

import { useAuth } from "@/auth";

export default function Home() {
  const auth = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    auth.logout();
    navigate("/");
  }

  return (
    <Grid2 container direction="column" spacing={2}>
      <Typography variant="h4">Home</Typography>
      <Button variant="contained" onClick={onLogout}>
        Logout
      </Button>
    </Grid2>
  );
}
