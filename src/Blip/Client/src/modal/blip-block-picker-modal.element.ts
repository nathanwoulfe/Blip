import {
  customElement,
  html,
  css,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement } from "@umbraco-cms/backoffice/modal";
import { UmbSelectionManager } from "@umbraco-cms/backoffice/utils";
import type {
  BlipBlockPickerModalData,
  BlipBlockPickerModalResult,
} from "./blip-block-picker-modal.token.js";
import type { BlipBlockViewModel } from "../entities.js";

const elementName = "blip-block-picker-modal";

@customElement(elementName)
export default class BlipBlockPickerModalElement extends UmbModalBaseElement<
  BlipBlockPickerModalData,
  BlipBlockPickerModalResult
> {
  @state()
  private _searchTerm = "";

  @state()
  private _selection: string[] = [];

  #selectionManager = new UmbSelectionManager<string>(this);

  override connectedCallback() {
    super.connectedCallback();

    const data = this.data;
    if (!data) return;

    this.#selectionManager.setMultiple(data.multiPicker);
    this.#selectionManager.setSelection(data.selection ?? []);

    this.observe(this.#selectionManager.selection, (selection) => {
      this._selection = selection;
    });
  }

  #getFilteredBlocks(): BlipBlockViewModel[] {
    const blocks = this.data?.blocks ?? [];
    if (!this._searchTerm) return blocks;

    const term = this._searchTerm.toLowerCase();
    return blocks.filter((b) => b.label.toLowerCase().includes(term));
  }

  #onBlockClick(block: BlipBlockViewModel) {
    this.#selectionManager.toggleSelect(block.key);

    if (!this.data?.multiPicker) {
      this.#submit();
    }
  }

  #submit() {
    this.value = { selection: this.#selectionManager.getSelection() };
    this._submitModal();
  }

  override render() {
    return html`
      <umb-body-layout headline=${this.localize.term("blip_selectItems")}>
        <div id="main">
          <uui-input
            type="search"
            placeholder=${this.localize.term("blip_filterBlocks")}
            .value=${this._searchTerm}
            @input=${(e: InputEvent) => {
              this._searchTerm = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>

          <div id="block-list">
            ${this.#getFilteredBlocks().map((block) =>
              this.#renderBlock(block),
            )}
          </div>

          ${!this.data?.blocks?.length
            ? html`<p class="empty-state">
                ${this.localize.term("blip_noBlocks")}
              </p>`
            : nothing}
        </div>

        <div slot="actions">
          <uui-button
            label=${this.localize.term("general_close")}
            @click=${this._rejectModal}
          ></uui-button>
          ${this.data?.multiPicker
            ? html`
                <uui-button
                  look="primary"
                  color="positive"
                  label=${this.localize.term("general_submit")}
                  ?disabled=${this._selection.length === 0}
                  @click=${this.#submit}
                ></uui-button>
              `
            : nothing}
        </div>
      </umb-body-layout>
    `;
  }

  #toUfmValue(block: BlipBlockViewModel): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const v of block.value ?? []) {
      obj[v.alias] = v.value;
    }
    return obj;
  }

  #renderBlock(block: BlipBlockViewModel) {
    const isSelected = this.#selectionManager.isSelected(block.key);
    return html`
      <button
        type="button"
        class="block-item ${isSelected ? "selected" : ""}"
        @click=${() => this.#onBlockClick(block)}
      >
        <div class="block-item__icon">
          ${isSelected
            ? html`<uui-icon name="icon-check"></uui-icon>`
            : html`<umb-icon name=${block.icon}></umb-icon>`}
        </div>
        <div class="block-item__label">
          <umb-ufm-render inline .markdown=${block.label} .value=${this.#toUfmValue(block)}></umb-ufm-render>
        </div>
      </button>
    `;
  }

  static override styles = [
    css`
      #main {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-4);
      }

      uui-input {
        width: 100%;
      }

      #block-list {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-2);
      }

      .block-item {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3);
        padding: var(--uui-size-space-3) var(--uui-size-space-4);
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius);
        background: var(--uui-color-surface);
        cursor: pointer;
        text-align: left;
        width: 100%;
      }

      .block-item:hover {
        background: var(--uui-color-surface-emphasis);
      }

      .block-item.selected {
        border: 1px solid var(--uui-color-selected);
        box-shadow:
          0 0 4px 0 var(--uui-color-selected),
          inset 0 0 2px 0 var(--uui-color-selected);
      }

      .block-item__icon {
        flex-shrink: 0;
      }

      .block-item__label {
        flex-grow: 1;
      }

      .empty-state {
        text-align: center;
        color: var(--uui-color-text-alt);
        padding: var(--uui-size-space-6);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: BlipBlockPickerModalElement;
  }
}
