import {
  Button,
  Grid2 as Grid,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import profileImage from "./assets/profile.png";
import Navbar from "@/Navbar";

export default function App() {
  return (
    <Grid container direction="column" spacing={2}>
      <Navbar />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          bgcolor: "lightgray",
          paddingTop: 2,
        }}
      >
        <Grid container justifyContent="center">
          <img src={profileImage} style={{ width: "70%" }} />
        </Grid>

        <Grid>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              width: "100%",
              fontSize: "30px",
            }}
          >
            Username
          </Typography>

          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              width: "100%",
              fontSize: "15px",
            }}
          >
            example@email.com
          </Typography>
        </Grid>

        {/* Job Title Text Field */}
        <TextField
          multiline
          rows={5}
          variant="outlined"
          fullWidth
          placeholder="Biography"
          sx={{ width: "60vh" }}
        />
        {/* Biography Text Field */}
        <TextField
          multiline
          rows={5}
          variant="outlined"
          fullWidth
          placeholder="Biography"
          sx={{ width: "60vh" }}
        />

        <Grid
          container
          size={9}
          justifyContent={"right"}
          sx={{ marginTop: 8, pt: 0.5, pb: 0.5, px: 2 }}
        >
          {/* Going to need to add functionality for saving profile here */}
          <Button
            sx={{ backgroundColor: "green" }}
            component={Link}
            to="/profile"
          >
            <Typography color="black" sx={{ fontSize: "25px" }}>
              Save
            </Typography>
          </Button>
        </Grid>
      </Box>
    </Grid>
  );
}
