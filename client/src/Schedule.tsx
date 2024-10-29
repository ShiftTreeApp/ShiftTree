import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";
import { Box, Card, Container, Grid2 as Grid, Typography } from "@mui/material";
import { useMemo } from "react";

export default function Schedule() {
  return (
    <Grid container direction="column" spacing={1}>
      <Navbar />
      <NavbarPadding />
      <Container
        component="main"
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <WeekRow
          onClickShift={shiftId => console.log(shiftId)}
          startDate={new Date("2024-10-27, 8:00")}
          shifts={[
            {
              id: "1",
              name: "Shift 1",
              startTime: new Date("2024-10-27, 8:00"),
              endTime: new Date("2024-10-27, 12:00"),
            },
            {
              id: "2",
              name: "Shift 2",
              startTime: new Date("2024-10-27, 13:00"),
              endTime: new Date("2024-10-27, 17:00"),
            },
            {
              id: "3",
              name: "Shift 3",
              startTime: new Date("2024-10-28, 18:00"),
              endTime: new Date("2024-10-28, 22:00"),
            },
            {
              id: "4",
              name: "Shift 4",
              startTime: new Date("2024-10-28, 23:00"),
              endTime: new Date("2024-10-29, 3:00"),
            },
          ]}
        />
      </Container>
    </Grid>
  );
}

interface WeekRowProps {
  shifts: Omit<ShiftCardProps, "onClick">[];
  startDate: Date;
  onClickShift: (shiftId: string) => void;
}

function WeekRow(props: WeekRowProps) {
  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(props.startDate);
        date.setDate(date.getDate() + i);
        return date;
      }),
    [props.startDate],
  );

  const shiftsByDayOfWeek = useMemo(() => {
    const shifts: { date: Date; shifts: Omit<ShiftCardProps, "onClick">[] }[] =
      [];
    for (const day of days) {
      const selectedShifts = props.shifts.filter(
        shift =>
          shift.startTime.getFullYear() === day.getFullYear() &&
          shift.startTime.getMonth() === day.getMonth() &&
          shift.startTime.getDate() === day.getDate(),
      );
      selectedShifts.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
      );
      shifts.push({ date: day, shifts: selectedShifts });
    }
    return shifts;
  }, [days, props.shifts]);

  return (
    <Grid container columns={7} sx={{ flexGrow: 1 }}>
      {shiftsByDayOfWeek.map(({ date, shifts }, i) => (
        <Grid
          key={date.toISOString()}
          size={1}
          sx={{
            paddingLeft: theme => theme.spacing(1),
            paddingRight: theme => theme.spacing(1),
            borderLeft: "1px solid",
            borderRight: i == 6 ? "1px solid" : "none",
            borderColor: theme => theme.palette.divider,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: theme => theme.spacing(0.5),
            }}
          >
            <Typography>{date.getDate()}</Typography>
            {shifts.map(shift => (
              <ShiftCard
                key={shift.id}
                {...shift}
                onClick={() => props.onClickShift(shift.id)}
              />
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

function formatTime(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

interface ShiftCardProps {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  onClick: () => void;
}

function ShiftCard(props: ShiftCardProps) {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: theme => theme.spacing(1),
        gap: theme => theme.spacing(1),
        ":hover": {
          cursor: "pointer",
        },
      }}
      onClick={props.onClick}
    >
      <Typography variant="h6">{props.name}</Typography>
      <Typography>
        {formatTime(props.startTime)}
        {" - "}
        {formatTime(props.endTime)}
      </Typography>
    </Card>
  );
}
