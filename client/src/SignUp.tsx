import { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
//import FormControlLabel from "@mui/material/FormControlLabel";
//import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import { Grid2 as Grid } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router";
import { useNotifier } from "./notifier";

import { useAuth } from "@/auth";
import theme from "@/theme";
import InputBox from "@/customComponents/InputBox";

export type SignUpParams = {
  from: string;
};

export default function SignUp() {
  const navigate = useNavigate();
  const notifier = useNotifier();
  const auth = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate("/");
    }
  }, [auth, navigate]);

  const [email, setEmail] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const [secretKey, setSecretKey] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("username") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirm-password") as string;

    if (!validateEmail(email)) {
      notifier.error("Invalid email address");
      return;
    }

    if (password !== confirmPassword) {
      notifier.error("Passwords do not match");
      return;
    }

    auth
      .register({ username, email, password })
      .then(response => {
        setErrorMessage(null);
        notifier.message("Successfully registered!");
        const { secretKey } = response;
        setSecretKey(secretKey || null);
        navigate("/signup-confirmation", { state: { secretKey } });
      })
      .catch(e => {
        console.error(e);
        setErrorMessage(e.toString());
      });
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ paddingTop: 8 }}>
      <CssBaseline />
      <InputBox>
        <Avatar
          sx={{ m: 2, bgcolor: "primary.main", width: 64, height: 64 }}
          src="/icons/shiftSprout_avatar.png"
        />
        <Typography component="h1" variant="h5">
          Register for ShiftTree
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                name="username"
                required
                fullWidth
                id="username"
                label="Display Name"
                autoFocus
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                name="confirm-password"
                label="Confirm Password"
                type="password"
                id="confirm-password"
                autoComplete="confirm-password"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Box>
            {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}
          </Box>
          <Grid container justifyContent="flex-center">
            <Grid>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </InputBox>
    </Container>
  );
}
