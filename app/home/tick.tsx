"use client";

import { useAccount } from "wagmi";
import { Currency } from "../currency";
import { classes } from "../lib";
import { useIsConnected } from "../lib";
import { TickFragment } from "../types";
import makeBlockie from "ethereum-blockies-base64";

export function Tick({
  isSelected,
  deposit,
  value: { available, value, id, limit, duration, raw },
  poolId,
  onClick,
}: {
  isSelected: boolean;
  deposit?: BigInt;
  poolId: `0x${string}`;
  value: TickFragment;
  onClick: () => void;
}) {
  const { address } = useAccount();
  const isConnected = useIsConnected();
  const percentage = (100 * parseInt(available, 10)) / parseInt(value, 10);

  return (
    <div
      className={classes(
        "flex flex-col relative cursor-pointer border-neutral-500 bg-neutral-900 p-4 pb-16 rounded-lg space-y-2",
        isSelected ? "bg-purple-500/50" : "hover:bg-purple-500/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <img src={makeBlockie(id)} className="w-8 h-8 rounded-full mr-2" />
        <div className="font-mono font-semibold flex-1 text-lg">
          #{id.slice(-4)}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="uppercase text-xs text-neutral-500">Max Term: </span>
          <span>{Math.round(parseInt(duration, 10) / 86400)}d</span>
        </div>
      </div>
      {[
        ["Loan Limit", <Currency value={limit} />, null],
        [
          "Value / Capacity",
          <>
            <Currency
              bare
              value={parseInt(value, 10) - parseInt(available, 10)}
            />{" "}
            / <Currency value={value} />
          </>,
          <div className="w-full h-2 bg-neutral-700 relative">
            <div
              className={classes(
                "rounded-2xl absolute left-0 top-0 bottom-0",
                percentage < 40
                  ? "bg-red-500"
                  : percentage > 80
                  ? "bg-green-500"
                  : "bg-amber-500"
              )}
              style={{
                right: `${percentage}%`,
              }}
            />
          </div>,
        ],
      ].map(([label, value, extra]) => {
        return (
          <>
            <div className="flex items-center">
              <div className="flex-1 text-xs uppercase text-neutral-400">
                {label}
              </div>
              <div className="whitespace-pre">{value}</div>
            </div>
            {extra}
          </>
        );
      })}
      {isConnected && deposit && (
        <div className="flex items-center absolute left-4 right-4 bottom-4 text-purple-500">
          <div className="flex-1 text-xs uppercase">My Position</div>
          <div className="whitespace-pre">
            <Currency
              value={deposit.toString()}
              precision={3}
              symbolClassName="text-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
