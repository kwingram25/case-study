import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_ENDPOINT,
  documents: ["./app/gql/*.graphql"],
  generates: {
    "./app/gql/generated/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
