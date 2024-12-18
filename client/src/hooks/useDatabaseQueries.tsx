import { useApi } from "@/client";

export function useDatabaseQueries(date?: string) {
  const api = useApi();

  const { data: scheduleData, refetch: refetchAllSchedules } = api.useQuery(
    "get",
    "/schedules",
    {
      params: {
        query: {
          date: date ? date : undefined,
        },
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  );

  const schedules = scheduleData;

  return { schedules, refetchAllSchedules };
}
