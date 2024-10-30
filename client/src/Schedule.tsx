import {
  Box,
  Card,
  Chip,
  Container,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import dayjs from "dayjs";

import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";

export default function Schedule() {
  return (
    <Grid container direction="column" spacing={1}>
      <Navbar />
      <NavbarPadding />
      <Container
        component="main"
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <ShiftCalendar
          onClickShift={shiftId => console.log(shiftId)}
          startDate={new Date("2024-10-27, 8:00")}
          endDate={new Date("2024-11-20, 3:00")}
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
            {
              id: "4",
              name: "Shift 4",
              startTime: new Date("2024-10-31, 23:00"),
              endTime: new Date("2024-10-31, 3:00"),
            },
          ]}
        />
      </Container>
    </Grid>
  );
}

type ShiftDetails = Omit<ShiftCardProps, "onClick">;

interface ShiftCalendarProps {
  shifts: ShiftDetails[];
  startDate: Date;
  endDate: Date;
  onClickShift: (shiftId: string) => void;
}

function ShiftCalendar(props: ShiftCalendarProps) {
  // Start date is the Sunday of the week that contains the start date
  const startDate = useMemo(() => {
    const date = new Date(props.startDate);
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }, [props.startDate]);

  const weekStartDates = useMemo(() => {
    const dates = [new Date(startDate)];
    let last = new Date(startDate);
    while (last < props.endDate) {
      last = new Date(last);
      last.setDate(last.getDate() + 7);
      dates.push(new Date(last));
    }
    dates.length -= 1;
    return dates;
  }, [props.endDate, startDate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={theme => ({
          paddingLeft: 10,
          [theme.breakpoints.down("md")]: { display: "none" },
        })}
      >
        <DaysOfWeek />
      </Box>
      <Box
        sx={theme => ({
          display: "flex",
          flexDirection: "column",
          [theme.breakpoints.down("md")]: {
            gap: 1,
          },
        })}
      >
        {weekStartDates.map((date, i) => (
          <Box
            key={date.toISOString()}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1,
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <Box
              sx={theme => ({
                [theme.breakpoints.up("md")]: {
                  width: theme => theme.spacing(10),
                  minWidth: theme => theme.spacing(10),
                },
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                alignItems: "center",
                gap: 1,
              })}
            >
              <Chip
                label={dayjs(date).format("MMM")}
                color="primary"
                sx={theme => ({
                  [theme.breakpoints.down("md")]: { display: "none" },
                })}
              />
              <Chip
                label={`${dayjs(date).format("MMM DD")} - ${dayjs(date).add(6, "days").format("MMM DD")}`}
                color="primary"
                sx={theme => ({
                  [theme.breakpoints.up("md")]: { display: "none" },
                })}
              />
            </Box>
            <Box
              sx={{
                borderTop: i === 0 ? "1px solid" : "none",
                borderBottom: "1px solid",
                borderColor: theme => theme.palette.divider,
                display: "flex",
                flexDirection: "row",
                flexGrow: 1,
                gap: 0.5,
              }}
            >
              <WeekRow
                startDate={date}
                shifts={props.shifts}
                onClickShift={props.onClickShift}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function DaysOfWeek() {
  function DayLabel(props: { name: string }) {
    return (
      <Grid
        size={1}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <strong>{props.name}</strong>
      </Grid>
    );
  }

  return (
    <Grid container columns={7} sx={{ padding: 1 }}>
      <DayLabel name="Sun" />
      <DayLabel name="Mon" />
      <DayLabel name="Tue" />
      <DayLabel name="Wed" />
      <DayLabel name="Thu" />
      <DayLabel name="Fri" />
      <DayLabel name="Sat" />
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
    <Grid container columns={{ xs: 1, md: 7 }} sx={{ flexGrow: 1 }}>
      {shiftsByDayOfWeek.map(({ date, shifts }, i) => (
        <Grid
          key={date.toISOString()}
          size={1}
          sx={theme => ({
            padding: 1.5,
            paddingTop: 0.5,
            [theme.breakpoints.up("md")]: {
              borderLeft: "1px solid",
              borderRight: i == 6 ? "1px solid" : "none",
              borderColor: theme => theme.palette.divider,
            },
          })}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box sx={{ display: "inline-flex", gap: 1 }}>
              {date.getDate() === 1 && (
                <Typography>{dayjs(date).format("MMM DD")}</Typography>
              )}
              {date.getDate() !== 1 && (
                <Typography>{dayjs(date).format("DD")}</Typography>
              )}
              <Typography sx={{ display: { md: "none" } }}>
                {`(${dayjs(date).format("ddd")})`}
              </Typography>
            </Box>
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
