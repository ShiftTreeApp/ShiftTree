import { useMemo } from "react";
import { useApi } from "@/client";

export function useDatabaseQueries() {
  const api = useApi();

  const { data: scheduleData, refetch: refetchAllSchedules } = api.useQuery(
    "get",
    "/schedules",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  );

  const schedules = useMemo(
    () =>
      scheduleData?.map(schedule => ({
        id: schedule.id,
        name: schedule.name,
        description: schedule.description,
        state: schedule.state,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    [scheduleData],
  );

  return { schedules, refetchAllSchedules };
}
