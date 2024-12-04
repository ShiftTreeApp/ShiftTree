import { useApi } from "@/client";

export function useManagerActions(shiftTreeId: string) {
  const api = useApi();

  const { mutateAsync: generateCode } = api.useMutation(
    "get",
    "/shiftTreeCodeGenerate",
  );
  const { mutateAsync: autoSchedule } = api.useMutation(
    "post",
    "/autoschedule/{scheduleId}",
    {
      onSuccess: async () => {
        await refetchAssignments();
      },
    },
  );
  const { mutateAsync: updateRecommendedShifts } = api.useMutation(
    "post",
    "/schedules/{scheduleId}/recommended-shifts",
  );
  const { refetch: refetchAssignments } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/assignments",
    { params: { path: { scheduleId: shiftTreeId } } },
  );
  /*
   * Takes in a shiftTreeId and generates a new code
   * Function returns the code to be used after generating
   */
  async function generate({
    shiftTreeId,
  }: {
    shiftTreeId: string;
  }): Promise<string | undefined> {
    const { code } = await generateCode({
      params: {
        query: {
          ShiftTreeID: shiftTreeId,
        },
      },
      // TODO: Use this/replace this with manager authentication
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return code;
  }

  //Untested query for scheduling
  async function triggerAutoSchedule({
    scheduleId,
  }: {
    scheduleId: string;
  }): Promise<void> {
    await autoSchedule({
      params: {
        path: {
          scheduleId: scheduleId,
        },
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    console.log("Autoscheduling triggered");
  }
  const { data } = api.useQuery("get", "/shiftTreeCodeExisting", {
    params: {
      query: {
        ShiftTreeID: shiftTreeId,
      },
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  async function updateRecommendedNumShifts({
    scheduleId,
    targetUserId,
    numShifts,
  }: {
    scheduleId: string;
    targetUserId: string;
    numShifts: number;
  }): Promise<void> {
    await updateRecommendedShifts({
      params: {
        path: {
          scheduleId: scheduleId,
        },
      },
      body: {
        userId: targetUserId,
        recommendedNumShifts: numShifts,
      },
    });
  }

  const existingCode = data?.code;

  return {
    generate,
    existingCode,
    triggerAutoSchedule,
    updateRecommendedNumShifts,
  };
}
