"use client";

import { Tab } from "@headlessui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { classes, poolAbi } from "../lib";
import { Currency, CurrencyContext } from "../currency";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { HomePageContext } from ".";
import { erc20Abi } from "viem";
import makeBlockie from "ethereum-blockies-base64";
import { Ring } from "react-css-spinners";
import { TickFragment } from "../types";
import toast from "react-hot-toast";

type Props = {
  tick?: TickFragment | null;
};

function getIsMint(index: number) {
  return index === 0;
}

export function Action({ tick }: Props) {
  const { address } = useAccount();

  const { pool, tickId, redeemables, update } = useContext(HomePageContext);
  const currency = useContext(CurrencyContext);

  const {
    data: hash,
    error: txError,
    writeContract,
    writeContractAsync,
    isError,
    isPending,
  } = useWriteContract();
  const { data: allowance } = useReadContract({
    address: pool?.currencyToken.id,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as unknown as `0x${string}`, pool?.id],
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  console.log("blah");
  console.log(allowance);

  const [tabIndex, setTabIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(false);

  // const tick = useMemo(() => pool?.ticks.find(({ id }) => id === tickId) || null, []);
  const isAmountValid = useMemo(() => {
    return amount !== "" && parseFloat(amount) > 0;
  }, [amount]);

  const tabs = useMemo(() => {
    return [
      {
        title: "Mint",
        panel: <>Content 1</>,
      },
      {
        title: "Redeem",
        panel: <>Content 2</>,
      },
    ];
  }, []);

  async function onSubmit() {
    const isMint = getIsMint(tabIndex);
    console.log("tard");

    console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

    const amountN = BigInt(parseFloat(amount) * 10e17);

    try {
      if (!address) {
        throw new Error();
      }

      if (getIsMint(tabIndex) && (!allowance || allowance < amountN)) {
        await writeContractAsync({
          address: pool?.currencyToken.id,
          abi: erc20Abi,
          functionName: "approve",
          args: [address, BigInt(100e18)],
        });
      }

      if (isMint) {
        writeContract({
          address: pool?.id,
          abi: poolAbi,
          functionName: "deposit",
          args: [tick!.raw, amountN, BigInt(0)],
        });
      } else {
        writeContract({
          address: pool?.id,
          abi: poolAbi,
          functionName: "redeem",
          args: [tick!.raw, amountN],
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      update();
      setAmount("");
      setError(false);
      toast("Success!");
    }
  }, [isConfirmed, update]);

  useEffect(() => {
    setError(!!txError || false);
  }, [txError]);

  useEffect(() => {
    setAmount("");
    setError(false);
  }, [tabIndex, tick?.id]);

  if (!tick) {
    return (
      <div className="hidden lg:flex lg:flex-1 lg:h-full w-full justify-center mt-20">
        Select a pool
      </div>
    );
  }

  return (
    <div className="lg:h-full bg-neutral-800 w-full flex-1 lg:bg-transparent">
      <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
        <Tab.List className="flex items-center w-full">
          {tabs.map(({ title }) => (
            <Tab
              className={({ selected }) =>
                classes(
                  "py-4 px-6 outline-none border-y-4 border-y-transparent hover:bg-neutral-900",
                  selected && "border-b-purple-500"
                )
              }
            >
              {title}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tabs.map((_, index) => {
            const isMint = getIsMint(index);

            return (
              <Tab.Panel className="w-full p-4">
                <div className="py-2">
                  <div className="flex items-center mb-3">
                    <img
                      src={makeBlockie(tick.id)}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div className="font-mono flex-1 text-lg">
                      Tick #{tick.id.slice(-4)}
                    </div>
                  </div>
                  {!isMint && tickId && redeemables[tickId] && (
                    <div className="flex items-center rounded-full mb-2 bg-purple-500/25 justify-center py-2 text-center whitespace-pre">
                      <span>
                        You can redeem{" "}
                        <b>
                          <Currency
                            value={redeemables[tickId].toString()}
                            bare
                            precision={3}
                          />
                        </b>{" "}
                        tokens for {pool?.currencyToken.symbol}
                      </span>
                    </div>
                  )}
                  <label
                    htmlFor="amount"
                    className="text-sm font-mono cursor-pointer"
                  >
                    {isMint ? "Deposit amount:" : "Redeem tokens:"}
                  </label>
                  <div className="flex items-baseline space-x-2 rounded-full border-2 border-transparent focus-within:border-purple-500 py-2 px-3">
                    <CurrencyInput
                      id="amount"
                      className="bg-transparent text-white text-right outline-none flex-1 text-lg"
                      placeholder="0.0"
                      decimalsLimit={18}
                      value={amount}
                      onValueChange={(value?: string) => {
                        if (!value) {
                          setAmount("");
                          return;
                        }

                        value && setAmount(value);
                      }}
                    />
                    <span>{isMint ? currency?.symbol : "tokens"}</span>
                  </div>
                </div>
                <button
                  disabled={!isAmountValid}
                  className={classes(
                    "bg-purple-500 text-xl flex items-center justify-center h-16 w-full rounded-full",
                    !isAmountValid || isPending || isConfirming
                      ? "opacity-50"
                      : "cursor-pointer hover:bg-purple-400"
                  )}
                  onClick={onSubmit}
                >
                  {(isPending || isConfirming) && !isError && !isConfirmed ? (
                    <Ring color="white" size={32} thickness={3} />
                  ) : isMint ? (
                    "Mint"
                  ) : (
                    "Redeem"
                  )}
                </button>
                {error && (
                  <div className="text-red-500 mt-3 text-center w-full">
                    An error occurred
                  </div>
                )}
              </Tab.Panel>
            );
          })}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
