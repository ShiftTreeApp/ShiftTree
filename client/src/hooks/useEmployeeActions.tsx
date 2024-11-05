import { useApi } from "@/client";
import { useAuth } from "@/auth";

export function useEmployeeActions() {
  const api = useApi();
  const auth = useAuth();

  const { mutateAsync: joinShiftTree } = api.useMutation(
    "put",
    "/joinShiftTree",
  );

  return {
    async join({ shiftTreeId }: { shiftTreeId: string }): Promise<void> {
      await joinShiftTree({
        params: {
          query: {
            ShiftTreeID: shiftTreeId,
          },
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      console.log("Joined");
    },
  };
}

export function useSignupActions() {
  const api = useApi();

  const { mutateAsync: signupForShift } = api.useMutation(
    "post",
    "/signups/{shiftId}",
  );

  return {
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
