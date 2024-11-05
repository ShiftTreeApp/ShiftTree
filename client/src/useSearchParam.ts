import { useSearchParams } from "react-router-dom";

interface UseSearchParamOptions<T> {
  default: T;
}

export function useSearchParam<T extends string>(
  name: string,
  options?: Partial<UseSearchParamOptions<T>> | undefined,
): readonly [T | null, (value: T | null) => void] {
  const [params, setParams] = useSearchParams();

  const param = params.get(name) ?? options?.default ?? null;

  function setParam(newValue: T | null) {
    if (newValue === null) {
      setParams(prev => {
        prev.delete(name);
        return prev;
      });
    } else {
      setParams(prev => {
        prev.set(name, newValue);
        return prev;
      });
    }
  }

  return [param as T | null, setParam] as const;
}
