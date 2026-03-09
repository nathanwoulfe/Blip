import { UMB_AUTH_CONTEXT as se } from "@umbraco-cms/backoffice/auth";
import { property as q, state as m, css as ae, customElement as ne, html as b, repeat as le, when as A, ifDefined as ue } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ce, umbDestroyOnDisconnect as pe } from "@umbraco-cms/backoffice/lit-element";
import { UmbChangeEvent as de } from "@umbraco-cms/backoffice/event";
import { UmbSorterController as he } from "@umbraco-cms/backoffice/sorter";
import { UmbModalToken as me, UMB_MODAL_MANAGER_CONTEXT as ye } from "@umbraco-cms/backoffice/modal";
import { tryExecute as fe } from "@umbraco-cms/backoffice/resources";
import { UMB_VARIANT_CONTEXT as _e } from "@umbraco-cms/backoffice/variant";
import { UMB_BLOCK_LIST_MANAGER_CONTEXT as be, UMB_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS as ge, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as ve } from "@umbraco-cms/backoffice/block-list";
import { UMB_PROPERTY_CONTEXT as z } from "@umbraco-cms/backoffice/property";
import { loadManifestElement as Ee } from "@umbraco-cms/backoffice/extension-api";
import { umbExtensionsRegistry as xe } from "@umbraco-cms/backoffice/extension-registry";
import { UmbDocumentTypeItemRepository as Ce } from "@umbraco-cms/backoffice/document-type";
import { UmbModalRouteRegistrationController as we } from "@umbraco-cms/backoffice/router";
import { UMB_WORKSPACE_MODAL as ke } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE as Pe, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as Oe } from "@umbraco-cms/backoffice/document";
import { UmbFormControlMixin as Be, UmbValidationContext as Te, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as Se, extractJsonQueryProps as D } from "@umbraco-cms/backoffice/validation";
import { UmbBlockEntriesContext as Me, UmbBlockManagerContext as Ue } from "@umbraco-cms/backoffice/block";
import { UmbBooleanState as B } from "@umbraco-cms/backoffice/observable-api";
var Ae = async (e, t) => {
  let r = typeof t == "function" ? await t(e) : t;
  if (r) return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, Ie = { bodySerializer: (e) => JSON.stringify(e, (t, r) => typeof r == "bigint" ? r.toString() : r) }, Le = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, Re = (e) => {
  switch (e) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, $e = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, V = ({ allowReserved: e, explode: t, name: r, style: n, value: o }) => {
  if (!t) {
    let s = (e ? o : o.map((l) => encodeURIComponent(l))).join(Re(n));
    switch (n) {
      case "label":
        return `.${s}`;
      case "matrix":
        return `;${r}=${s}`;
      case "simple":
        return s;
      default:
        return `${r}=${s}`;
    }
  }
  let a = Le(n), i = o.map((s) => n === "label" || n === "simple" ? e ? s : encodeURIComponent(s) : T({ allowReserved: e, name: r, value: s })).join(a);
  return n === "label" || n === "matrix" ? a + i : i;
}, T = ({ allowReserved: e, name: t, value: r }) => {
  if (r == null) return "";
  if (typeof r == "object") throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
  return `${t}=${e ? r : encodeURIComponent(r)}`;
}, W = ({ allowReserved: e, explode: t, name: r, style: n, value: o, valueOnly: a }) => {
  if (o instanceof Date) return a ? o.toISOString() : `${r}=${o.toISOString()}`;
  if (n !== "deepObject" && !t) {
    let l = [];
    Object.entries(o).forEach(([_, k]) => {
      l = [...l, _, e ? k : encodeURIComponent(k)];
    });
    let h = l.join(",");
    switch (n) {
      case "form":
        return `${r}=${h}`;
      case "label":
        return `.${h}`;
      case "matrix":
        return `;${r}=${h}`;
      default:
        return h;
    }
  }
  let i = $e(n), s = Object.entries(o).map(([l, h]) => T({ allowReserved: e, name: n === "deepObject" ? `${r}[${l}]` : l, value: h })).join(i);
  return n === "label" || n === "matrix" ? i + s : s;
}, Ne = /\{[^{}]+\}/g, De = ({ path: e, url: t }) => {
  let r = t, n = t.match(Ne);
  if (n) for (let o of n) {
    let a = !1, i = o.substring(1, o.length - 1), s = "simple";
    i.endsWith("*") && (a = !0, i = i.substring(0, i.length - 1)), i.startsWith(".") ? (i = i.substring(1), s = "label") : i.startsWith(";") && (i = i.substring(1), s = "matrix");
    let l = e[i];
    if (l == null) continue;
    if (Array.isArray(l)) {
      r = r.replace(o, V({ explode: a, name: i, style: s, value: l }));
      continue;
    }
    if (typeof l == "object") {
      r = r.replace(o, W({ explode: a, name: i, style: s, value: l, valueOnly: !0 }));
      continue;
    }
    if (s === "matrix") {
      r = r.replace(o, `;${T({ name: i, value: l })}`);
      continue;
    }
    let h = encodeURIComponent(s === "label" ? `.${l}` : l);
    r = r.replace(o, h);
  }
  return r;
}, H = ({ allowReserved: e, array: t, object: r } = {}) => (n) => {
  let o = [];
  if (n && typeof n == "object") for (let a in n) {
    let i = n[a];
    if (i != null) if (Array.isArray(i)) {
      let s = V({ allowReserved: e, explode: !0, name: a, style: "form", value: i, ...t });
      s && o.push(s);
    } else if (typeof i == "object") {
      let s = W({ allowReserved: e, explode: !0, name: a, style: "deepObject", value: i, ...r });
      s && o.push(s);
    } else {
      let s = T({ allowReserved: e, name: a, value: i });
      s && o.push(s);
    }
  }
  return o.join("&");
}, Ke = (e) => {
  if (!e) return "stream";
  let t = e.split(";")[0]?.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json")) return "json";
    if (t === "multipart/form-data") return "formData";
    if (["application/", "audio/", "image/", "video/"].some((r) => t.startsWith(r))) return "blob";
    if (t.startsWith("text/")) return "text";
  }
}, je = async ({ security: e, ...t }) => {
  for (let r of e) {
    let n = await Ae(r, t.auth);
    if (!n) continue;
    let o = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[o] = n;
        break;
      case "cookie":
        t.headers.append("Cookie", `${o}=${n}`);
        break;
      default:
        t.headers.set(o, n);
        break;
    }
    return;
  }
}, K = (e) => qe({ baseUrl: e.baseUrl, path: e.path, query: e.query, querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : H(e.querySerializer), url: e.url }), qe = ({ baseUrl: e, path: t, query: r, querySerializer: n, url: o }) => {
  let a = o.startsWith("/") ? o : `/${o}`, i = (e ?? "") + a;
  t && (i = De({ path: t, url: i }));
  let s = r ? n(r) : "";
  return s.startsWith("?") && (s = s.substring(1)), s && (i += `?${s}`), i;
}, j = (e, t) => {
  let r = { ...e, ...t };
  return r.baseUrl?.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = Y(e.headers, t.headers), r;
}, Y = (...e) => {
  let t = new Headers();
  for (let r of e) {
    if (!r || typeof r != "object") continue;
    let n = r instanceof Headers ? r.entries() : Object.entries(r);
    for (let [o, a] of n) if (a === null) t.delete(o);
    else if (Array.isArray(a)) for (let i of a) t.append(o, i);
    else a !== void 0 && t.set(o, typeof a == "object" ? JSON.stringify(a) : a);
  }
  return t;
}, I = class {
  _fns;
  constructor() {
    this._fns = [];
  }
  clear() {
    this._fns = [];
  }
  getInterceptorIndex(e) {
    return typeof e == "number" ? this._fns[e] ? e : -1 : this._fns.indexOf(e);
  }
  exists(e) {
    let t = this.getInterceptorIndex(e);
    return !!this._fns[t];
  }
  eject(e) {
    let t = this.getInterceptorIndex(e);
    this._fns[t] && (this._fns[t] = null);
  }
  update(e, t) {
    let r = this.getInterceptorIndex(e);
    return this._fns[r] ? (this._fns[r] = t, e) : !1;
  }
  use(e) {
    return this._fns = [...this._fns, e], this._fns.length - 1;
  }
}, ze = () => ({ error: new I(), request: new I(), response: new I() }), Ve = H({ allowReserved: !1, array: { explode: !0, style: "form" }, object: { explode: !0, style: "deepObject" } }), We = { "Content-Type": "application/json" }, F = (e = {}) => ({ ...Ie, headers: We, parseAs: "auto", querySerializer: Ve, ...e }), He = (e = {}) => {
  let t = j(F(), e), r = () => ({ ...t }), n = (i) => (t = j(t, i), r()), o = ze(), a = async (i) => {
    let s = { ...t, ...i, fetch: i.fetch ?? t.fetch ?? globalThis.fetch, headers: Y(t.headers, i.headers) };
    s.security && await je({ ...s, security: s.security }), s.body && s.bodySerializer && (s.body = s.bodySerializer(s.body)), (s.body === void 0 || s.body === "") && s.headers.delete("Content-Type");
    let l = K(s), h = { redirect: "follow", ...s }, _ = new Request(l, h);
    for (let c of o.request._fns) c && (_ = await c(_, s));
    let k = s.fetch, u = await k(_);
    for (let c of o.response._fns) c && (u = await c(u, _, s));
    let P = { request: _, response: u };
    if (u.ok) {
      if (u.status === 204 || u.headers.get("Content-Length") === "0") return s.responseStyle === "data" ? {} : { data: {}, ...P };
      let c = (s.parseAs === "auto" ? Ke(u.headers.get("Content-Type")) : s.parseAs) ?? "json";
      if (c === "stream") return s.responseStyle === "data" ? u.body : { data: u.body, ...P };
      let E = await u[c]();
      return c === "json" && (s.responseValidator && await s.responseValidator(E), s.responseTransformer && (E = await s.responseTransformer(E))), s.responseStyle === "data" ? E : { data: E, ...P };
    }
    let O = await u.text();
    try {
      O = JSON.parse(O);
    } catch {
    }
    let v = O;
    for (let c of o.error._fns) c && (v = await c(O, u, _, s));
    if (v = v || {}, s.throwOnError) throw v;
    return s.responseStyle === "data" ? void 0 : { error: v, ...P };
  };
  return { buildUrl: K, connect: (i) => a({ ...i, method: "CONNECT" }), delete: (i) => a({ ...i, method: "DELETE" }), get: (i) => a({ ...i, method: "GET" }), getConfig: r, head: (i) => a({ ...i, method: "HEAD" }), interceptors: o, options: (i) => a({ ...i, method: "OPTIONS" }), patch: (i) => a({ ...i, method: "PATCH" }), post: (i) => a({ ...i, method: "POST" }), put: (i) => a({ ...i, method: "PUT" }), request: a, setConfig: n, trace: (i) => a({ ...i, method: "TRACE" }) };
};
const G = He(F({
  baseUrl: "http://localhost:34321",
  throwOnError: !0
}));
class Ye {
  static getUmbracoBlipManagementApiV1(t) {
    return (t?.client ?? G).get({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/blip/management/api/v1",
      ...t
    });
  }
}
const J = "NW.Blip", X = "Blip.PropertyEditorUi.BlockListItemPicker", Fe = {
  type: "propertyEditorSchema",
  name: "Block List Item Picker",
  alias: J,
  meta: {
    defaultPropertyEditorUiAlias: X,
    settings: {
      defaultData: [
        { alias: "minNumber", value: 0 },
        { alias: "maxNumber", value: 0 }
      ],
      properties: [
        {
          alias: "sourceNode",
          label: "Source Node",
          description: "Select the content node containing the Block List.",
          propertyEditorUiAlias: "Umb.PropertyEditorUi.DocumentPicker"
        },
        {
          alias: "sourceProperty",
          label: "Source Property",
          description: "The alias of the Block List property on the source node.",
          propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
        },
        {
          alias: "minNumber",
          label: "Minimum Items",
          description: "Minimum number of items required.",
          propertyEditorUiAlias: "Umb.PropertyEditorUi.Integer"
        },
        {
          alias: "maxNumber",
          label: "Maximum Items",
          description: "Maximum number of items allowed. Use 1 for single picker.",
          propertyEditorUiAlias: "Umb.PropertyEditorUi.Integer"
        }
      ]
    }
  }
}, Ge = [
  Fe,
  {
    type: "propertyEditorUi",
    alias: X,
    name: "Blip Block List Item Picker Property Editor UI",
    element: () => Promise.resolve().then(() => lt),
    meta: {
      label: "Block List Item Picker",
      icon: "icon-list",
      group: "pickers",
      supportsReadonly: !0,
      propertyEditorSchemaAlias: J
    }
  }
], Je = [
  {
    type: "modal",
    alias: "Blip.Modal.BlockPicker",
    name: "Blip Block Picker Modal",
    js: () => import("./blip-block-picker-modal.element.js")
  }
], Xe = [
  {
    type: "localization",
    alias: "Blip.Localization.En",
    weight: -100,
    name: "Blip Localization - English",
    meta: {
      culture: "en"
    },
    js: () => import("./en.js")
  }
], Qe = [...Ge, ...Je, ...Xe], Ze = new me("Blip.Modal.BlockPicker", {
  modal: { type: "sidebar", size: "medium" }
});
class et extends Me {
  constructor(t) {
    super(t, be), this.canCreate = new B(!1).asObservable(), this.hasExpose = new B(!0).asObservable();
  }
  _gotBlockManager() {
    this._manager && (this.observe(this._manager.layouts, (t) => {
      this._layoutEntries.setValue(t);
    }), this.observe(this.layoutEntries, (t) => {
      this._manager?.setLayouts(t);
    }));
  }
  getPathForCreateBlock() {
  }
  getPathForClipboard() {
  }
  async create() {
  }
  async insert(t, r, n, o) {
    return !1;
  }
  async _insertFromPropertyValue(t, r) {
    return r;
  }
  async delete(t) {
    this._layoutEntries.removeOne(t), this.getHostElement().dispatchEvent(
      new CustomEvent("blip:block-deleted", { detail: { contentKey: t } })
    );
  }
}
class tt extends Ue {
  constructor() {
    super(...arguments), this.inlineEditingModel = new B(!1).asObservable(), this.isSortMode = new B(!1).asObservable();
  }
  async createWithPresets(t, r) {
    return Promise.resolve(void 0);
  }
  // Required by base class. Not used in Blip (read-only picker).
  insert(t, r, n, o) {
    return !0;
  }
}
var rt = Object.defineProperty, S = (e, t, r, n) => {
  for (var o = void 0, a = e.length - 1, i; a >= 0; a--)
    (i = e[a]) && (o = i(t, r, o) || o);
  return o && rt(t, r, o), o;
};
class C extends Be(ce) {
  constructor() {
    super(), this.validationContext = new Te(this), this.managerContext = new tt(this), this.entriesContext = new et(this), this.consumeContext(z, (t) => {
      this.observe(t?.dataPath, (r) => {
        r && (this.validationContext.setDataPath(r), this.validationContext.autoReport());
      });
    }), this.addValidator(
      "rangeUnderflow",
      () => this.localize.term(
        "validation_entriesShort",
        this._limitMin,
        (this._limitMin ?? 0) - this.entriesContext.getLength()
      ),
      () => !!this._limitMin && this.entriesContext.getLength() < this._limitMin
    ), this.addValidator(
      "rangeOverflow",
      () => this.localize.term(
        "validation_entriesExceed",
        this._limitMax,
        this.entriesContext.getLength() - (this._limitMax || 0)
      ),
      () => !!this._limitMax && this.entriesContext.getLength() > this._limitMax
    ), this.addValidator(
      "valueMissing",
      () => this.mandatoryMessage ?? Se,
      () => this.mandatory ? (this.value?.length ?? 0) === 0 : !1
    ), this.observe(
      this.managerContext.layouts,
      (t) => {
        const r = [], n = t.map((a) => a.contentKey);
        this.validationContext.messages.getMessagesOfPathAndDescendant("$.contentData").forEach((a) => {
          const i = D(a.path).key;
          i && n.indexOf(i) === -1 && r.push(a.key);
        });
        const o = t.map((a) => a.settingsKey).filter((a) => a !== void 0);
        this.validationContext.messages.getMessagesOfPathAndDescendant("$.settingsData").forEach((a) => {
          const i = D(a.path).key;
          i && o.indexOf(i) === -1 && r.push(a.key);
        }), this.validationContext.messages.removeMessageByKeys(
          r
        );
      },
      null
    );
  }
}
S([
  q({ type: Boolean })
], C.prototype, "mandatory");
S([
  q({ type: String })
], C.prototype, "mandatoryMessage");
S([
  m()
], C.prototype, "_limitMin");
S([
  m()
], C.prototype, "_limitMax");
var it = Object.defineProperty, ot = Object.getOwnPropertyDescriptor, Q = (e) => {
  throw TypeError(e);
}, f = (e, t, r, n) => {
  for (var o = n > 1 ? void 0 : n ? ot(t, r) : t, a = e.length - 1, i; a >= 0; a--)
    (i = e[a]) && (o = (n ? i(t, r, o) : i(o)) || o);
  return n && o && it(t, r, o), o;
}, $ = (e, t, r) => t.has(e) || Q("Cannot " + r), g = (e, t, r) => ($(e, t, "read from private field"), r ? r.call(e) : t.get(e)), x = (e, t, r) => t.has(e) ? Q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), st = (e, t, r, n) => ($(e, t, "write to private field"), t.set(e, r), r), y = (e, t, r) => ($(e, t, "access private method"), r), M, N, w, L, d, Z, ee, te, U, re, ie, oe;
const at = {
  getUniqueOfElement: (e) => e.contentKey,
  getUniqueOfModel: (e) => e.contentKey,
  itemSelector: "umb-block-list-entry"
}, R = new CSSStyleSheet();
R.replaceSync(`
  uui-action-bar uui-button:not([label="delete"]) { display: none !important; }
  uui-action-bar uui-button[label="delete"] {
    --uui-button-border-radius: 50px !important;
    --uui-button-padding-left-factor: 2
  }
`);
const nt = "blip-property-editor-ui";
let p = class extends C {
  constructor() {
    super(), x(this, d), x(this, M, "umb://element/"), x(this, N, new Ce(this)), this._loading = !0, this._blocks = [], this._layouts = [], this._userCanEdit = !1, this._sourceNodeKey = "", this._multiPicker = !0, this._sourceProperty = "", x(this, w, []), x(this, L, new he(this, {
      ...at,
      onChange: ({ model: e }) => {
        this.entriesContext.setLayouts(e), y(this, d, U).call(this);
      }
    })), new we(this, ke).onSetup(() => ({
      data: { entityType: Pe, preset: {} }
    })).observeRouteBuilder(
      (e) => this._editPath = e({})
    ), this.consumeContext(_e, (e) => {
      this.observe(e?.displayVariantId, (t) => {
        this.managerContext.setVariantId(t);
      });
    }), this.observe(this.entriesContext.layoutEntries, (e) => {
      this._layouts = e, g(this, L).setModel(e), this.managerContext.setLayouts(e);
    }), this.consumeContext(z, (e) => {
      this.observe(e?.alias, (t) => {
        this.managerContext.setPropertyAlias(t);
      });
    }), this.addEventListener("blip:block-deleted", ((e) => {
      y(this, d, re).call(this, e.detail.contentKey);
    }));
  }
  set config(e) {
    e && (this._sourceNodeKey = e.getValueByAlias("sourceNode") ?? "", this._sourceProperty = e.getValueByAlias("sourceProperty") ?? "", this._limitMin = e.getValueByAlias("minNumber") ?? 0, this._limitMax = e.getValueByAlias("maxNumber") ?? 0, this._multiPicker = this._limitMax !== 1, y(this, d, ee).call(this));
  }
  async updated() {
    await customElements.whenDefined("umb-block-list-entry"), this.shadowRoot?.querySelectorAll("umb-block-list-entry").forEach((e) => {
      e.shadowRoot && !e.shadowRoot?.adoptedStyleSheets.includes(R) && (e.shadowRoot.adoptedStyleSheets = [
        ...e.shadowRoot.adoptedStyleSheets,
        R
      ]);
    });
  }
  render() {
    return this._loading ? b`<uui-loader></uui-loader>` : b`
      ${le(
      this._layouts,
      (e, t) => `${t}_${e.contentKey}`,
      (e, t) => b`
          <umb-block-list-entry
            index=${t}
            .contentKey=${e.contentKey}
            .layout=${e}
            ${pe()}
          >
          </umb-block-list-entry>
        `
    )}
      ${A(
      !this._blocks.length,
      () => b`<p class="empty-state">
            ${this.localize.term("blip_noBlocks")}
          </p>`
    )}

      <div>
        <uui-button-group>
          ${A(
      this._blocks.length,
      () => b` <uui-button
                look="placeholder"
                label=${this.localize.term("blip_addBlock")}
                @click=${y(this, d, ie)}
              ></uui-button>`
    )}
          ${A(
      this._userCanEdit,
      () => b`
              <uui-button
                compact
                look="placeholder"
                label=${this.localize.term("blip_manageBlocks")}
                href=${ue(y(this, d, oe).call(this))}
              >
                <uui-icon name="icon-edit"></uui-icon>
              </uui-button>
            `
    )}
        </uui-button-group>
      </div>
    `;
  }
};
M = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
L = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakSet();
Z = async function() {
  if (customElements.get("umb-block-list-entry")) return;
  const e = xe.getByAlias(
    ve
  );
  e?.element && await Ee(e.element);
};
ee = async function() {
  if (await y(this, d, Z).call(this), await this.managerContext.contentTypesLoaded, !this._sourceNodeKey || !this._sourceProperty) {
    this._loading = !1;
    return;
  }
  const { data: e } = await fe(
    this,
    Ye.getUmbracoBlipManagementApiV1({
      query: {
        key: this._sourceNodeKey,
        propertyAlias: this._sourceProperty
      }
    })
  );
  this._userCanEdit = e.canEdit;
  const t = e.sourceValue, r = e.blockConfiguration ?? [];
  this.managerContext.setBlockTypes(r), this.managerContext.setContents(t.contentData), this.managerContext.setSettings(t.settingsData), this.managerContext.setExposes(t.expose), st(this, w, t.layout?.[ge] ?? []), this.managerContext.setLayouts(y(this, d, te).call(this));
  const { data: n } = await g(this, N).requestItems(
    t.contentData.map((o) => o.contentTypeKey)
  );
  this._blocks = t.contentData.map((o) => {
    const a = r.find(
      (s) => s.contentElementTypeKey === o.contentTypeKey
    ), i = n?.find(
      (s) => s.unique === o.contentTypeKey
    );
    return {
      key: o.key,
      contentTypeKey: o.contentTypeKey,
      label: a?.label ?? i?.name ?? "Block",
      icon: i?.icon ?? "icon-document",
      value: o.values
    };
  }), this._loading = !1;
};
te = function() {
  return (this.value ?? []).map((e) => {
    const t = e.replace(g(this, M), "");
    return g(this, w).find((r) => r.contentKey === t);
  }).filter((e) => e !== void 0);
};
U = function() {
  this.value = this._layouts.map(
    (e) => `${g(this, M)}${e.contentKey}`
  ), this.dispatchEvent(new de());
};
re = function(e) {
  const t = this._layouts.filter((r) => r.contentKey !== e);
  this.entriesContext.setLayouts(t), y(this, d, U).call(this);
};
ie = async function() {
  const e = await this.getContext(ye);
  if (!e) return;
  const t = e.open(this, Ze, {
    data: {
      blocks: this._blocks,
      multiPicker: this._multiPicker,
      selection: this._layouts.map((r) => r.contentKey)
    }
  });
  try {
    const r = await t.onSubmit();
    if (r.selection) {
      const n = r.selection.map(
        (o) => g(this, w).find((a) => a.contentKey === o)
      ).filter((o) => o !== void 0);
      this.entriesContext.setLayouts(n), y(this, d, U).call(this);
    }
  } catch {
  }
};
oe = function() {
  if (!this._sourceNodeKey) return;
  const e = Oe.generateLocal({
    unique: this._sourceNodeKey
  });
  return `${this._editPath}/${e}`;
};
p.styles = [
  ae`
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
    `
];
f([
  m()
], p.prototype, "_loading", 2);
f([
  m()
], p.prototype, "_blocks", 2);
f([
  m()
], p.prototype, "_layouts", 2);
f([
  m()
], p.prototype, "_userCanEdit", 2);
f([
  m()
], p.prototype, "_sourceNodeKey", 2);
f([
  m()
], p.prototype, "_editPath", 2);
f([
  m()
], p.prototype, "_multiPicker", 2);
f([
  m()
], p.prototype, "_sourceProperty", 2);
p = f([
  ne(nt)
], p);
const lt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get default() {
    return p;
  }
}, Symbol.toStringTag, { value: "Module" })), Bt = (e, t) => {
  t.registerMany(Qe), e.consumeContext(se, async (r) => {
    if (!r) return;
    const n = r?.getOpenApiConfiguration();
    G.setConfig({
      baseUrl: n?.base ?? "",
      auth: n?.token ?? void 0,
      credentials: n?.credentials ?? "same-origin"
    });
  });
};
export {
  J as BLIP_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS,
  X as BLIP_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS,
  Bt as onInit
};
//# sourceMappingURL=blip.js.map
