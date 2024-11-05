import {
  Button,
  Grid2 as Grid,
  Typography,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
//import Navbar from "@/Navbar";
//import Home from "./Home";
import React, { useState } from "react";
import { ModalContext } from "@/Navbar";
import { useEmployeeActions } from "@/hooks/useEmployeeActions";

interface JoinTreeProps {
  joinType: "ShiftTree" | "Organization";
  refetchAllSchedules: () => void;
}

export default function JoinTree({
  joinType,
  refetchAllSchedules,
}: JoinTreeProps) {
  const [joinCode, setJoinCode] = useState("");
  const MC = React.useContext(ModalContext);
  const empActions = useEmployeeActions();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJoinCode(event.target.value);
  };

  const handleButtonClick = async () => {
    console.log(joinCode);
    empActions
      .join({ shiftTreeId: joinCode })
      .then(() => {
        refetchAllSchedules();
        MC.setModalOpen(false);
      })
      .catch(e => {
        console.log(e.response.status);
      });
  };

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
              value={joinCode}
              onChange={handleInputChange}
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
              onClick={handleButtonClick}
            >
              <Typography sx={{ color: "black" }}>Join</Typography>
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
