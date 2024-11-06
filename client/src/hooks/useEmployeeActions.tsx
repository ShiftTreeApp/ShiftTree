import { useApi } from "@/client";

export function useEmployeeActions() {
  const api = useApi();

  const { mutateAsync: joinShiftTree } = api.useMutation(
    "put",
    "/joinShiftTree",
  );
  const { mutateAsync: signupForShift } = api.useMutation(
    "post",
    "/signups/{shiftId}",
  );

  return {
    async join({ joinCode }: { joinCode: string }): Promise<void> {
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
    },

    async signup({ shiftId }: { shiftId: string }): Promise<void> {
      await signupForShift({
        params: {
          path: {
            shiftId,
          },
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      console.log("Signed up for shift");
    },
  };
}
