import { nothing as v, html as o, css as w, state as b, customElement as z } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as B } from "@umbraco-cms/backoffice/modal";
import { UmbSelectionManager as M } from "@umbraco-cms/backoffice/utils";
var C = Object.defineProperty, P = Object.getOwnPropertyDescriptor, f = (e) => {
  throw TypeError(e);
}, p = (e, t, i, u) => {
  for (var a = u > 1 ? void 0 : u ? P(t, i) : t, d = e.length - 1, h; d >= 0; d--)
    (h = e[d]) && (a = (u ? h(t, i, a) : h(a)) || a);
  return u && a && C(t, i, a), a;
}, k = (e, t, i) => t.has(e) || f("Cannot " + i), r = (e, t, i) => (k(e, t, "read from private field"), i ? i.call(e) : t.get(e)), _ = (e, t, i) => t.has(e) ? f("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), c = (e, t, i) => (k(e, t, "access private method"), i), l, s, g, $, m, x, y;
const S = "blip-block-picker-modal";
let n = class extends B {
  constructor() {
    super(...arguments), _(this, s), this._searchTerm = "", this._selection = [], _(this, l, new M(this));
  }
  connectedCallback() {
    super.connectedCallback();
    const e = this.data;
    e && (r(this, l).setMultiple(e.multiPicker), r(this, l).setSelection(e.selection ?? []), this.observe(r(this, l).selection, (t) => {
      this._selection = t;
    }));
  }
  render() {
    return o`
      <umb-body-layout headline=${this.localize.term("blip_selectItems")}>
        <div id="main">
          <uui-input
            type="search"
            placeholder=${this.localize.term("blip_filterBlocks")}
            .value=${this._searchTerm}
            @input=${(e) => {
      this._searchTerm = e.target.value;
    }}
          ></uui-input>

          <div id="block-list">
            ${c(this, s, g).call(this).map(
      (e) => c(this, s, y).call(this, e)
    )}
          </div>

          ${this.data?.blocks?.length ? v : o`<p class="empty-state">
                ${this.localize.term("blip_noBlocks")}
              </p>`}
        </div>

        <div slot="actions">
          <uui-button
            label=${this.localize.term("general_close")}
            @click=${this._rejectModal}
          ></uui-button>
          ${this.data?.multiPicker ? o`
                <uui-button
                  look="primary"
                  color="positive"
                  label=${this.localize.term("general_submit")}
                  ?disabled=${this._selection.length === 0}
                  @click=${c(this, s, m)}
                ></uui-button>
              ` : v}
        </div>
      </umb-body-layout>
    `;
  }
};
l = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
g = function() {
  const e = this.data?.blocks ?? [];
  if (!this._searchTerm) return e;
  const t = this._searchTerm.toLowerCase();
  return e.filter((i) => i.label.toLowerCase().includes(t));
};
$ = function(e) {
  r(this, l).toggleSelect(e.udi), this.data?.multiPicker || c(this, s, m).call(this);
};
m = function() {
  this.value = { selection: r(this, l).getSelection() }, this._submitModal();
};
x = function(e) {
  const t = {};
  for (const i of e.value ?? [])
    t[i.alias] = i.value;
  return t;
};
y = function(e) {
  const t = r(this, l).isSelected(e.udi);
  return o`
      <button
        type="button"
        class="block-item ${t ? "selected" : ""}"
        @click=${() => c(this, s, $).call(this, e)}
      >
        <div class="block-item__icon">
          ${t ? o`<uui-icon name="icon-check"></uui-icon>` : o`<umb-icon name=${e.icon}></umb-icon>`}
        </div>
        <div class="block-item__label">
          <umb-ufm-render inline .markdown=${e.label} .value=${c(this, s, x).call(this, e)}></umb-ufm-render>
        </div>
      </button>
    `;
};
n.styles = [
  w`
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
    `
];
p([
  b()
], n.prototype, "_searchTerm", 2);
p([
  b()
], n.prototype, "_selection", 2);
n = p([
  z(S)
], n);
export {
  n as default
};
//# sourceMappingURL=blip-block-picker-modal.element.js.map
