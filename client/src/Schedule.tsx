import {
  Box,
  Card,
  Chip,
  Container,
  Drawer,
  Grid2 as Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";

function useSelectedShiftParam() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedShift = searchParams.get("shift");
  function setSelectedShift(shiftId: string) {
    setSearchParams(prev => {
      prev.set("shift", shiftId);
      return prev;
    });
  }
  function clearSelectedShift() {
    setSearchParams(prev => {
      prev.delete("shift");
      return prev;
    });
  }

  return { selectedShift, setSelectedShift, clearSelectedShift };
}

export default function Schedule() {
  const { selectedShift, setSelectedShift, clearSelectedShift } =
    useSelectedShiftParam();

  const drawerOpen = selectedShift !== null;

  return (
    <Grid container direction="column" spacing={1}>
      <Navbar />
      <NavbarPadding />
      <Drawer
        open={drawerOpen}
        onClose={clearSelectedShift}
        anchor="right"
        sx={theme => ({
          ".MuiDrawer-paper": {
            [theme.breakpoints.down("md")]: {
              width: "100%",
            },
          },
        })}
      >
        <NavbarPadding />
        <Box
          sx={theme => ({
            [theme.breakpoints.up("md")]: {
              width: theme => theme.spacing(96),
            },
            display: "flex",
            flexDirection: "column",
            gap: 1,
            padding: 2,
          })}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">View shift</Typography>
            <IconButton onClick={clearSelectedShift}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1">Shift details</Typography>
          <Typography variant="body1">Shift id: {selectedShift}</Typography>
        </Box>
      </Drawer>
      <Container
        component="main"
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <ShiftCalendar
          onClickShift={shiftId => setSelectedShift(shiftId)}
          startDate={dayjs("2024-10-27, 8:00")}
          endDate={dayjs("2024-11-20, 3:00")}
          selectedShifts={selectedShift ? [selectedShift] : []}
          shifts={[
            {
              id: "1",
              name: "Shift 1",
              startTime: dayjs("2024-10-27, 8:00"),
              endTime: dayjs("2024-10-27, 12:00"),
            },
            {
              id: "2",
              name: "Shift 2",
              startTime: dayjs("2024-10-27, 13:00"),
              endTime: dayjs("2024-10-27, 17:00"),
            },
            {
              id: "3",
              name: "Shift 3",
              startTime: dayjs("2024-10-28, 18:00"),
              endTime: dayjs("2024-10-28, 22:00"),
            },
            {
              id: "4",
              name: "Shift 4",
              startTime: dayjs("2024-10-28, 23:00"),
              endTime: dayjs("2024-10-29, 3:00"),
            },
            {
              id: "4",
              name: "Shift 4",
              startTime: dayjs("2024-10-31, 23:00"),
              endTime: dayjs("2024-10-31, 3:00"),
            },
          ]}
        />
      </Container>
    </Grid>
  );
}

interface ShiftCalendarProps {
  shifts: ShiftDetails[];
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  onClickShift: (shiftId: string) => void;
  selectedShifts: string[];
}

function ShiftCalendar(props: ShiftCalendarProps) {
  // Start date is the Sunday of the week that contains the start date
  const weekStartDates = useMemo(() => {
    const dates: dayjs.Dayjs[] = [];
    const startDate = props.startDate.startOf("week");
    for (
      let date = startDate;
      !date.isSame(props.endDate.add(1, "week"), "week");
      date = date.add(1, "week")
    ) {
      dates.push(date);
    }
    return dates;
  }, [props.startDate, props.endDate]);

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
                label={date.format("MMM")}
                color="primary"
                sx={theme => ({
                  [theme.breakpoints.down("md")]: { display: "none" },
                })}
              />
              <Chip
                label={`${date.format("MMM DD")} - ${date.add(6, "days").format("MMM DD")}`}
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
                selectedShifts={props.selectedShifts}
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
  shifts: ShiftDetails[];
  startDate: dayjs.Dayjs;
  onClickShift: (shiftId: string) => void;
  selectedShifts: string[];
}

function WeekRow(props: WeekRowProps) {
  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => props.startDate.add(i, "day")),
    [props.startDate],
  );

  const shiftsByDayOfWeek = useMemo(() => {
    const shifts: { date: dayjs.Dayjs; shifts: ShiftDetails[] }[] = [];
    for (const day of days) {
      const selectedShifts = props.shifts.filter(shift =>
        shift.startTime.isSame(day, "day"),
      );
      selectedShifts.sort((a, b) => a.startTime.unix() - b.startTime.unix());
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
              alignItems: "stretch",
              gap: 1,
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "inline-flex",
                  gap: 1,
                  borderBottom: dayjs().isSame(date, "day")
                    ? "3px solid"
                    : "none",
                  borderColor: theme => theme.palette.primary.main,
                }}
              >
                {date.date() === 1 && (
                  <Typography>{date.format("MMM DD")}</Typography>
                )}
                {date.date() !== 1 && (
                  <Typography>{date.format("DD")}</Typography>
                )}
                <Typography sx={{ display: { md: "none" } }}>
                  {`(${date.format("ddd")})`}
                </Typography>
              </Box>
            </Box>
            {shifts.map(shift => (
              <ShiftCard
                key={shift.id}
                {...shift}
                onClick={() => props.onClickShift(shift.id)}
                selected={props.selectedShifts.includes(shift.id)}
              />
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

interface ShiftDetails {
  id: string;
  name: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
}

interface ShiftCardProps extends ShiftDetails {
  onClick: () => void;
  selected: boolean;
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
        backgroundColor: props.selected
          ? theme => theme.palette.primary.light
          : "inherit",
      }}
      elevation={props.selected ? 4 : 1}
      onClick={props.onClick}
    >
      <Typography variant="h6">{props.name}</Typography>
      <Typography>
        {props.startTime.format("HH:mm")}
        {" - "}
        {props.endTime.format("HH:mm")}
      </Typography>
    </Card>
  );
}
