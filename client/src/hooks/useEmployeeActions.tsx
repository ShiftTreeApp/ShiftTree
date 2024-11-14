import { useApi } from "@/client";
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

  async function signup({
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

  /*
   * Take shiftTreeId and scan the shifts in that schedule.
   * Return a list of the shifts that the current user signed up for
   * from that list.
   */
  const { data: userSignups = [], refetch: refetchUserSignups } = shiftTreeId
    ? api.useQuery("get", "/schedules/{scheduleId}/user-signups", {
        params: {
          path: {
            scheduleId: shiftTreeId ? shiftTreeId : "",
          },
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
    : { data: [], refetch: () => {} };

  /*
   * Take shiftTreeId and scan the shifts in that schedule.
   * Return a list of the shifts that the current user is assigned to
   * from that list.
   */
  const { data: userAssignedShifts = [], refetch: refetchUserAssignments } =
    shiftTreeId
      ? api.useQuery("get", "/schedules/{scheduleId}/user-assigned", {
          params: {
            path: {
              scheduleId: shiftTreeId ? shiftTreeId : "",
            },
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
      : { data: [], refetch: () => {} };

  async function leaveSchedule({ scheduleId }: { scheduleId: string }) {
    await removeUser({ params: { path: { scheduleID: scheduleId } } });
  }

  const signedUpShifts = userSignups;
  const userAssignments = userAssignedShifts;

  return {
    join,
    signup,
    leaveSchedule,
    refetchUserSignups,
    refetchUserAssignments,
    signedUpShifts,
    userAssignments,
  };
}
