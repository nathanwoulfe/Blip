import {
  customElement,
  html,
  css,
  state,
  repeat,
  when,
  ifDefined,
} from "@umbraco-cms/backoffice/external/lit";
import { umbDestroyOnDisconnect } from "@umbraco-cms/backoffice/lit-element";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import {
  UmbSorterController,
  type UmbSorterConfig,
} from "@umbraco-cms/backoffice/sorter";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { tryExecute, UmbApiError } from "@umbraco-cms/backoffice/resources";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { UMB_VARIANT_CONTEXT } from "@umbraco-cms/backoffice/variant";
import { BLIP_BLOCK_PICKER_MODAL } from "../modal/index.js";
import { BlipService } from "../../generated/index.js";
import type {
  UmbPropertyEditorUiElement,
  UmbPropertyEditorConfigCollection,
} from "@umbraco-cms/backoffice/property-editor";
import type { UmbBlockTypeBaseModel } from "@umbraco-cms/backoffice/block-type";
import {
  UMB_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS,
  UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS,
  type UmbBlockListLayoutModel,
  type UmbBlockListValueModel,
} from "@umbraco-cms/backoffice/block-list";
import type { UmbBlockLayoutBaseModel } from "@umbraco-cms/backoffice/block";
import { UMB_PROPERTY_CONTEXT } from "@umbraco-cms/backoffice/property";
import {
  loadManifestElement,
  type ManifestElement,
} from "@umbraco-cms/backoffice/extension-api";
import { umbExtensionsRegistry } from "@umbraco-cms/backoffice/extension-registry";
import { type BlipBlockViewModel } from "../entities.js";
import { UmbDocumentTypeItemRepository } from "@umbraco-cms/backoffice/document-type";
import { UmbModalRouteRegistrationController } from "@umbraco-cms/backoffice/router";
import { UMB_WORKSPACE_MODAL } from "@umbraco-cms/backoffice/workspace";
import {
  UMB_DOCUMENT_ENTITY_TYPE,
  UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN,
} from "@umbraco-cms/backoffice/document";
import { BlipEditorElementBase } from "./blip-editor-base.element.js";

type UmbBlockListEntryElement = HTMLElement & { contentKey: string };

const SORTER_CONFIG: UmbSorterConfig<
  UmbBlockListLayoutModel,
  UmbBlockListEntryElement
> = {
  getUniqueOfElement: (element) => element.contentKey,
  getUniqueOfModel: (modelEntry) => modelEntry.contentKey,
  itemSelector: "umb-block-list-entry",
};

const entryOverrideStyles = new CSSStyleSheet();
entryOverrideStyles.replaceSync(`
  uui-action-bar uui-button:not([label="delete"]) { display: none !important; }
  uui-action-bar uui-button[label="delete"] {
    --uui-button-border-radius: 50px !important;
    --uui-button-padding-left-factor: 2
  }
`);

const elementName = "blip-property-editor-ui";

