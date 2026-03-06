import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import type { UmbEntryPointOnInit } from "@umbraco-cms/backoffice/extension-api";
import { client } from "../generated";
import { manifests } from "./manifests";

export * from './property/index.js';

export const onInit: UmbEntryPointOnInit = (host, extensionRegistry) => {
  extensionRegistry.registerMany(manifests);

  host.consumeContext(UMB_AUTH_CONTEXT, async (auth) => {
    if (!auth) return;
    const config = auth?.getOpenApiConfiguration();

    client.setConfig({
      baseUrl: config?.base ?? "",
      auth: config?.token ?? undefined,
      credentials: config?.credentials ?? "same-origin",
    });
  });
};
