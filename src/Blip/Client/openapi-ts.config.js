import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  debug: true,
  input:
    "http://localhost:48740/umbraco/swagger/blip-management/swagger.json",
  output: {
    path: "generated",
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      bundle: false,
      exportFromIndex: true,
      throwOnError: true,
    },
    {
      name: "@hey-api/typescript",
      enums: false,
    },
    {
      name: "@hey-api/sdk",
      asClass: true,
      classNameBuilder: (name) => `${name}Service`,
      responseStyle: "fields",
    },
  ],
});
