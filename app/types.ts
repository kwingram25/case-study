import { Tick } from "./gql/generated/graphql";

export type TickFragment = Pick<
  Tick,
  "id" | "duration" | "limit" | "raw" | "available" | "value"
>;
