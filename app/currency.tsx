import { createContext, useContext } from "react";
import { classes } from "./lib";

type Currency = {
  symbol?: string;
  decimals?: number;
};

type Props = {
  bare?: boolean;
  value: string | number;
  precision?: number;
  symbol?: string;
  symbolClassName?: string;
};

export const CurrencyContext = createContext<Currency | undefined>(undefined);

export function Currency({
  value: propsValue,
  bare,
  precision = 1,
  symbol,
  symbolClassName,
}: Props) {
  const currency = useContext(CurrencyContext) || { decimals: 18 };
  const value =
    typeof propsValue === "string" ? parseInt(propsValue, 10) : propsValue;

  return (
    <>
      {(value / 10 ** (currency.decimals || 18)).toLocaleString(undefined, {
        maximumFractionDigits: precision,
        minimumFractionDigits: precision,
      })}
      {(symbol || currency.symbol) && !bare && (
        <span
          className={classes(
            "text-neutral-500 whitespace-pre",
            symbolClassName
          )}
        >
          {" "}
          {symbol || currency.symbol}
        </span>
      )}
    </>
  );
}
