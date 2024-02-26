"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useIsConnected() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { isConnected: _isConnected } = useAccount();
  useIsomorphicLayoutEffect(() => {
    setIsConnected(_isConnected);
  }, [_isConnected]);

  return isConnected;
}
