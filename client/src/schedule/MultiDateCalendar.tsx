import { Box } from "@mui/material";
import {
  DateCalendar,
  LocalizationProvider,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useMemo } from "react";

export interface MultiDateCalendarProps {
  selectedDates?: dayjs.Dayjs[];
  onSelectedDatesChange?: (dates: dayjs.Dayjs[]) => void;
}

export default function MultiDateCalendar(props: MultiDateCalendarProps) {
  function selectDate(date: dayjs.Dayjs) {
    props.onSelectedDatesChange?.(
      props.selectedDates?.some(d => d.isSame(date, "day"))
        ? (props.selectedDates?.filter(d => !d.isSame(date, "day")) ?? [])
        : [...(props.selectedDates ?? []), date],
    );
  }

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={undefined}
          onChange={selectDate}
          slots={{
            day: CustomDay,
          }}
          slotProps={{
            day: {
              highlightedDays: props.selectedDates,
            } as any,
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}

function CustomDay(
  props: PickersDayProps<dayjs.Dayjs> & { highlightedDays?: dayjs.Dayjs[] },
) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected = useMemo(
    () => highlightedDays.some(d => d.isSame(day, "day")),
    [day, highlightedDays],
  );

  return (
    <PickersDay
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      selected={isSelected}
    />
  );
}
