"use client";

import { useQuery } from "@tanstack/react-query";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import Skeleton from "react-loading-skeleton";
import { Currency, CurrencyContext } from "../currency";
import { classes, poolAbi, getPools } from "../lib";
import { sepolia } from "viem/chains";
import dynamic from "next/dynamic";
import { Tick } from "./tick";
import { HomePageQuery } from "../gql/generated/graphql";
import { Action } from "./action";
import makeBlockie from "ethereum-blockies-base64";

const Account = dynamic(() => import("../account") as unknown as any, {
  ssr: false,
});

type HomePageState = {
  pool: HomePageQuery["pool"] | null | undefined;
  tickId: string | null;
  setTickId: React.Dispatch<React.SetStateAction<string | null>>;
  redeemables: Record<string, BigInt>;
  update: () => void;
};

export const HomePageContext = createContext<HomePageState>({
  pool: null,
  tickId: null,
  setTickId: () => {},
  redeemables: {},
  update: () => {},
});

export function Home() {
  const { data } = useQuery({ queryKey: ["pools"], queryFn: getPools });
  const { address } = useAccount();

  const balance = useBalance({
    address,
    chainId: sepolia.id,
    token: data?.pool?.currencyToken.id,
  });

  const deposits = useReadContracts<BigInt[]>({
    contracts: data!.pool!.ticks.map(({ raw }) => ({
      address: data!.pool!.id,
      abi: poolAbi,
      functionName: "deposits",
      args: [address, raw],
    })) as unknown as any,
  });

  const redeemables = useMemo<Record<string, BigInt>>(() => {
    if (deposits.data) {
      return deposits.data.reduce(
        (res: Record<string, BigInt>, elem, index) => {
          if (elem.status === "success") {
            return {
              ...res,
              [data!.pool!.ticks[index].id]: (elem.result as BigInt[])[0],
            };
          }
          return res;
        },
        {}
      );
    }

    return {};
  }, [deposits.data, data?.pool?.ticks]);

  const [tickId, setTickId] = useState<string | null>(null);
  const tick = useMemo(() => {
    if (!tickId) {
      return null;
    }

    return data?.pool?.ticks.find(({ id }) => id === tickId) || null;
  }, [tickId, data?.pool?.ticks]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="h-24 flex items-center p-4 border-b border-b-neutral-800">
        <h1 className="font-mono font-bold flex-1">MetaStreet Pools</h1>
        <div>
          <Account />
        </div>
      </div>
      <HomePageContext.Provider
        value={{
          pool: data?.pool,
          tickId,
          setTickId,
          redeemables,
          update: deposits.refetch,
        }}
      >
        <CurrencyContext.Provider
          value={{ symbol: data!.pool!.currencyToken.symbol }}
        >
          <div className="flex flex-col md:flex-row w-full flex-1">
            <div className="flex flex-col md:flex-1 md:p-4 h-full">
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    className="bg-purple-500 rounded-full w-12 h-12"
                    src={makeBlockie(data!.pool!.id)}
                  />
                  <div className="flex-1">
                    <div className="text-lg text-white">
                      {data?.pool ? (
                        <>
                          {data.pool.collateralToken.name}/
                          {data.pool.currencyToken.symbol}
                        </>
                      ) : (
                        <Skeleton />
                      )}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {data?.pool ? (
                        <>
                          TVL: <Currency value={data.pool.totalValueLocked} />
                        </>
                      ) : (
                        <Skeleton />
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 items-start space-x-2 pb-[400px] lg:pb-0">
                  {/* <div className="table-row uppercase text-sm text-neutral-500">
            <div className="table-cell p-2">ID</div>
            <div className="table-cell p-2">Max Duration</div>
            <div className="table-cell p-2">Loan Limit</div>
            <div className="table-cell p-2">Deposits</div>
          </div> */}
                  {!!data?.pool
                    ? data.pool.ticks.map((tick) => {
                        return (
                          <Tick
                            poolId={data!.pool!.id}
                            value={tick}
                            isSelected={tickId === tick.id}
                            deposit={redeemables[tick.id]}
                            onClick={() =>
                              setTickId((prev) =>
                                prev === tick.id ? null : tick.id
                              )
                            }
                          />
                        );
                      })
                    : "..."}
                </div>
                {/* <pre className="font-mono">{JSON.stringify(data?.pool, null, 2)}</pre> */}
              </>
            </div>
            <div
              className={classes(
                "fixed right-0 bottom-0 left-0 flex flex-col min-h-[400px] lg:block bg-neutral-900 w-full lg:w-auto bg-transparent lg:static rounded-xl z-30 lg:h-full lg:rounded-none lg:min-w-[400px] lg:basis-[400px]",
                tickId ? "fixed" : "hidden"
              )}
            >
              <Action tick={tick} />
            </div>
          </div>
        </CurrencyContext.Provider>
      </HomePageContext.Provider>
    </div>
  );
}
