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

  const schedules = scheduleData;

  return { schedules, refetchAllSchedules };
}
