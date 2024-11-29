import { useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import { useApi } from "@/client";

export interface ShiftDetails {
  id: string;
  name: string;
  description: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
}

export default function useSchedule({ scheduleId }: { scheduleId: string }) {
  const api = useApi();

  const { data: scheduleData, refetch: refetchSchedule } = api.useQuery(
    "get",
    "/schedules/{scheduleId}",
    { params: { path: { scheduleId: scheduleId } } },
  );

  const startTime = useMemo(
    () => (scheduleData?.startTime ? dayjs(scheduleData.startTime) : dayjs()),
    [scheduleData?.startTime],
  );

  const endTime = useMemo(
    () => (scheduleData?.endTime ? dayjs(scheduleData.endTime) : dayjs()),
    [scheduleData?.endTime],
  );

  const { data: shiftsData, refetch: refetchShifts } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/shifts",
    {
      params: { path: { scheduleId: scheduleId } },
    },
  );

  const { refetch: refetchAssignmentsCsv } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/csv",
    {
      params: {
        path: { scheduleId: scheduleId },
        query: { type: "assignments", tz: dayjs.tz.guess() },
      },
    },
    { enabled: false },
  );

  const { refetch: refetchICS } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/ics",
    {
      params: {
        path: { scheduleId: scheduleId },
        query: { tz: dayjs.tz.guess() },
      },
    },
  );

  const { refetch: refetchLogData } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/logData",
    {
      params: {
        path: { scheduleId: scheduleId },
      },
    },
  );

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
          }) satisfies ShiftDetails,
      ) ?? [],
    [shiftsData],
  );

  const { mutateAsync: postShift } = api.useMutation(
    "post",
    "/schedules/{scheduleId}/shifts",
    {
      onSuccess: async () => {
        await refetchShifts();
        await refetchSchedule();
      },
    },
  );

  const { mutateAsync: sendDelete } = api.useMutation(
    "delete",
    "/shifts/{shiftId}",
    {
      onSuccess: async () => {
        await refetchShifts();
        await refetchSchedule();
      },
    },
  );

  const { mutateAsync: sendUpdateShift } = api.useMutation(
    "put",
    "/shifts/{shiftId}",
    {
      onSuccess: async () => {
        await refetchShifts();
        await refetchSchedule();
      },
    },
  );

  const { mutateAsync: sendDeleteSchedule } = api.useMutation(
    "delete",
    "/schedules/{scheduleId}",
  );

  async function createShift(shift: Omit<ShiftDetails, "id">) {
    const { id } = await postShift({
      params: { path: { scheduleId: scheduleId } },
      body: {
        name: shift.name,
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
      },
    });
    return { id };
  }

  async function deleteShift({ shiftId }: { shiftId: string }) {
    await sendDelete({ params: { path: { shiftId } } });
  }

  async function updateShift(shift: Partial<ShiftDetails> & { id: string }) {
    await sendUpdateShift({
      params: { path: { shiftId: shift.id } },
      body: {
        name: shift.name,
        description: shift.description,
        startTime: shift.startTime?.toISOString(),
        endTime: shift.endTime?.toISOString(),
      },
    });
  }

  async function getAssignmentsCsv() {
    const res = await refetchAssignmentsCsv({ throwOnError: true });
    return res.data?.csv ?? "";
  }
  // Trying to follow the Csv model, confused as to how ID is getting passed...
  async function getICS() {
    const res = await refetchICS();
    return res.data?.ics ?? "";
  }
  async function getLogData() {
    const res = await refetchLogData();
    return res.data?.logData ?? "";
  }

  function useShift({ shiftId }: { shiftId: string }) {
    const data = useMemo(() => shifts.find(s => s.id === shiftId), [shiftId]);

    async function delete_() {
      await deleteShift({ shiftId });
    }

    async function update(shift: Omit<Partial<ShiftDetails>, "id">) {
      await updateShift({ ...shift, id: shiftId });
    }

    return { data, delete_, update };
  }

  async function deleteSchedule() {
    await sendDeleteSchedule({ params: { path: { scheduleId } } });
  }

  return {
    name: scheduleData?.name,
    description: scheduleData?.description,
    data: scheduleData,
    startTime,
    endTime,
    shifts,
    createShift,
    useShift,
    deleteShift,
    updateShift,
    deleteSchedule,
    getAssignmentsCsv,
    getICS,
    getLogData,
  };
}
