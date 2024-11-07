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

  return { join, signup };
}
