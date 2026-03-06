import { UmbBlockManagerContext, type UmbBlockDataModel } from '@umbraco-cms/backoffice/block';
import type { UmbBlockListLayoutModel, UmbBlockListTypeModel, UmbBlockListWorkspaceOriginData } from '@umbraco-cms/backoffice/block-list';

/**
 * Block manager context for the Blip block picker.
 * Exposes inlineEditingMode and isSortMode observables required by umb-block-list-entry.
 */
export class BlipBlockListManagerContext extends UmbBlockManagerContext<
	UmbBlockListTypeModel,
	UmbBlockListLayoutModel,
	UmbBlockListWorkspaceOriginData
> {
	// Required by base class. Not used in Blip (read-only picker).
	async createWithPresets(contentElementTypeKey: string, partialLayoutEntry?: Omit<UmbBlockListLayoutModel, 'contentKey'>) {
		return await super._createBlockData(contentElementTypeKey, partialLayoutEntry);
	}

	// Required by base class. Not used in Blip (read-only picker).
	insert(
		layoutEntry: UmbBlockListLayoutModel,
		content: UmbBlockDataModel,
		settings: UmbBlockDataModel | undefined,
		originData: UmbBlockListWorkspaceOriginData,
	) {
		this._layouts.appendOneAt(layoutEntry, originData.index ?? -1);
		this.insertBlockData(layoutEntry, content, settings, originData);
		return true;
	}
}
