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
    async join({
      shiftTreeId,
    }: {
      shiftTreeId: string;
      userId: string;
    }): Promise<void> {
      await joinShiftTree({
        params: {
          query: {
            ShiftTreeID: shiftTreeId,
            //UserID: userId, [Currently not needed]
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
