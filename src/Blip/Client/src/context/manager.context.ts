import {
  UmbBlockManagerContext,
  type UmbBlockDataModel,
} from "@umbraco-cms/backoffice/block";
import type {
  UmbBlockListLayoutModel,
  UmbBlockListTypeModel,
  UmbBlockListWorkspaceOriginData,
} from "@umbraco-cms/backoffice/block-list";
import { UmbBooleanState } from "@umbraco-cms/backoffice/observable-api";

/**
 * Block manager context for the Blip block picker.
 */
export class BlipBlockListManagerContext<
	BlockLayoutType extends UmbBlockListLayoutModel = UmbBlockListLayoutModel,
> extends UmbBlockManagerContext<UmbBlockListTypeModel, BlockLayoutType, UmbBlockListWorkspaceOriginData> {
  // Required by base class. Not used in Blip (read-only picker).

  readonly inlineEditingModel = new UmbBooleanState(false).asObservable();
  readonly isSortMode = new UmbBooleanState(false).asObservable();

  async createWithPresets(
    _contentElementTypeKey: string,
    _partialLayoutEntry?: Omit<UmbBlockListLayoutModel, "contentKey">,
  ) {
    return Promise.resolve(undefined);
  }

  // Required by base class. Not used in Blip (read-only picker).
  insert(
    _layoutEntry: UmbBlockListLayoutModel,
    _content: UmbBlockDataModel,
    _settings: UmbBlockDataModel | undefined,
    _originData: UmbBlockListWorkspaceOriginData,
  ) {
    return true;
  }
}
