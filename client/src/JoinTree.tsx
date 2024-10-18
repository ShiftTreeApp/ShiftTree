import {
  Button,
  Grid2 as Grid,
  Typography,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import { amber, } from "@mui/material/colors";
import Navbar from "@/Navbar";
//import Home from "./Home";

export default function JoinTree() {
  return (
    <Grid container>
      <Grid size={12} sx={{pb: 2}}>
        <Navbar />
      </Grid>
      <Grid 
        container
        size={12}
        justifyContent="center"
        alignItems="center"
      >
        <Card>
          <CardContent>
            <TextField id="outlined-basic" label="Enter Join Code" variant="outlined" fullWidth/>
            <Button
              fullWidth
              sx={{
                backgroundColor: amber[500],
                marginTop: 2, // Spacing between TextField and Button
                padding: "8px 16px", // Padding inside the button
                "&:hover": { backgroundColor: amber[700],
                },
              }}
              //onClick={}
              >
                <Typography sx={{ color: "black" }}>Join</Typography>
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
