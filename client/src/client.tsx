/* eslint-disable react-refresh/only-export-components */
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext } from "react";

import { type paths } from "@/generated/v1";

function createApi({ onError }: { onError: (message: string) => void }) {
  const fetchClient = createFetchClient<paths>({
    baseUrl:
      import.meta.env.VITE_SHIFTTREE_BASE_URL ?? "http://localhost:3000/",
  });

  fetchClient.use({
    onRequest: ({ request }) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
    },
  });

  fetchClient.use({
    onResponse: ({ response }) => {
      if (!response.ok) {
        onError(response.statusText);
      }
    },
  });

  const api = createClient(fetchClient);
  return api;
}
export type Api = ReturnType<typeof createApi>;

// More info: https://www.npmjs.com/package/openapi-react-query#usage

const ApiContext = createContext<Api | null>(null);

interface ApiProviderProps {
  api: Api;
  children: React.ReactNode;
}

export function ApiProvider(props0: Partial<ApiProviderProps>) {
  const props = { ...props0, api: createApi({ onError: () => {} }) };
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ApiContext.Provider value={props.api}>
        {props.children}
      </ApiContext.Provider>
    </QueryClientProvider>
  );
}

export function useApi(): Api {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error("useApi must be used within a ApiProvider");
  }
  return api;
}
