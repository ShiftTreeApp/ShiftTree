import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate, useParams } from "react-router";

import { useAuth } from "@/auth";
import { useNotifier } from "@/notifier";

export type SignInParams = {
  from: string;
};

export default function SignIn() {
  const navigate = useNavigate();
  const routeParams = useParams<SignInParams>();

  const auth = useAuth();
  const notifier = useNotifier();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    auth
      .login({ email, password })
      .then(() => {
        navigate(routeParams.from ?? "/");
      })
      .catch(notifier.error);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{ m: 2, bgcolor: "primary.main", width: 64, height: 64 }}
          src="/icons/shiftTree_avatar.png"
        />
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Grid
          container
          spacing={2}
          direction="column"
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 4 }}
        >
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth variant="contained">
            Sign In
          </Button>
          <Grid container spacing={2} sx={{ justifyContent: "space-between" }}>
            <Grid>
              <Link href="/enter-secret-key" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
