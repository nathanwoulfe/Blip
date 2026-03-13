import { UMB_AUTH_CONTEXT as se } from "@umbraco-cms/backoffice/auth";
import { property as q, state as h, css as ae, customElement as ne, html as b, repeat as le, when as A, ifDefined as ue } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ce, umbDestroyOnDisconnect as pe } from "@umbraco-cms/backoffice/lit-element";
import { UmbChangeEvent as de } from "@umbraco-cms/backoffice/event";
import { UmbSorterController as he } from "@umbraco-cms/backoffice/sorter";
import { UmbModalToken as me, UMB_MODAL_MANAGER_CONTEXT as ye } from "@umbraco-cms/backoffice/modal";
import { tryExecute as fe, UmbApiError as _e } from "@umbraco-cms/backoffice/resources";
import { UMB_NOTIFICATION_CONTEXT as be } from "@umbraco-cms/backoffice/notification";
import { UMB_VARIANT_CONTEXT as ge } from "@umbraco-cms/backoffice/variant";
import { UMB_BLOCK_LIST_MANAGER_CONTEXT as ve, UMB_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS as Ee, UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS as Ce } from "@umbraco-cms/backoffice/block-list";
import { UMB_PROPERTY_CONTEXT as z } from "@umbraco-cms/backoffice/property";
import { loadManifestElement as xe } from "@umbraco-cms/backoffice/extension-api";
import { umbExtensionsRegistry as we } from "@umbraco-cms/backoffice/extension-registry";
import { UmbDocumentTypeItemRepository as ke } from "@umbraco-cms/backoffice/document-type";
import { UmbModalRouteRegistrationController as Oe } from "@umbraco-cms/backoffice/router";
import { UMB_WORKSPACE_MODAL as Pe } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE as Te, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as Be } from "@umbraco-cms/backoffice/document";
import { UmbFormControlMixin as Me, UmbValidationContext as Se, UMB_VALIDATION_EMPTY_LOCALIZATION_KEY as Ue, extractJsonQueryProps as D } from "@umbraco-cms/backoffice/validation";
import { UmbBlockEntriesContext as Ae, UmbBlockManagerContext as Ie } from "@umbraco-cms/backoffice/block";
import { UmbBooleanState as T } from "@umbraco-cms/backoffice/observable-api";
var Le = async (e, t) => {
  let r = typeof t == "function" ? await t(e) : t;
  if (r) return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, Re = { bodySerializer: (e) => JSON.stringify(e, (t, r) => typeof r == "bigint" ? r.toString() : r) }, $e = (e) => {
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
}, Ne = (e) => {
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
}, De = (e) => {
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
}, V = ({ allowReserved: e, explode: t, name: r, style: n, value: a }) => {
  if (!t) {
    let s = (e ? a : a.map((l) => encodeURIComponent(l))).join(Ne(n));
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
  let o = $e(n), i = a.map((s) => n === "label" || n === "simple" ? e ? s : encodeURIComponent(s) : B({ allowReserved: e, name: r, value: s })).join(o);
  return n === "label" || n === "matrix" ? o + i : i;
}, B = ({ allowReserved: e, name: t, value: r }) => {
  if (r == null) return "";
  if (typeof r == "object") throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
  return `${t}=${e ? r : encodeURIComponent(r)}`;
}, W = ({ allowReserved: e, explode: t, name: r, style: n, value: a, valueOnly: o }) => {
  if (a instanceof Date) return o ? a.toISOString() : `${r}=${a.toISOString()}`;
  if (n !== "deepObject" && !t) {
    let l = [];
    Object.entries(a).forEach(([_, k]) => {
      l = [...l, _, e ? k : encodeURIComponent(k)];
    });
    let m = l.join(",");
    switch (n) {
      case "form":
        return `${r}=${m}`;
      case "label":
        return `.${m}`;
      case "matrix":
        return `;${r}=${m}`;
      default:
        return m;
    }
  }
  let i = De(n), s = Object.entries(a).map(([l, m]) => B({ allowReserved: e, name: n === "deepObject" ? `${r}[${l}]` : l, value: m })).join(i);
  return n === "label" || n === "matrix" ? i + s : s;
}, Ke = /\{[^{}]+\}/g, je = ({ path: e, url: t }) => {
  let r = t, n = t.match(Ke);
  if (n) for (let a of n) {
    let o = !1, i = a.substring(1, a.length - 1), s = "simple";
    i.endsWith("*") && (o = !0, i = i.substring(0, i.length - 1)), i.startsWith(".") ? (i = i.substring(1), s = "label") : i.startsWith(";") && (i = i.substring(1), s = "matrix");
    let l = e[i];
    if (l == null) continue;
    if (Array.isArray(l)) {
      r = r.replace(a, V({ explode: o, name: i, style: s, value: l }));
      continue;
    }
    if (typeof l == "object") {
      r = r.replace(a, W({ explode: o, name: i, style: s, value: l, valueOnly: !0 }));
      continue;
    }
    if (s === "matrix") {
      r = r.replace(a, `;${B({ name: i, value: l })}`);
      continue;
    }
    let m = encodeURIComponent(s === "label" ? `.${l}` : l);
    r = r.replace(a, m);
  }
  return r;
}, H = ({ allowReserved: e, array: t, object: r } = {}) => (n) => {
  let a = [];
  if (n && typeof n == "object") for (let o in n) {
    let i = n[o];
    if (i != null) if (Array.isArray(i)) {
      let s = V({ allowReserved: e, explode: !0, name: o, style: "form", value: i, ...t });
      s && a.push(s);
    } else if (typeof i == "object") {
      let s = W({ allowReserved: e, explode: !0, name: o, style: "deepObject", value: i, ...r });
      s && a.push(s);
    } else {
      let s = B({ allowReserved: e, name: o, value: i });
      s && a.push(s);
    }
  }
  return a.join("&");
}, qe = (e) => {
  if (!e) return "stream";
  let t = e.split(";")[0]?.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json")) return "json";
    if (t === "multipart/form-data") return "formData";
    if (["application/", "audio/", "image/", "video/"].some((r) => t.startsWith(r))) return "blob";
    if (t.startsWith("text/")) return "text";
  }
}, ze = async ({ security: e, ...t }) => {
  for (let r of e) {
    let n = await Le(r, t.auth);
    if (!n) continue;
    let a = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[a] = n;
        break;
      case "cookie":
        t.headers.append("Cookie", `${a}=${n}`);
        break;
      default:
        t.headers.set(a, n);
        break;
    }
    return;
  }
}, K = (e) => Ve({ baseUrl: e.baseUrl, path: e.path, query: e.query, querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : H(e.querySerializer), url: e.url }), Ve = ({ baseUrl: e, path: t, query: r, querySerializer: n, url: a }) => {
  let o = a.startsWith("/") ? a : `/${a}`, i = (e ?? "") + o;
  t && (i = je({ path: t, url: i }));
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
    for (let [a, o] of n) if (o === null) t.delete(a);
    else if (Array.isArray(o)) for (let i of o) t.append(a, i);
    else o !== void 0 && t.set(a, typeof o == "object" ? JSON.stringify(o) : o);
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
}, We = () => ({ error: new I(), request: new I(), response: new I() }), He = H({ allowReserved: !1, array: { explode: !0, style: "form" }, object: { explode: !0, style: "deepObject" } }), Ye = { "Content-Type": "application/json" }, F = (e = {}) => ({ ...Re, headers: Ye, parseAs: "auto", querySerializer: He, ...e }), Fe = (e = {}) => {
  let t = j(F(), e), r = () => ({ ...t }), n = (i) => (t = j(t, i), r()), a = We(), o = async (i) => {
    let s = { ...t, ...i, fetch: i.fetch ?? t.fetch ?? globalThis.fetch, headers: Y(t.headers, i.headers) };
    s.security && await ze({ ...s, security: s.security }), s.body && s.bodySerializer && (s.body = s.bodySerializer(s.body)), (s.body === void 0 || s.body === "") && s.headers.delete("Content-Type");
    let l = K(s), m = { redirect: "follow", ...s }, _ = new Request(l, m);
    for (let p of a.request._fns) p && (_ = await p(_, s));
    let k = s.fetch, c = await k(_);
    for (let p of a.response._fns) p && (c = await p(c, _, s));
    let O = { request: _, response: c };
    if (c.ok) {
      if (c.status === 204 || c.headers.get("Content-Length") === "0") return s.responseStyle === "data" ? {} : { data: {}, ...O };
      let p = (s.parseAs === "auto" ? qe(c.headers.get("Content-Type")) : s.parseAs) ?? "json";
      if (p === "stream") return s.responseStyle === "data" ? c.body : { data: c.body, ...O };
      let E = await c[p]();
      return p === "json" && (s.responseValidator && await s.responseValidator(E), s.responseTransformer && (E = await s.responseTransformer(E))), s.responseStyle === "data" ? E : { data: E, ...O };
    }
    let P = await c.text();
    try {
      P = JSON.parse(P);
    } catch {
    }
    let v = P;
    for (let p of a.error._fns) p && (v = await p(P, c, _, s));
    if (v = v || {}, s.throwOnError) throw v;
    return s.responseStyle === "data" ? void 0 : { error: v, ...O };
  };
  return { buildUrl: K, connect: (i) => o({ ...i, method: "CONNECT" }), delete: (i) => o({ ...i, method: "DELETE" }), get: (i) => o({ ...i, method: "GET" }), getConfig: r, head: (i) => o({ ...i, method: "HEAD" }), interceptors: a, options: (i) => o({ ...i, method: "OPTIONS" }), patch: (i) => o({ ...i, method: "PATCH" }), post: (i) => o({ ...i, method: "POST" }), put: (i) => o({ ...i, method: "PUT" }), request: o, setConfig: n, trace: (i) => o({ ...i, method: "TRACE" }) };
};
const G = Fe(F({
  baseUrl: "http://localhost:34321",
  throwOnError: !0
}));
class Ge {
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
const X = "NW.Blip", J = "Blip.PropertyEditorUi.BlockListItemPicker", Xe = {
  type: "propertyEditorSchema",
  name: "Block List Item Picker",
  alias: X,
  meta: {
    defaultPropertyEditorUiAlias: J,
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
}, Je = [
  Xe,
  {
    type: "propertyEditorUi",
    alias: J,
    name: "Blip Block List Item Picker Property Editor UI",
    element: () => Promise.resolve().then(() => ct),
    meta: {
      label: "Block List Item Picker",
      icon: "icon-list",
      group: "pickers",
      supportsReadonly: !0,
      propertyEditorSchemaAlias: X
    }
  }
], Qe = [
  {
    type: "modal",
    alias: "Blip.Modal.BlockPicker",
    name: "Blip Block Picker Modal",
    js: () => import("./blip-block-picker-modal.element.js")
  }
], Ze = [
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
], et = [...Je, ...Qe, ...Ze], tt = new me("Blip.Modal.BlockPicker", {
  modal: { type: "sidebar", size: "medium" }
});
class rt extends Ae {
  constructor(t) {
    super(t, ve), this.canCreate = new T(!1).asObservable(), this.hasExpose = new T(!0).asObservable();
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
  async insert(t, r, n, a) {
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
class it extends Ie {
  constructor() {
    super(...arguments), this.inlineEditingModel = new T(!1).asObservable(), this.isSortMode = new T(!1).asObservable();
  }
  async createWithPresets(t, r) {
    return Promise.resolve(void 0);
  }
  // Required by base class. Not used in Blip (read-only picker).
  insert(t, r, n, a) {
    return !0;
  }
}
var ot = Object.defineProperty, M = (e, t, r, n) => {
  for (var a = void 0, o = e.length - 1, i; o >= 0; o--)
    (i = e[o]) && (a = i(t, r, a) || a);
  return a && ot(t, r, a), a;
};
class x extends Me(ce) {
  constructor() {
    super(), this.validationContext = new Se(this), this.managerContext = new it(this), this.entriesContext = new rt(this), this.consumeContext(z, (t) => {
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
      () => this.mandatoryMessage ?? Ue,
      () => this.mandatory ? (this.value?.length ?? 0) === 0 : !1
    ), this.observe(
      this.managerContext.layouts,
      (t) => {
        const r = [], n = t.map((o) => o.contentKey);
        this.validationContext.messages.getMessagesOfPathAndDescendant("$.contentData").forEach((o) => {
          const i = D(o.path).key;
          i && n.indexOf(i) === -1 && r.push(o.key);
        });
        const a = t.map((o) => o.settingsKey).filter((o) => o !== void 0);
        this.validationContext.messages.getMessagesOfPathAndDescendant("$.settingsData").forEach((o) => {
          const i = D(o.path).key;
          i && a.indexOf(i) === -1 && r.push(o.key);
        }), this.validationContext.messages.removeMessageByKeys(
          r
        );
      },
      null
    );
  }
}
M([
  q({ type: Boolean })
], x.prototype, "mandatory");
M([
  q({ type: String })
], x.prototype, "mandatoryMessage");
M([
  h()
], x.prototype, "_limitMin");
M([
  h()
], x.prototype, "_limitMax");
var st = Object.defineProperty, at = Object.getOwnPropertyDescriptor, Q = (e) => {
  throw TypeError(e);
}, y = (e, t, r, n) => {
  for (var a = n > 1 ? void 0 : n ? at(t, r) : t, o = e.length - 1, i; o >= 0; o--)
    (i = e[o]) && (a = (n ? i(t, r, a) : i(a)) || a);
  return n && a && st(t, r, a), a;
}, $ = (e, t, r) => t.has(e) || Q("Cannot " + r), g = (e, t, r) => ($(e, t, "read from private field"), r ? r.call(e) : t.get(e)), C = (e, t, r) => t.has(e) ? Q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), nt = (e, t, r, n) => ($(e, t, "write to private field"), t.set(e, r), r), f = (e, t, r) => ($(e, t, "access private method"), r), S, N, w, L, d, Z, ee, te, U, re, ie, oe;
const lt = {
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
const ut = "blip-property-editor-ui";
let u = class extends x {
  constructor() {
    super(), C(this, d), C(this, S, "umb://element/"), C(this, N, new ke(this)), this._loading = !0, this._blocks = [], this._layouts = [], this._userCanEdit = !1, this._sourceNodeKey = "", this._multiPicker = !0, this._sourceProperty = "", this._culture = null, C(this, w, []), C(this, L, new he(this, {
      ...lt,
      onChange: ({ model: e }) => {
        this.entriesContext.setLayouts(e), f(this, d, U).call(this);
      }
    })), new Oe(this, Pe).onSetup(() => ({
      data: { entityType: Te, preset: {} }
    })).observeRouteBuilder(
      (e) => this._editPath = e({})
    ), this.consumeContext(ge, (e) => {
      this.observe(e?.displayVariantId, (t) => {
        this.managerContext.setVariantId(t);
      }), this.observe(e?.displayCulture, (t) => {
        t && (this._culture = t, this._sourceNodeKey && f(this, d, ee).call(this));
      });
    }), this.observe(this.entriesContext.layoutEntries, (e) => {
      this._layouts = e, g(this, L).setModel(e), this.managerContext.setLayouts(e);
    }), this.consumeContext(z, (e) => {
      this.observe(e?.alias, (t) => {
        this.managerContext.setPropertyAlias(t);
      });
    }), this.addEventListener("blip:block-deleted", ((e) => {
      f(this, d, re).call(this, e.detail.contentKey);
    }));
  }
  set config(e) {
    e && (this._sourceNodeKey = e.getValueByAlias("sourceNode") ?? "", this._sourceProperty = e.getValueByAlias("sourceProperty") ?? "", this._limitMin = e.getValueByAlias("minNumber") ?? 0, this._limitMax = e.getValueByAlias("maxNumber") ?? 0, this._multiPicker = this._limitMax !== 1);
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
                @click=${f(this, d, ie)}
              ></uui-button>`
    )}
          ${A(
      this._userCanEdit,
      () => b`
              <uui-button
                compact
                look="placeholder"
                label=${this.localize.term("blip_manageBlocks")}
                href=${ue(f(this, d, oe).call(this))}
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
S = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
L = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakSet();
Z = async function() {
  if (customElements.get("umb-block-list-entry")) return;
  const e = we.getByAlias(
    Ce
  );
  e?.element && await xe(e.element);
};
ee = async function() {
  if (await f(this, d, Z).call(this), await this.managerContext.contentTypesLoaded, !this._sourceNodeKey || !this._sourceProperty) {
    this._loading = !1;
    return;
  }
  const { data: e, error: t } = await fe(
    this,
    Ge.getUmbracoBlipManagementApiV1({
      query: {
        key: this._sourceNodeKey,
        propertyAlias: this._sourceProperty,
        culture: this._culture ?? void 0
      }
    })
  );
  if (t) {
    _e.isUmbApiError(t) && (await this.getContext(
      be
    ))?.peek("danger", {
      data: {
        headline: t.problemDetails.title,
        message: t.problemDetails.detail ?? ""
      }
    }), this._loading = !1;
    return;
  }
  this._userCanEdit = e.canEdit;
  const r = e.sourceValue, n = e.blockConfiguration ?? [];
  this.managerContext.setBlockTypes(n), this.managerContext.setContents(r.contentData), this.managerContext.setSettings(r.settingsData), this.managerContext.setExposes(r.expose), nt(this, w, r.layout?.[Ee] ?? []), this.managerContext.setLayouts(f(this, d, te).call(this));
  const { data: a } = await g(this, N).requestItems(
    r.contentData.map((o) => o.contentTypeKey)
  );
  this._blocks = r.contentData.map((o) => {
    const i = n.find(
      (l) => l.contentElementTypeKey === o.contentTypeKey
    ), s = a?.find(
      (l) => l.unique === o.contentTypeKey
    );
    return {
      key: o.key,
      contentTypeKey: o.contentTypeKey,
      label: i?.label ?? s?.name ?? "Block",
      icon: s?.icon ?? "icon-document",
      value: o.values.filter(
        (l) => l.culture == null || l.culture === this._culture
      )
    };
  }), this._loading = !1;
};
te = function() {
  return (this.value ?? []).map((e) => {
    const t = e.replace(g(this, S), "");
    return g(this, w).find((r) => r.contentKey === t);
  }).filter((e) => e !== void 0);
};
U = function() {
  this.value = this._layouts.map(
    (e) => `${g(this, S)}${e.contentKey}`
  ), this.dispatchEvent(new de());
};
re = function(e) {
  const t = this._layouts.filter((r) => r.contentKey !== e);
  this.entriesContext.setLayouts(t), f(this, d, U).call(this);
};
ie = async function() {
  const e = await this.getContext(ye);
  if (!e) return;
  const t = e.open(this, tt, {
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
        (a) => g(this, w).find((o) => o.contentKey === a)
      ).filter((a) => a !== void 0);
      this.entriesContext.setLayouts(n), f(this, d, U).call(this);
    }
  } catch {
  }
};
oe = function() {
  if (!this._sourceNodeKey) return;
  const e = Be.generateLocal({
    unique: this._sourceNodeKey
  });
  return `${this._editPath}/${e}`;
};
u.styles = [
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
y([
  h()
], u.prototype, "_loading", 2);
y([
  h()
], u.prototype, "_blocks", 2);
y([
  h()
], u.prototype, "_layouts", 2);
y([
  h()
], u.prototype, "_userCanEdit", 2);
y([
  h()
], u.prototype, "_sourceNodeKey", 2);
y([
  h()
], u.prototype, "_editPath", 2);
y([
  h()
], u.prototype, "_multiPicker", 2);
y([
  h()
], u.prototype, "_sourceProperty", 2);
y([
  h()
], u.prototype, "_culture", 2);
u = y([
  ne(ut)
], u);
const ct = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get default() {
    return u;
  }
}, Symbol.toStringTag, { value: "Module" })), St = (e, t) => {
  t.registerMany(et), e.consumeContext(se, async (r) => {
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
  X as BLIP_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS,
  J as BLIP_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS,
  St as onInit
};
//# sourceMappingURL=blip.js.map
