import {
  Button,
  Grid2 as Grid,
  Typography,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import { amber } from "@mui/material/colors";
//import Navbar from "@/Navbar";
//import Home from "./Home";

interface JoinTreeProps {
  joinType: "ShiftTree" | "Organization";
}

export default function JoinTree({ joinType }: JoinTreeProps) {
  return (
    <Grid container>
      {/* <Grid size={12} sx={{pb: 2}}>
        <Navbar />
      </Grid> */}
      <Grid container size={12} justifyContent="center" alignItems="center">
        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              Join {joinType}
            </Typography>
            <TextField
              id="outlined-basic"
              label="Enter Join Code"
              variant="outlined"
              fullWidth
            />
            <Button
              fullWidth
              sx={{
                backgroundColor: theme => theme.palette.secondary.main,
                marginTop: 2, // Spacing between TextField and Button
                padding: "8px 16px", // Padding inside the button
                "&:hover": {
                  backgroundColor: theme => theme.palette.secondary.dark,
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
