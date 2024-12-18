import { useMemo } from "react";

import { useApi } from "@/client";
import dayjs from "dayjs";

export interface ShiftDetails {
  id: string;
  name: string;
  description: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  count: number;
}

export function useShifts(scheduleId: string) {
  const api = useApi();

  const { data: shiftsData, refetch: refetchShifts } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/shifts",
    {
      params: { path: { scheduleId: scheduleId } },
    },
  );

  async function refetch() {
    await refetchShifts();
  }

  const shifts = useMemo(
    () =>
      shiftsData?.map(
        shift =>
          ({
            id: shift.id,
            name: shift.name,
            description: shift.description,
            startTime: dayjs(shift.startTime),
            endTime: dayjs(shift.endTime),
            count: shift.numSlots,
          }) satisfies ShiftDetails,
      ) ?? [],
    [shiftsData],
  );

  return { refetch, shifts };
}
