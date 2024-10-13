import { useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useApi } from "@/client";
import { useNavigate, useParams } from "react-router";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export type SignInParams = {
  from: string;
};

export default function SignIn() {
  const api = useApi();
  const navigate = useNavigate();
  const routeParams = useParams<SignInParams>();

  const { mutateAsync: submitLogin, error: loginError } = api.useMutation(
    "post",
    "/login",
  );

  function onLogin(accessToken: string) {
    console.table({ accessToken });
    localStorage.setItem("accessToken", accessToken);
    navigate(routeParams.from ?? "/");
  }

  const [remember, setRemember] = useState(false);

  // TODO: Ensure server error messages are good enough to show to the user
  const errorMessage = useMemo(() => loginError?.toString(), [loginError]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    // TODO: Disable logging password in production
    console.table({ email, password });
    submitLogin({ body: { email, password } }).then(({ accessToken }) =>
      onLogin(accessToken),
    );
  };

  return (
    <ThemeProvider theme={defaultTheme}>
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
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
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
            <FormControlLabel
              control={
                <Checkbox
                  onChange={e => setRemember(e.target.checked)}
                  checked={remember}
                  value="remember"
                  color="primary"
                />
              }
              label="Remember me"
            />
            <Button type="submit" fullWidth variant="contained">
              Sign In
            </Button>
            <Box>
              {errorMessage && (
                <Typography color="error">{errorMessage}</Typography>
              )}
            </Box>
            <Grid
              container
              spacing={2}
              sx={{ justifyContent: "space-between" }}
            >
              <Grid>
                <Link href="/reset" variant="body2">
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
    </ThemeProvider>
  );
}
