import { BLIP_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS, BLIP_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS } from "./constants.js";
import { manifest as blipEditorSchemaManifest } from "./Blip.BlockPicker.js";

export const manifests = [
  blipEditorSchemaManifest,
  {
    type: "propertyEditorUi",
    alias: BLIP_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS,
    name: "Blip Block List Item Picker Property Editor UI",
    element: () => import("./blip-editor.element.js"),
    meta: {
      label: "Block List Item Picker",
      icon: "icon-list",
      group: "pickers",
      supportsReadonly: true,
      propertyEditorSchemaAlias: BLIP_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS
    },
  },
];
