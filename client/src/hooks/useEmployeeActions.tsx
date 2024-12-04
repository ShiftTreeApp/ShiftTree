import { useApi } from "@/client";
import { useShifts } from "@/hooks/useShifts";
import { useNotifier } from "@/notifier";

export function useEmployeeActions(shiftTreeId?: string) {
  const api = useApi();
  const notifier = useNotifier();

  const { refetch: refetchSchedules } = api.useQuery("get", "/schedules");

  const { mutateAsync: joinShiftTree } = api.useMutation(
    "put",
    "/joinShiftTree",
  );
  const { mutateAsync: signupForShift } = api.useMutation(
    "post",
    "/signups/{shiftId}",
  );
  const { mutateAsync: removeUser } = api.useMutation(
    "delete",
    "/removeUser/{scheduleID}",
    {
      onSuccess: () => {
        refetchSchedules();
      },
      onError: notifier.error,
    },
  );
  const { mutateAsync: unregisterFromShift } = api.useMutation(
    "delete",
    "/signups/{shiftId}",
    {
      onSuccess: async () => {
        await refetchUserSignups();
      },
      onError: notifier.error,
    },
  );

  /*
   * Changed structure to separately build functions and return them
   * rather than creating them within the return statement
   */
  async function join({ joinCode }: { joinCode: string }): Promise<void> {
    await joinShiftTree({
      params: {
        query: {
          JoinCode: joinCode,
        },
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    console.log("Joined");
  }

  async function signupForSingle({
    shiftId,
    userId,
    weight,
  }: {
    shiftId: string;
    userId?: string;
    weight?: number;
  }): Promise<void> {
    await signupForShift({
      params: {
        path: {
          shiftId: shiftId,
        },
      },
      body: {
        userId: userId || "none", //this needs to probably change, will fail if no userId provided but i guess thats fine maybe?
        weight: weight || 1,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    console.log("Signed up for shift");
  }

  const shifts = useShifts(shiftTreeId ?? "");

  async function signup({
    shiftId,
    weight,
  }: {
    shiftId: string;
    weight?: number;
  }) {
    await Promise.all(
      shifts.matchingShifts(shiftId).map(async shift => {
        await signupForSingle({
          shiftId: shift.id,
          weight,
        });
      }),
    );
  }

  /*
   * Take shiftTreeId and scan the shifts in that schedule.
   * Return a list of the shifts that the current user signed up for
   * from that list.
   */
  const { data: userSignups = [], refetch: refetchUserSignups } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/user-signups",
    {
      params: {
        path: {
          scheduleId: shiftTreeId ?? "",
        },
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  );

  /*
   * Take shiftTreeId and scan the shifts in that schedule.
   * Return a list of the shifts that the current user is assigned to
   * from that list.
   */
  const { data: userAssignedShifts = [], refetch: refetchUserAssignments } =
    api.useQuery("get", "/schedules/{scheduleId}/user-assigned", {
      params: {
        path: {
          scheduleId: shiftTreeId ?? "",
        },
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

  const { data: allAssignments } = api.useQuery(
    "get",
    "/schedules/{scheduleId}/assignments",
    { params: { path: { scheduleId: shiftTreeId ?? "" } } },
  );

  async function leaveSchedule({ scheduleId }: { scheduleId: string }) {
    await removeUser({ params: { path: { scheduleID: scheduleId } } });
  }

  async function unregister({ shiftId }: { shiftId: string }) {
    await Promise.all(
      shifts.matchingShifts(shiftId).map(async shift => {
        await unregisterFromShift({
          params: { path: { shiftId: shift.id } },
        });
      }),
    );
  }

  const signedUpShifts = userSignups;
  const assignedShifts = userAssignedShifts;

  return {
    join,
    signup,
    leaveSchedule,
    refetchUserSignups,
    refetchUserAssignments,
    signedUpShifts,
    assignedShifts,
    unregister,
    allAssignments,
  };
}
