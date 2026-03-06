import {
  customElement,
  html,
  css,
  state,
  nothing,
  repeat,
} from "@umbraco-cms/backoffice/external/lit";
import {
  umbDestroyOnDisconnect,
  UmbLitElement,
} from "@umbraco-cms/backoffice/lit-element";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UmbSorterController } from "@umbraco-cms/backoffice/sorter";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentDetailRepository } from "@umbraco-cms/backoffice/document";
import { UmbDocumentTypeItemRepository } from "@umbraco-cms/backoffice/document-type";
import { UmbDataTypeDetailRepository } from "@umbraco-cms/backoffice/data-type";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { UMB_VARIANT_CONTEXT } from "@umbraco-cms/backoffice/variant";
import { BLIP_BLOCK_PICKER_MODAL } from "../modal/blip-block-picker-modal.token.js";
import { BlipService } from "../../generated/index.js";
import { BlipBlockListManagerContext } from "./manager.context.js";
import { BlipBlockEntriesContext } from "./entries.context.js";
import type { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";
import type { UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";
import type { BlipBlockViewModel } from "../entities.js";
import type { UmbBlockTypeBaseModel } from "@umbraco-cms/backoffice/block-type";
import type { UmbBlockListLayoutModel } from "@umbraco-cms/backoffice/block-list";

const elementName = "blip-property-editor-ui";

const entryOverrideStyles = new CSSStyleSheet();
entryOverrideStyles.replaceSync(`
  uui-action-bar uui-button:not([label="delete"]) { display: none !important; }
  uui-action-bar uui-button[label="delete"] {
    --uui-button-border-radius: 50px !important;
    --uui-button-padding-left-factor: 2
  }
`);


@customElement(elementName)
export default class BlipPropertyEditorUIElement
  extends UmbLitElement
  implements UmbPropertyEditorUiElement
{
  #docRepo = new UmbDocumentDetailRepository(this);
  #docTypeItemRepo = new UmbDocumentTypeItemRepository(this);
  #dataTypeRepo = new UmbDataTypeDetailRepository(this);
  #managerContext = new BlipBlockListManagerContext(this);

  // Provides 'UmbBlockEntriesContext' that umb-block-list-entry needs to render.
  // Self-registers in the context tree via UmbContextBase constructor.
  // @ts-expect-error: instantiated for side-effect (context registration)
  #entriesContext = new BlipBlockEntriesContext(this);

  value: string[] | undefined = [];

  public set config(value: UmbPropertyEditorConfigCollection | undefined) {
    if (!value) return;

    this._sourceNodeKey = value.getValueByAlias<string>("sourceNode") ?? "";
    this._sourceProperty =
      value.getValueByAlias<string>("sourceProperty") ?? "";
    this._minNumber = value.getValueByAlias<number>("minNumber") ?? 0;
    this._maxNumber = value.getValueByAlias<number>("maxNumber") ?? 0;
    this._multiPicker = this._maxNumber !== 1;

    this.#loadData();
  }

  @state() private _loading = true;
  @state() private _blocks: BlipBlockViewModel[] = [];
  @state() private _layouts: UmbBlockListLayoutModel[] = [];
  @state() private _userCanEdit = false;
  @state() private _sourceNodeKey = "";

  private _minNumber = 0;
  private _maxNumber = 0;
  private _sourceProperty = "";
  private _multiPicker = true;
  private _sourceLayouts: UmbBlockListLayoutModel[] = [];

  #sorter = new UmbSorterController<UmbBlockListLayoutModel>(this, {
    getUniqueOfElement: (element) =>
      (element as unknown as { contentKey: string }).contentKey,
    getUniqueOfModel: (modelEntry) => modelEntry.contentKey,
    itemSelector: "umb-block-list-entry",
    // No containerSelector — host element is the container, matching the real block list
    onChange: ({ model }) => {
      this._layouts = model;
      this.#updateValue();
    },
  });

  override connectedCallback() {
    super.connectedCallback();

    // Provide the variant ID to the block manager — required by umb-block-list-entry
    // for resolving content type structures and rendering labels via UFM.
    this.consumeContext(UMB_VARIANT_CONTEXT, (context) => {
      this.observe(context?.displayVariantId, (variantId) => {
        this.#managerContext.setVariantId(variantId);
      }, 'observeVariantId');
    });

    this.addEventListener("blip:block-deleted", ((e: CustomEvent) => {
      this.#removeBlock(e.detail.contentKey);
    }) as EventListener);
  }

  override async updated() {
    await customElements.whenDefined("umb-block-list-entry");

    this.shadowRoot?.querySelectorAll("umb-block-list-entry").forEach((entry) => {
      if (
        entry.shadowRoot &&
        !entry.shadowRoot.adoptedStyleSheets.includes(entryOverrideStyles)
      ) {
        entry.shadowRoot.adoptedStyleSheets = [
          ...entry.shadowRoot.adoptedStyleSheets,
          entryOverrideStyles,
        ];
      }
    });
  }

  async #loadData() {
    this._loading = true;

    if (!this._sourceNodeKey || !this._sourceProperty) {
      this._loading = false;
      return;
    }

    const { data: doc } = await this.#docRepo.requestByUnique(
      this._sourceNodeKey,
    );
    if (!doc) {
      this._loading = false;
      return;
    }

    const propValue = doc.values.find((v) => v.alias === this._sourceProperty);
    const blockListValue = propValue?.value as BlockListRawValue | undefined;

    if (!blockListValue?.contentData?.length) {
      this._loading = false;
      return;
    }

    // Check user edit permission via Blip API
    const { data: slim } = await tryExecute(
      this,
      BlipService.getUmbracoBlipManagementApiV1({
        query: {
          key: this._sourceNodeKey,
          propertyAlias: this._sourceProperty,
        },
      }),
    );

    if (!slim?.dataTypeKey) {
      this._loading = false;
      return;
    }

    this._userCanEdit = slim.allowedActions?.includes("A") ?? false;

    // Get data type to read block configurations
    const { data: dataType } = await this.#dataTypeRepo.requestByUnique(
      slim.dataTypeKey,
    );

    if (!dataType) {
      this._loading = false;
      return;
    }

    const blocksConfig = dataType.values.find((v) => v.alias === "blocks");
    const blockTypes = (blocksConfig?.value as UmbBlockTypeBaseModel[]) ?? [];

    // Get element type info (icons, names) for the picker modal
    const elementTypeKeys = [
      ...new Set(blockTypes.map((bt) => bt.contentElementTypeKey)),
    ];

    const { data: typeItems } =
      await this.#docTypeItemRepo.requestItems(elementTypeKeys);

    if (!typeItems) {
      this._loading = false;
      return;
    }

    const typeInfoMap = new Map(
      typeItems.map((item) => [
        item.unique,
        { name: item.name, icon: item.icon ?? "icon-document" },
      ]),
    );

    // Populate block list manager context with source data
    this.#managerContext.setBlockTypes(blockTypes);
    this.#managerContext.setContents(
      blockListValue.contentData.map((b) => ({
        key: b.key,
        contentTypeKey: b.contentTypeKey,
        values: (b.values ?? []).map((v) => ({
          alias: v.alias,
          value: v.value,
          culture: null,
          segment: null,
          editorAlias: "",
        })),
      })),
    );
    this.#managerContext.setSettings(
      (blockListValue.settingsData ?? []).map((s) => ({
        key: s.key,
        contentTypeKey: s.contentTypeKey,
        values: (s.values ?? []).map((v) => ({
          alias: v.alias,
          value: v.value,
          culture: null,
          segment: null,
          editorAlias: "",
        })),
      })),
    );

    // Mark all blocks as exposed so they don't render with a "Draft" tag.
    this.#managerContext.setExposes(
      blockListValue.contentData.map((b) => ({
        contentKey: b.key,
        culture: null,
        segment: null,
      })),
    );

    // Store source layouts and build block view models for the picker modal
    this._sourceLayouts = blockListValue.layout?.["Umbraco.BlockList"] ?? [];

    this._blocks = blockListValue.contentData.map((block) => {
      const typeInfo = typeInfoMap.get(block.contentTypeKey);
      const blockType = blockTypes.find(
        (bt) => bt.contentElementTypeKey === block.contentTypeKey,
      );
      return {
        udi: `umb://element/${block.key}`,
        contentTypeKey: block.contentTypeKey,
        label: blockType?.label || typeInfo?.name || "Block",
        icon: typeInfo?.icon ?? "icon-document",
        value: block.values,
      };
    });

    this.#syncLayouts();
    this._loading = false;
  }

  #udisToLayouts(udis: string[]): UmbBlockListLayoutModel[] {
    return udis
      .map((udi) => {
        const key = udi.replace("umb://element/", "");
        return this._sourceLayouts.find((l) => l.contentKey === key);
      })
      .filter((l): l is UmbBlockListLayoutModel => l !== undefined);
  }

  #syncLayouts() {
    this._layouts = this.#udisToLayouts(this.value ?? []);
    this.#managerContext.setLayouts(this._layouts);
    this.#sorter.setModel(this._layouts);
  }

  #updateValue() {
    this.value = this._layouts.map((l) => `umb://element/${l.contentKey}`);
    this.#managerContext.setLayouts(this._layouts);
    this.dispatchEvent(new UmbChangeEvent());
  }

  #removeBlock(contentKey: string) {
    this._layouts = this._layouts.filter((l) => l.contentKey !== contentKey);
    this.#sorter.setModel(this._layouts);
    this.#updateValue();
  }

  async #addBlock() {
    const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
    if (!modalManager) return;

    const modal = modalManager.open(this, BLIP_BLOCK_PICKER_MODAL, {
      data: {
        blocks: this._blocks,
        multiPicker: this._multiPicker,
        selection: this._layouts.map((l) => `umb://element/${l.contentKey}`),
      },
    });

    try {
      const result = await modal.onSubmit();
      if (result.selection) {
        this._layouts = this.#udisToLayouts(result.selection);
        this.#sorter.setModel(this._layouts);
        this.#updateValue();
      }
    } catch {
      // Modal was closed
    }
  }

  // TODO => use path pattern
  #manageBlocks() {
    if (!this._sourceNodeKey) return;
    window.history.pushState(
      {},
      "",
      `/umbraco/section/content/workspace/document/edit/${this._sourceNodeKey}`,
    );
  }

  override render() {
    if (this._loading) {
      return html`<uui-loader></uui-loader>`;
    }

    return html`
      ${repeat(
        this._layouts,
        (layout, index) => `${index}_${layout.contentKey}`,
        (layout, index) => html`
          <umb-block-list-entry
            index=${index}
            .contentKey=${layout.contentKey}
            .layout=${layout}
            ${umbDestroyOnDisconnect()}
          >
          </umb-block-list-entry>
        `,
      )}

      ${!this._blocks.length
        ? html`<p class="empty-state">
            ${this.localize.term("blip_noBlocks")}
          </p>`
        : nothing}

      <div>
        <uui-button-group>
          <uui-button
            look="placeholder"
            label=${this.localize.term("blip_addBlock")}
            ?disabled=${!this._blocks.length}
            @click=${this.#addBlock}
          ></uui-button>

          ${this._userCanEdit
            ? html`
                <uui-button
                  compact
                  look="placeholder"
                  label=${this.localize.term("blip_manageBlocks")}
                  @click=${this.#manageBlocks}
                >
                  <uui-icon name="icon-edit"></uui-icon>
                </uui-button>
              `
            : nothing}
        </uui-button-group>
      </div>

      ${this.#renderValidationMessages()}
    `;
  }

  #renderValidationMessages() {
    if (!this._multiPicker) return nothing;

    const count = this._layouts.length;
    const min = this._minNumber;
    const max = this._maxNumber;

    if (!min && !max) return nothing;
    if (count === 0 && !min) return nothing;

    let message = "";

    if (min && max && min !== max) {
      if (count < max) message = `Add between ${min} and ${max} items`;
      if (count > max) message = `Maximum ${max} items allowed`;
    } else if (min && max && min === max) {
      if (count < max) message = `Add ${min - count} more item(s)`;
      if (count > max) message = `Maximum ${max} items allowed`;
    } else if (!min && max) {
      if (count < max) message = `Add up to ${max} items`;
      if (count > max) message = `Maximum ${max} items allowed`;
    } else if (min && !max && count < min) {
      message = `Add at least ${min} item(s)`;
    }

    if (!message) return nothing;

    return html`<div id="validation-message">${message}</div>`;
  }

  static override styles = [
    css`
      :host {
        display: grid;
        align-content: start;
        gap: 1px;
      }

      > div {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      uui-button-group {
        padding-top: 1px;
        display: grid;
        grid-template-columns: 1fr auto;
      }

      #validation-message {
        color: var(--uui-color-danger);
        font-size: var(--uui-type-small-size);
        margin-top: var(--uui-size-space-2);
      }

      .empty-state {
        text-align: center;
        color: var(--uui-color-text-alt);
        padding: var(--uui-size-space-4);
      }
    `,
  ];
}

interface BlockListRawValue {
  layout?: {
    "Umbraco.BlockList"?: Array<{
      contentKey: string;
      settingsKey?: string | null;
    }>;
  };
  contentData?: Array<{
    key: string;
    contentTypeKey: string;
    values?: Array<{ alias: string; value?: unknown }>;
  }>;
  settingsData?: Array<{
    key: string;
    contentTypeKey: string;
    values?: Array<{ alias: string; value?: unknown }>;
  }>;
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: BlipPropertyEditorUIElement;
  }
}
