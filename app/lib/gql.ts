import request from "graphql-request";
import { HomePageDocument, HomePageQuery } from "../gql/generated/graphql";

export async function getPools() {
  return request<HomePageQuery>(
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
    HomePageDocument,
    { first: 10 }
  );
}
