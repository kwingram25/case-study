import { twMerge } from "tailwind-merge";

export function classes(...classLists: (string | null | undefined | false)[]) {
  return twMerge(
    ...classLists.map((classList) => (!classList ? null : classList))
  );
}

export * from "./abi";
export * from "./gql";
export * from "./useIsConnected";
export * from "./wagmi";
