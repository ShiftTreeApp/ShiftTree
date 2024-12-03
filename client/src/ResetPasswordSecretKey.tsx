import { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Grid2 as Grid } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router";
import { useNotifier } from "./notifier";

import { useAuth } from "@/auth";
import InputBox from "@/customComponents/InputBox";

export type SignUpParams = {
  from: string;
};

export default function PasswordReset() {
  const navigate = useNavigate();
  const notifier = useNotifier();
  const auth = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (auth.isLoggedIn()) {
      navigate("/");
    }
  }, [auth, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const resetCode = data.get("secret-key") as string;

    auth
      .confirmSecretKey({ email, resetCode })
      .then(() => {
        navigate("/password-reset", { state: { resetCode } });
      })
      .catch(error => {
        console.log(error);
        notifier.error("Invalid Secret Key");
      });
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ paddingTop: 8 }}>
      <CssBaseline />
      <InputBox>
        <Avatar
          sx={{ m: 2, bgcolor: "primary.main", width: 64, height: 64 }}
          src="https://github.com/ShiftTreeApp/ShiftTree/blob/main/icons/shiftSprout_avatar.png?raw=true"
        />
        <Typography component="h1" variant="h5">
          Enter Info to Reset Password
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                id="secret-key"
                label="Secret Key"
                name="secret-key"
                autoComplete="secret-key"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Reset Password
          </Button>
          <Box>
            {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}
          </Box>
        </Box>
      </InputBox>
    </Container>
  );
}
