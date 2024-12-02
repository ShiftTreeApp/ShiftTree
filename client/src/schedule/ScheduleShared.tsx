import { useApi } from "@/client";
import EditTree from "@/schedule/EditTree";
import Schedule from "@/schedule/Schedule";
import { useParams } from "react-router";

export default function ScheduleShared() {
  const { scheduleId } = useParams();
  const isManager = useIsManager(scheduleId ?? "");

  if (isManager) {
    return <EditTree />;
  } else {
    return <Schedule />;
  }
}

export function useIsManager(scheduleId: string) {
  const api = useApi();

  const { data: scheduleData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: scheduleId as string } } },
  );

  return scheduleData?.role == "manager" || scheduleData?.role == "owner";
}