@customElement(elementName)
export default class BlipPropertyEditorUIElement
  extends BlipEditorElementBase
  implements UmbPropertyEditorUiElement
{
  readonly #elementPrefix = "umb://element/";

  readonly #docTypeItemRepo = new UmbDocumentTypeItemRepository(this);

  public set config(config: UmbPropertyEditorConfigCollection | undefined) {
    if (!config) return;

    this._sourceNodeKey = config.getValueByAlias<string>("sourceNode") ?? "";
    this._sourceProperty =
      config.getValueByAlias<string>("sourceProperty") ?? "";
    this._limitMin = config.getValueByAlias<number>("minNumber") ?? 0;
    this._limitMax = config.getValueByAlias<number>("maxNumber") ?? 0;
    this._multiPicker = this._limitMax !== 1;
  }

  @state() private _loading = true;
  @state() private _blocks: BlipBlockViewModel[] = [];
  @state() private _layouts: Array<UmbBlockLayoutBaseModel> = [];
  @state() private _userCanEdit = false;
  @state() private _sourceNodeKey = "";
  @state() private _editPath?: string;
  @state() private _multiPicker = true;
  @state() private _sourceProperty = "";
  @state() private _culture: string | null = null;

  #sourceLayouts: UmbBlockListLayoutModel[] = [];

  readonly #sorter = new UmbSorterController<
    UmbBlockListLayoutModel,
    UmbBlockListEntryElement
  >(this, {
    ...SORTER_CONFIG,
    onChange: ({ model }) => {
      this.entriesContext.setLayouts(model);
      this.#updateValue();
    },
  });

  constructor() {
    super();

    new UmbModalRouteRegistrationController(this, UMB_WORKSPACE_MODAL)
      .onSetup(() => ({
        data: { entityType: UMB_DOCUMENT_ENTITY_TYPE, preset: {} },
      }))
      .observeRouteBuilder(
        (routeBuilder) => (this._editPath = routeBuilder({})),
      );

    this.consumeContext(UMB_VARIANT_CONTEXT, (context) => {
      this.observe(context?.displayVariantId, (variantId) => {
        this.managerContext.setVariantId(variantId);
      });

      this.observe(context?.displayCulture, (culture) => {
        if (!culture) return;

        this._culture = culture;
        if (this._sourceNodeKey) {
          this.#loadData();
        }
      });
    });

    this.observe(this.entriesContext.layoutEntries, (layouts) => {
      this._layouts = layouts;
      this.#sorter.setModel(layouts);
      this.managerContext.setLayouts(layouts);
    });

    this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
      this.observe(context?.alias, (alias) => {
        this.managerContext.setPropertyAlias(alias);
      });
    });

    this.addEventListener("blip:block-deleted", ((e: CustomEvent) => {
      this.#removeBlock(e.detail.contentKey);
    }) as EventListener);
  }

  override async updated() {
    await customElements.whenDefined("umb-block-list-entry");

    this.shadowRoot
      ?.querySelectorAll("umb-block-list-entry")
      .forEach((entry) => {
        if (
          entry.shadowRoot &&
          !entry.shadowRoot?.adoptedStyleSheets.includes(entryOverrideStyles)
        ) {
          entry.shadowRoot.adoptedStyleSheets = [
            ...entry.shadowRoot.adoptedStyleSheets,
            entryOverrideStyles,
          ];
        }
      });
  }

  async #ensureBlockListEntryElement() {
    if (customElements.get("umb-block-list-entry")) return;
    const manifest = umbExtensionsRegistry.getByAlias(
      UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS,
    ) as ManifestElement | undefined;

    if (manifest?.element) {
      await loadManifestElement(manifest.element);
    }
  }

  async #loadData() {
    await this.#ensureBlockListEntryElement();
    await this.managerContext.contentTypesLoaded;

    if (!this._sourceNodeKey || !this._sourceProperty) {
      this._loading = false;
      return;
    }

    const { data: slim, error } = await tryExecute(
      this,
      BlipService.getUmbracoBlipManagementApiV1({
        query: {
          key: this._sourceNodeKey,
          propertyAlias: this._sourceProperty,
          culture: this._culture ?? undefined,
        },
      }),
    );

    if (error) {
      if (UmbApiError.isUmbApiError(error)) {
        const notificationContext = await this.getContext(
          UMB_NOTIFICATION_CONTEXT,
        );
        notificationContext?.peek("danger", {
          data: {
            headline: error.problemDetails.title,
            message: error.problemDetails.detail ?? "",
          },
        });
      }

      this._loading = false;
      return;
    }

    this._userCanEdit = slim.canEdit;

    const blockListValue = slim.sourceValue as UmbBlockListValueModel;
    const blockConfiguration = (slim.blockConfiguration ??
      []) as UmbBlockTypeBaseModel[];

    // Populate block list manager context with source data
    this.managerContext.setBlockTypes(blockConfiguration);
    this.managerContext.setContents(blockListValue.contentData);
    this.managerContext.setSettings(blockListValue.settingsData);
    this.managerContext.setExposes(blockListValue.expose);
    this.#sourceLayouts =
      blockListValue.layout?.[UMB_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS] ??
      [];

    // Set layouts on the manager — the entries context observes this
    // and updates layoutEntries, which drives our _layouts via the
    // observer set up in the constructor.
    this.managerContext.setLayouts(this.#selectedLayouts());

    const { data: blockTypes } = await this.#docTypeItemRepo.requestItems(
      blockListValue.contentData.map((b) => b.contentTypeKey),
    );

    this._blocks = blockListValue.contentData.map((block) => {
      const blockConfig = blockConfiguration.find(
        (c) => c.contentElementTypeKey === block.contentTypeKey,
      );

      const blockType = blockTypes?.find(
        (bt) => bt.unique === block.contentTypeKey,
      );

      return {
        key: block.key,
        contentTypeKey: block.contentTypeKey,
        label: blockConfig?.label ?? blockType?.name ?? "Block",
        icon: blockType?.icon ?? "icon-document",
        value: block.values.filter(
          (v) => v.culture == null || v.culture === this._culture,
        ),
      };
    });

    this._loading = false;
  }

  /** Filter source layouts to only those selected in the current value. */
  #selectedLayouts(): UmbBlockListLayoutModel[] {
    return (this.value ?? [])
      .map((udi) => {
        const key = udi.replace(this.#elementPrefix, "");
        return this.#sourceLayouts.find((l) => l.contentKey === key);
      })
      .filter((l): l is UmbBlockListLayoutModel => l !== undefined);
  }

  #updateValue() {
    this.value = this._layouts.map(
      (l) => `${this.#elementPrefix}${l.contentKey}`,
    );
    this.dispatchEvent(new UmbChangeEvent());
  }

  #removeBlock(contentKey: string) {
    const filtered = this._layouts.filter((l) => l.contentKey !== contentKey);
    this.entriesContext.setLayouts(filtered);
    this.#updateValue();
  }

  async #addBlock() {
    const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
    if (!modalManager) return;

    const modal = modalManager.open(this, BLIP_BLOCK_PICKER_MODAL, {
      data: {
        blocks: this._blocks,
        multiPicker: this._multiPicker,
        selection: this._layouts.map((l) => l.contentKey),
      },
    });

    try {
      const result = await modal.onSubmit();
      if (result.selection) {
        const newLayouts = result.selection
          .map((v: string) =>
            this.#sourceLayouts.find((l) => l.contentKey === v),
          )
          .filter((l): l is UmbBlockListLayoutModel => l !== undefined);

        this.entriesContext.setLayouts(newLayouts);
        this.#updateValue();
      }
    } catch {
      // Modal was closed
    }
  }

  #getManageBlocksHref() {
    if (!this._sourceNodeKey) return;

    const editPath = UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN.generateLocal({
      unique: this._sourceNodeKey,
    });

    return `${this._editPath}/${editPath}`;
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
      ${when(
        !this._blocks.length,
        () =>
          html`<p class="empty-state">
            ${this.localize.term("blip_noBlocks")}
          </p>`,
      )}

      <div>
        <uui-button-group>
          ${when(
            this._blocks.length,
            () =>
              html` <uui-button
                look="placeholder"
                label=${this.localize.term("blip_addBlock")}
                @click=${this.#addBlock}
              ></uui-button>`,
          )}
          ${when(
            this._userCanEdit,
            () => html`
              <uui-button
                compact
                look="placeholder"
                label=${this.localize.term("blip_manageBlocks")}
                href=${ifDefined(this.#getManageBlocksHref())}
              >
                <uui-icon name="icon-edit"></uui-icon>
              </uui-button>
            `,
          )}
        </uui-button-group>
      </div>
    `;
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

      .empty-state {
        text-align: center;
        color: var(--uui-color-text-alt);
        padding: var(--uui-size-space-4);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: BlipPropertyEditorUIElement;
  }
}
