import {
  //Button,
  Grid2 as Grid,
  Typography,
  Paper,
  Divider,
} from "@mui/material";

export default function Org_display() {
  return (
    <Grid>
      <Grid container color="primary" sx={{ pt: 1, pb: 1 }}>
        <Grid size={6}>
          <Typography
            sx={{ marginLeft: 1, pt: 0.5, pb: 0.5, textAlign: "center" }}
            color={"black"}
            variant="h6"
          >
            Organizations
          </Typography>
        </Grid>
      </Grid>
      <Divider variant="middle" />
      <Paper
        sx={{
          margin: 2, // Set margin on all sides
          flexGrow: 1,
          height: "calc(100% - 100px)", // Adjust height based on spacing needs
        }}
      >
        <Typography sx={{ padding: 2 }}> Sample Organization</Typography>
      </Paper>
    </Grid>
  );
}
