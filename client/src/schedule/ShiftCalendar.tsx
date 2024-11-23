import {
  type Theme,
  type SxProps,
  Box,
  Card,
  Chip,
  Divider,
  Grid2 as Grid,
  Typography,
  Tooltip,
} from "@mui/material";
import React, { useMemo } from "react";
import dayjs from "dayjs";

export interface ShiftCalendarProps {
  shifts: ShiftDetails[];
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  onClickShift: (shiftId: string) => void;
  selectedShifts: string[];
  /** Mapping from shiftId to the color */
  colorMap?: Record<string, BackgroundColorType> | undefined;
  CustomContent?: CustomContentComponent | undefined;
}

export type CustomContentComponent = React.FC<{ shiftIds: string[] }>;

export type ShiftColorMap = NonNullable<ShiftCalendarProps["colorMap"]>;

export function ShiftCalendar(props: ShiftCalendarProps) {
  // Start date is the Sunday of the week that contains the start date
  const weekStartDates = useMemo(() => {
    // Prevent infinite loop from invalid input dates
    if (props.startDate.isAfter(props.endDate)) {
      console.error(
        "Start date is after end date",
        props.startDate,
        props.endDate,
      );
      return [];
    }

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
                colorMap={props.colorMap ?? {}}
                CustomContent={props.CustomContent ?? (() => null)}
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
  colorMap: Record<string, BackgroundColorType>;
  CustomContent: CustomContentComponent;
}

function WeekRow(props: WeekRowProps) {
  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => props.startDate.add(i, "day")),
    [props.startDate],
  );

  const stackedShifts = useMemo(() => {
    const shifts = new Map<string, ShiftDetails[]>();
    for (const shift of props.shifts) {
      const key = `${shift.startTime.format("YYYYMMDDHHmm")}${shift.endTime.format("YYYYMMDDHHmm")}`;
      if (!shifts.has(key)) {
        shifts.set(key, []);
      }
      shifts.get(key)?.push(shift);
    }
    return Array.from(shifts.values()).map(shifts => {
      const [first, ...rest] = shifts;
      return {
        ...first,
        count: shifts.length,
        rest,
      };
    });
  }, [props.shifts]);

  const shiftsByDayOfWeek = useMemo(() => {
    const shifts: { date: dayjs.Dayjs; shifts: StackedShiftDetails[] }[] = [];
    for (const day of days) {
      const selectedShifts = stackedShifts.filter(shift =>
        shift.startTime.isSame(day, "day"),
      );
      selectedShifts.sort((a, b) => a.startTime.unix() - b.startTime.unix());
      shifts.push({ date: day, shifts: selectedShifts });
    }
    return shifts;
  }, [days, stackedShifts]);

  return (
    <Grid container columns={{ xs: 1, md: 7 }} sx={{ flexGrow: 1 }}>
      {shiftsByDayOfWeek.map(({ date, shifts }, i) => (
        <Grid
          key={date.toISOString()}
          size={1}
          sx={theme => ({
            padding: 0.5,
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
                  borderBottom: "3px solid",
                  borderColor: theme =>
                    dayjs().isSame(date, "day")
                      ? theme.palette.primary.main
                      : "transparent",
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
                colorMap={props.colorMap}
                Custom={() => (
                  <props.CustomContent
                    shiftIds={[shift.id, ...shift.rest.map(s => s.id)]}
                  />
                )}
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

interface StackedShiftDetails extends ShiftDetails {
  count: number;
  rest: ShiftDetails[];
}

interface ShiftCardProps extends ShiftDetails {
  onClick: () => void;
  selected: boolean;
  colorMap: Record<string, BackgroundColorType>;
  Custom: React.FC;
  count: number;
}

type BackgroundColorType = Extract<
  SxProps<Theme>,
  { backgroundColor?: any }
>["backgroundColor"];

function ShiftCard({ Custom, ...props }: ShiftCardProps) {
  return (
    <Card
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: 0.75,
        gap: 1,
        ":hover": {
          cursor: "pointer",
        },
        backgroundColor: props.selected
          ? theme => theme.palette.secondary.light2
          : (props.colorMap[props.id] ??
            (theme => theme.palette.primary.light)),
        // NOTE: colorMap gets priority over default color, but selection color overrides colorMap.
        // This enables the following:
        // eventually, I want functionality to change the color of the card based on the status of the shift:
        // highlighted: blue, seleted: primary.light, signed up: secondary.veryLight, default: error.veryLight
      }}
      elevation={props.selected ? 4 : 1}
      onClick={props.onClick}
    >
      <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
        {props.name}
      </Typography>
      {props.count > 1 && (
        <Tooltip title={`This shift has ${props.count} spots.`}>
          <Chip
            sx={{
              position: "absolute",
              right: "4px",
              top: "4px",
              color: "white",
              fontWeight: "bold",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
            label={props.count}
            size="small"
          />
        </Tooltip>
      )}
      <Typography sx={{ fontSize: "0.75rem" }}>
        {props.startTime.format("HH:mm")}
        <Divider
          variant="middle"
          sx={{
            margin: "4px 0",
            borderColor: theme => theme.palette.info.dark,
            borderWidth: 1.25,
          }}
        />
        {props.endTime.isSame(props.startTime, "day") ? (
          props.endTime.format("HH:mm")
        ) : (
          <>
            {props.endTime.format("HH:mm")}{" "}
            <strong>{`(${props.endTime.format("ddd MMM DD")})`}</strong>
          </>
        )}
      </Typography>
      <Custom />
    </Card>
  );
}
