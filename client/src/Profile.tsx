import {
  Button,
  Grid2 as Grid,
  Paper,
  Divider,
  Box,
  Typography
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

          <Box
            sx={{
              width: "70vh",
              bgcolor: "gray",
              padding: 2,
              marginTop: 2,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{ textAlign: "center", color: "white", fontSize: "30px" }}
            >
              Job Title:
            </Typography>
          </Box>
          <Box
            sx={{
              width: "70vh",
              bgcolor: "gray",
              padding: 2,
              marginTop: 2,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{ textAlign: "center", color: "white", fontSize: "30px" }}
            >
              Biography:
            </Typography>
          </Box>
        </Grid>

        <Grid
          container
          size={9}
          justifyContent={"center"}
          sx={{ marginTop: 8, pt: 0.5, pb: 0.5, px: 2 }}
        >
          <Button sx={{ backgroundColor: "red" }} component={Link} to="/edit_profile">
            <Typography color="black" sx={{ fontSize: "25px" }}>
              Edit
            </Typography>
          </Button>
        </Grid>
      </Box>
    </Grid>
  );
}
