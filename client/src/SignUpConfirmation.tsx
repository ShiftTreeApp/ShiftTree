import { useState } from "react";
import {
  Grid2 as Grid,
  Typography,
  Button,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
  Avatar,
  CssBaseline,
  TextField,
  Box,
  Container,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router";
import SecretKeyConfirmModal from "./SecretKeyConfirmModal";

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

export default function SignUpConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { secretKey } = location.state || {};
  const [isFocused, setIsFocused] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleLogInShiftTreeClick = () => {
    setConfirmModalOpen(true);
  };
  const handleLogInConfirm = async () => {
    setConfirmModalOpen(false);
    navigate("/");
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
        {/* Replace with user's avatar */}
        <Avatar
          sx={{ m: 2, bgcolor: "primary.main", width: 64, height: 64 }}
          src="https://github.com/ShiftTreeApp/ShiftTree/blob/main/icon/shiftTree_avatar.png?raw=true"
        />
        <Typography component="h1" variant="h5">
          Secret Key
        </Typography>
        <Grid
          container
          spacing={2}
          direction="column"
          component="form"
          noValidate
          sx={{ mt: 4 }}
        >
          <Typography variant="body1" align="center">
            Please keep this secret key safe. <br />
            You will need it if you have to reset your password.
          </Typography>
          <CustomTooltip title="Click to reveal" placement="left">
            <Box
              sx={{
                filter: isFocused ? "none" : "blur(5px)",
                transition: "filter 0.3s",
              }}
            >
              <TextField
                required
                fullWidth
                id="secret-key"
                label="Secret Key"
                name="secret-key"
                value={secretKey}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </Box>
          </CustomTooltip>
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogInShiftTreeClick}
          >
            Log in
          </Button>
        </Grid>
      </Box>
      <SecretKeyConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleLogInConfirm}
      />
    </Container>
  );
}
