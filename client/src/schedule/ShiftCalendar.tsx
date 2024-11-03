import { Box, Card, Chip, Grid2 as Grid, Typography } from "@mui/material";
import { useMemo } from "react";
import dayjs from "dayjs";

export interface ShiftCalendarProps {
  shifts: ShiftDetails[];
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  onClickShift: (shiftId: string) => void;
  selectedShifts: string[];
}

export function ShiftCalendar(props: ShiftCalendarProps) {
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

export interface ShiftDetails {
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
          : theme => theme.palette.error.veryLight,
        // eventually, I want functionality to change the color of the card based on the status of the shift:
        // highlighted: blue, seleted: primary.light, signed up: secondary.veryLight, default: error.veryLight
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
