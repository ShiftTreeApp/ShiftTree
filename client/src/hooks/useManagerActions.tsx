import { useApi } from "@/client";

export function useManagerActions(shiftTreeId: string) {
  const api = useApi();

  const { mutateAsync: generateCode } = api.useMutation(
    "get",
    "/shiftTreeCodeGenerate",
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

  const existingCode = data?.code;

  return { generate, existingCode };
}
