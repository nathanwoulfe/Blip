import { UmbBooleanState } from '@umbraco-cms/backoffice/observable-api';
import { UmbBlockManagerContext, type UmbBlockDataModel } from '@umbraco-cms/backoffice/block';
import { UMB_PROPERTY_SORT_MODE_CONTEXT } from '@umbraco-cms/backoffice/property-sort-mode';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
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
	#inlineEditingMode = new UmbBooleanState(undefined);
	readonly inlineEditingMode = this.#inlineEditingMode.asObservable();

	setInlineEditingMode(inlineEditingMode: boolean | undefined) {
		this.#inlineEditingMode.setValue(inlineEditingMode ?? false);
	}
	getInlineEditingMode(): boolean | undefined {
		return this.#inlineEditingMode.getValue();
	}

	#sortModeContext?: typeof UMB_PROPERTY_SORT_MODE_CONTEXT.TYPE;
	#isSortMode = new UmbBooleanState(undefined);
	readonly isSortMode = this.#isSortMode.asObservable();

	setIsSortMode(isSortMode: boolean) {
		this.#sortModeContext?.setIsSortMode(isSortMode);
	}
	getIsSortMode(): boolean | undefined {
		return this.#sortModeContext?.getIsSortMode();
	}

	constructor(host: UmbControllerHost) {
		super(host);

		this.consumeContext(UMB_PROPERTY_SORT_MODE_CONTEXT, (sortPropertyContext) => {
			this.#sortModeContext = sortPropertyContext;
			this.observe(this.#sortModeContext?.isSortMode, (isSortMode) => {
				this.#isSortMode.setValue(isSortMode);
			});
		});
	}

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
