/* eslint-disable react-refresh/only-export-components */
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import { createContext, useContext } from "react";

import { type paths } from "@/generated/v1";

const fetchClient = createFetchClient<paths>({
  // TODO: Change later
  baseUrl: "http://localhost:3000/",
});

export const api = createClient(fetchClient);

export type Api = typeof api;

// More info: https://www.npmjs.com/package/openapi-react-query#usage

const ApiContext = createContext(api);

interface ApiProviderProps {
  api: Api;
  children: React.ReactNode;
}

export function ApiProvider(props0: Partial<ApiProviderProps>) {
  const props = { ...props0, api };
  return (
    <ApiContext.Provider value={props.api}>
      {props.children}
    </ApiContext.Provider>
  );
}

export function useApi(): Api {
  return useContext(ApiContext);
}
