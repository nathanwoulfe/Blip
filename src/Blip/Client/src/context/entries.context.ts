import {
  UmbBlockEntriesContext,
  type UmbBlockDataModel,
  type UmbBlockDataObjectModel,
  type UmbBlockLayoutBaseModel,
  type UmbBlockWorkspaceOriginData,
} from "@umbraco-cms/backoffice/block";
import { UmbBooleanState } from "@umbraco-cms/backoffice/observable-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import {
  type UmbBlockListTypeModel,
  type UmbBlockListLayoutModel,
  type UmbBlockListWorkspaceOriginData,
  type UmbBlockListValueModel,
  UMB_BLOCK_LIST_MANAGER_CONTEXT,
} from "@umbraco-cms/backoffice/block-list";

/**
 * Minimal entries context for the Blip block picker.
 * All creation/insertion methods are no-ops since Blip only picks existing blocks.
 */
export class BlipBlockEntriesContext extends UmbBlockEntriesContext<
  typeof UMB_BLOCK_LIST_MANAGER_CONTEXT,
  typeof UMB_BLOCK_LIST_MANAGER_CONTEXT.TYPE,
  UmbBlockListTypeModel,
  UmbBlockListLayoutModel,
  UmbBlockListWorkspaceOriginData
> {
  readonly canCreate = new UmbBooleanState(false).asObservable();
  readonly hasExpose = new UmbBooleanState(true).asObservable();

  constructor(host: UmbControllerHost) {
    super(host, UMB_BLOCK_LIST_MANAGER_CONTEXT);
  }

  protected _gotBlockManager() {
    if (!this._manager) return;

    this.observe(this._manager.layouts, (layouts) => {
      this._layoutEntries.setValue(layouts);
    });
    this.observe(this.layoutEntries, (layouts) => {
      this._manager?.setLayouts(layouts);
    });
  }

  getPathForCreateBlock(): string | undefined {
    return undefined;
  }

  getPathForClipboard(): string | undefined {
    return undefined;
  }

  async create(): Promise<
    UmbBlockDataObjectModel<UmbBlockLayoutBaseModel> | undefined
  > {
    return undefined;
  }

  async insert(
    _layoutEntry: UmbBlockLayoutBaseModel,
    _content: UmbBlockDataModel,
    _settings: UmbBlockDataModel | undefined,
    _originData: UmbBlockWorkspaceOriginData,
  ): Promise<boolean> {
    return false;
  }

  protected async _insertFromPropertyValue(
    _values: UmbBlockListValueModel,
    originData: UmbBlockListWorkspaceOriginData,
  ) {
    return originData;
  }

  override async delete(contentKey: string): Promise<void> {
    // Only remove the layout. Unlike the base class, we do NOT remove content/settings
    // from the manager — those belong to the source node, not to Blip.
    this._layoutEntries.removeOne(contentKey);
    this.getHostElement().dispatchEvent(
      new CustomEvent("blip:block-deleted", { detail: { contentKey } }),
    );
  }
}
