import { useApi } from "@/client";

export function useManagerActions() {
  const api = useApi();

  const { mutateAsync: generateCode } = api.useMutation(
    "get",
    "/shiftTreeCodeGenerate",
  );

  return {
    async generate({ shiftTreeId }: { shiftTreeId: string }): Promise<void> {
      const { code } = await generateCode({
        params: {
          query: {
            ShiftTreeID: shiftTreeId,
          },
        },
        /* TODO: Use this/replace this with manager authentication
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },*/
        // TODO: Do something with the code var
      });
      console.log("Invite Code Generated");
    },
  };
}
