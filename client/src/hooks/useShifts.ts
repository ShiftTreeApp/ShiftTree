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
      shiftsData?.map(shift => ({
        id: shift.id,
        name: shift.name,
        description: shift.description,
        startTime: dayjs(shift.startTime),
        endTime: dayjs(shift.endTime),
      })) ?? [],
    [shiftsData],
  );

  const groupedShifts = useMemo(() => {
    const groupedShifts: Record<string, Omit<ShiftDetails, "count">[]> = {};
    shifts.forEach(shift => {
      const key = `${shift.startTime.format("YYYYMMDDHHss")}${shift.endTime.format("YYYYMMDDHHss")}`;
      if (!groupedShifts[key]) {
        groupedShifts[key] = [];
      }
      groupedShifts[key].push(shift);
    });
    return groupedShifts;
  }, [shifts]);

  const stackedShifts = useMemo(() => {
    return Object.values(groupedShifts).map(shifts => {
      const shift = shifts[0];
      return { ...shift, count: shifts.length } satisfies ShiftDetails;
    });
  }, [groupedShifts]);

  function matchingShifts(id: string) {
    const shift = shifts.find(shift => shift.id === id);
    if (!shift) {
      return [];
    }
    const key = `${shift.startTime.format("YYYYMMDDHHss")}${shift.endTime.format("YYYYMMDDHHss")}`;
    return groupedShifts[key] ?? [];
  }

  return { refetch, shifts, stackedShifts, matchingShifts };
}
