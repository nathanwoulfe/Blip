import { UmbModalToken } from "@umbraco-cms/backoffice/modal";
import type { BlipBlockViewModel } from "../entities";

export interface BlipBlockPickerModalData {
  blocks: Array<BlipBlockViewModel>;
  multiPicker: boolean;
  selection: string[];
}

export interface BlipBlockPickerModalResult {
  selection: string[];
}

export const BLIP_BLOCK_PICKER_MODAL = new UmbModalToken<
  BlipBlockPickerModalData,
  BlipBlockPickerModalResult
>("Blip.Modal.BlockPicker", {
  modal: { type: "sidebar", size: "medium" },
});
