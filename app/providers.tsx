"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { WagmiProvider } from "wagmi";

import { config } from "./lib/wagmi";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();

    return browserQueryClient;
  }
}

export function Providers(props: React.PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {props.children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!bg-purple-900 !text-white",
            duration: 2000,
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
