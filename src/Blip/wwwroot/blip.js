import { UMB_AUTH_CONTEXT as ie } from "@umbraco-cms/backoffice/auth";
import { css as se, state as S, customElement as ae, html as w, nothing as k, repeat as oe } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ne, umbDestroyOnDisconnect as le } from "@umbraco-cms/backoffice/lit-element";
import { UmbChangeEvent as ue } from "@umbraco-cms/backoffice/event";
import { UmbSorterController as ce } from "@umbraco-cms/backoffice/sorter";
import { UmbModalToken as pe, UMB_MODAL_MANAGER_CONTEXT as de } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentDetailRepository as me } from "@umbraco-cms/backoffice/document";
import { UmbDocumentTypeItemRepository as he } from "@umbraco-cms/backoffice/document-type";
import { UmbDataTypeDetailRepository as ye } from "@umbraco-cms/backoffice/data-type";
import { tryExecute as fe } from "@umbraco-cms/backoffice/resources";
import { UMB_VARIANT_CONTEXT as be } from "@umbraco-cms/backoffice/variant";
import { UmbBlockManagerContext as _e, UmbBlockEntriesContext as ge, UMB_BLOCK_MANAGER_CONTEXT as ve } from "@umbraco-cms/backoffice/block";
import { UmbBooleanState as K } from "@umbraco-cms/backoffice/observable-api";
var we = async (e, t) => {
  let r = typeof t == "function" ? await t(e) : t;
  if (r) return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, ke = { bodySerializer: (e) => JSON.stringify(e, (t, r) => typeof r == "bigint" ? r.toString() : r) }, Ee = (e) => {
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
}, xe = (e) => {
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
}, Be = (e) => {
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
}, q = ({ allowReserved: e, explode: t, name: r, style: a, value: o }) => {
  if (!t) {
    let s = (e ? o : o.map((u) => encodeURIComponent(u))).join(xe(a));
    switch (a) {
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
  let n = Ee(a), i = o.map((s) => a === "label" || a === "simple" ? e ? s : encodeURIComponent(s) : U({ allowReserved: e, name: r, value: s })).join(n);
  return a === "label" || a === "matrix" ? n + i : i;
}, U = ({ allowReserved: e, name: t, value: r }) => {
  if (r == null) return "";
  if (typeof r == "object") throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
  return `${t}=${e ? r : encodeURIComponent(r)}`;
}, D = ({ allowReserved: e, explode: t, name: r, style: a, value: o, valueOnly: n }) => {
  if (o instanceof Date) return n ? o.toISOString() : `${r}=${o.toISOString()}`;
  if (a !== "deepObject" && !t) {
    let u = [];
    Object.entries(o).forEach(([l, p]) => {
      u = [...u, l, e ? p : encodeURIComponent(p)];
    });
    let h = u.join(",");
    switch (a) {
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
  let i = Be(a), s = Object.entries(o).map(([u, h]) => U({ allowReserved: e, name: a === "deepObject" ? `${r}[${u}]` : u, value: h })).join(i);
  return a === "label" || a === "matrix" ? i + s : s;
}, Se = /\{[^{}]+\}/g, Ce = ({ path: e, url: t }) => {
  let r = t, a = t.match(Se);
  if (a) for (let o of a) {
    let n = !1, i = o.substring(1, o.length - 1), s = "simple";
    i.endsWith("*") && (n = !0, i = i.substring(0, i.length - 1)), i.startsWith(".") ? (i = i.substring(1), s = "label") : i.startsWith(";") && (i = i.substring(1), s = "matrix");
    let u = e[i];
    if (u == null) continue;
    if (Array.isArray(u)) {
      r = r.replace(o, q({ explode: n, name: i, style: s, value: u }));
      continue;
    }
    if (typeof u == "object") {
      r = r.replace(o, D({ explode: n, name: i, style: s, value: u, valueOnly: !0 }));
      continue;
    }
    if (s === "matrix") {
      r = r.replace(o, `;${U({ name: i, value: u })}`);
      continue;
    }
    let h = encodeURIComponent(s === "label" ? `.${u}` : u);
    r = r.replace(o, h);
  }
  return r;
}, z = ({ allowReserved: e, array: t, object: r } = {}) => (a) => {
  let o = [];
  if (a && typeof a == "object") for (let n in a) {
    let i = a[n];
    if (i != null) if (Array.isArray(i)) {
      let s = q({ allowReserved: e, explode: !0, name: n, style: "form", value: i, ...t });
      s && o.push(s);
    } else if (typeof i == "object") {
      let s = D({ allowReserved: e, explode: !0, name: n, style: "deepObject", value: i, ...r });
      s && o.push(s);
    } else {
      let s = U({ allowReserved: e, name: n, value: i });
      s && o.push(s);
    }
  }
  return o.join("&");
}, Te = (e) => {
  if (!e) return "stream";
  let t = e.split(";")[0]?.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json")) return "json";
    if (t === "multipart/form-data") return "formData";
    if (["application/", "audio/", "image/", "video/"].some((r) => t.startsWith(r))) return "blob";
    if (t.startsWith("text/")) return "text";
  }
}, Ue = async ({ security: e, ...t }) => {
  for (let r of e) {
    let a = await we(r, t.auth);
    if (!a) continue;
    let o = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[o] = a;
        break;
      case "cookie":
        t.headers.append("Cookie", `${o}=${a}`);
        break;
      default:
        t.headers.set(o, a);
        break;
    }
    return;
  }
}, L = (e) => $e({ baseUrl: e.baseUrl, path: e.path, query: e.query, querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : z(e.querySerializer), url: e.url }), $e = ({ baseUrl: e, path: t, query: r, querySerializer: a, url: o }) => {
  let n = o.startsWith("/") ? o : `/${o}`, i = (e ?? "") + n;
  t && (i = Ce({ path: t, url: i }));
  let s = r ? a(r) : "";
  return s.startsWith("?") && (s = s.substring(1)), s && (i += `?${s}`), i;
}, j = (e, t) => {
  let r = { ...e, ...t };
  return r.baseUrl?.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = V(e.headers, t.headers), r;
}, V = (...e) => {
  let t = new Headers();
  for (let r of e) {
    if (!r || typeof r != "object") continue;
    let a = r instanceof Headers ? r.entries() : Object.entries(r);
    for (let [o, n] of a) if (n === null) t.delete(o);
    else if (Array.isArray(n)) for (let i of n) t.append(o, i);
    else n !== void 0 && t.set(o, typeof n == "object" ? JSON.stringify(n) : n);
  }
  return t;
}, P = class {
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
}, Pe = () => ({ error: new P(), request: new P(), response: new P() }), Ae = z({ allowReserved: !1, array: { explode: !0, style: "form" }, object: { explode: !0, style: "deepObject" } }), Oe = { "Content-Type": "application/json" }, W = (e = {}) => ({ ...ke, headers: Oe, parseAs: "auto", querySerializer: Ae, ...e }), Ie = (e = {}) => {
  let t = j(W(), e), r = () => ({ ...t }), a = (i) => (t = j(t, i), r()), o = Pe(), n = async (i) => {
    let s = { ...t, ...i, fetch: i.fetch ?? t.fetch ?? globalThis.fetch, headers: V(t.headers, i.headers) };
    s.security && await Ue({ ...s, security: s.security }), s.body && s.bodySerializer && (s.body = s.bodySerializer(s.body)), (s.body === void 0 || s.body === "") && s.headers.delete("Content-Type");
    let u = L(s), h = { redirect: "follow", ...s }, l = new Request(u, h);
    for (let y of o.request._fns) y && (l = await y(l, s));
    let p = s.fetch, c = await p(l);
    for (let y of o.response._fns) y && (c = await y(c, l, s));
    let v = { request: l, response: c };
    if (c.ok) {
      if (c.status === 204 || c.headers.get("Content-Length") === "0") return s.responseStyle === "data" ? {} : { data: {}, ...v };
      let y = (s.parseAs === "auto" ? Te(c.headers.get("Content-Type")) : s.parseAs) ?? "json";
      if (y === "stream") return s.responseStyle === "data" ? c.body : { data: c.body, ...v };
      let B = await c[y]();
      return y === "json" && (s.responseValidator && await s.responseValidator(B), s.responseTransformer && (B = await s.responseTransformer(B))), s.responseStyle === "data" ? B : { data: B, ...v };
    }
    let T = await c.text();
    try {
      T = JSON.parse(T);
    } catch {
    }
    let x = T;
    for (let y of o.error._fns) y && (x = await y(T, c, l, s));
    if (x = x || {}, s.throwOnError) throw x;
    return s.responseStyle === "data" ? void 0 : { error: x, ...v };
  };
  return { buildUrl: L, connect: (i) => n({ ...i, method: "CONNECT" }), delete: (i) => n({ ...i, method: "DELETE" }), get: (i) => n({ ...i, method: "GET" }), getConfig: r, head: (i) => n({ ...i, method: "HEAD" }), interceptors: o, options: (i) => n({ ...i, method: "OPTIONS" }), patch: (i) => n({ ...i, method: "PATCH" }), post: (i) => n({ ...i, method: "POST" }), put: (i) => n({ ...i, method: "PUT" }), request: n, setConfig: a, trace: (i) => n({ ...i, method: "TRACE" }) };
};
const A = Ie(W({
  baseUrl: "http://localhost:48740",
  throwOnError: !0
}));
class Me {
  static getUmbracoBlipManagementApiV1(t) {
    return (t?.client ?? A).get({
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
  static postEmptyByKeys(t) {
    return (t?.client ?? A).post({
      security: [
        {
          scheme: "bearer",
          type: "http"
        }
      ],
      url: "/umbraco/blip/management/api/v1/empty-by-keys",
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...t?.headers
      }
    });
  }
}
const H = "NW.Blip", G = "Blip.PropertyEditorUi.BlockListItemPicker", Ne = {
  type: "propertyEditorSchema",
  name: "Block List Item Picker",
  alias: H,
  meta: {
    defaultPropertyEditorUiAlias: G,
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
}, Re = [
  Ne,
  {
    type: "propertyEditorUi",
    alias: G,
    name: "Blip Block List Item Picker Property Editor UI",
    element: () => Promise.resolve().then(() => Ge),
    meta: {
      label: "Block List Item Picker",
      icon: "icon-list",
      group: "pickers",
      supportsReadonly: !0,
      propertyEditorSchemaAlias: H
    }
  }
], Ke = [
  {
    type: "modal",
    alias: "Blip.Modal.BlockPicker",
    name: "Blip Block Picker Modal",
    js: () => import("./blip-block-picker-modal.element.js")
  }
], Le = [
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
], je = [...Re, ...Ke, ...Le], qe = new pe("Blip.Modal.BlockPicker", {
  modal: { type: "sidebar", size: "medium" }
});
class De extends _e {
  // Required by base class. Not used in Blip (read-only picker).
  async createWithPresets(t, r) {
    return await super._createBlockData(t, r);
  }
  // Required by base class. Not used in Blip (read-only picker).
  insert(t, r, a, o) {
    return this._layouts.appendOneAt(t, o.index ?? -1), this.insertBlockData(t, r, a, o), !0;
  }
}
class ze extends ge {
  constructor(t) {
    super(t, ve), this.canCreate = new K(!1).asObservable(), this.hasExpose = new K(!0).asObservable();
  }
  _gotBlockManager() {
    this._manager && this.observe(
      this._manager.layouts,
      (t) => {
        this._layoutEntries.setValue(t);
      },
      "observeParentLayouts"
    );
  }
  getPathForCreateBlock() {
  }
  getPathForClipboard() {
  }
  async create() {
  }
  async insert(t, r, a, o) {
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
var Ve = Object.defineProperty, We = Object.getOwnPropertyDescriptor, J = (e) => {
  throw TypeError(e);
}, E = (e, t, r, a) => {
  for (var o = a > 1 ? void 0 : a ? We(t, r) : t, n = e.length - 1, i; n >= 0; n--)
    (i = e[n]) && (o = (a ? i(t, r, o) : i(o)) || o);
  return a && o && Ve(t, r, o), o;
}, F = (e, t, r) => t.has(e) || J("Cannot " + r), d = (e, t, r) => (F(e, t, "read from private field"), r ? r.call(e) : t.get(e)), g = (e, t, r) => t.has(e) ? J("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), f = (e, t, r) => (F(e, t, "access private method"), r), I, M, N, b, X, C, m, Y, R, Q, $, Z, ee, te, re;
const He = "blip-property-editor-ui", O = new CSSStyleSheet();
O.replaceSync(`
  uui-action-bar uui-button:not([label="delete"]) { display: none !important; }
  uui-action-bar uui-button[label="delete"] {
    --uui-button-border-radius: 50px !important;
    --uui-button-padding-left-factor: 2
  }
`);
let _ = class extends ne {
  constructor() {
    super(...arguments), g(this, m), g(this, I, new me(this)), g(this, M, new he(this)), g(this, N, new ye(this)), g(this, b, new De(this)), g(this, X, new ze(this)), this.value = [], this._loading = !0, this._blocks = [], this._layouts = [], this._userCanEdit = !1, this._sourceNodeKey = "", this._minNumber = 0, this._maxNumber = 0, this._sourceProperty = "", this._multiPicker = !0, this._sourceLayouts = [], g(this, C, new ce(this, {
      getUniqueOfElement: (e) => e.contentKey,
      getUniqueOfModel: (e) => e.contentKey,
      itemSelector: "umb-block-list-entry",
      // No containerSelector — host element is the container, matching the real block list
      onChange: ({ model: e }) => {
        this._layouts = e, f(this, m, $).call(this);
      }
    }));
  }
  set config(e) {
    e && (this._sourceNodeKey = e.getValueByAlias("sourceNode") ?? "", this._sourceProperty = e.getValueByAlias("sourceProperty") ?? "", this._minNumber = e.getValueByAlias("minNumber") ?? 0, this._maxNumber = e.getValueByAlias("maxNumber") ?? 0, this._multiPicker = this._maxNumber !== 1, f(this, m, Y).call(this));
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(be, (e) => {
      this.observe(e?.displayVariantId, (t) => {
        d(this, b).setVariantId(t);
      }, "observeVariantId");
    }), this.addEventListener("blip:block-deleted", ((e) => {
      f(this, m, Z).call(this, e.detail.contentKey);
    }));
  }
  async updated() {
    await customElements.whenDefined("umb-block-list-entry"), this.shadowRoot?.querySelectorAll("umb-block-list-entry").forEach((e) => {
      e.shadowRoot && !e.shadowRoot.adoptedStyleSheets.includes(O) && (e.shadowRoot.adoptedStyleSheets = [
        ...e.shadowRoot.adoptedStyleSheets,
        O
      ]);
    });
  }
  render() {
    return this._loading ? w`<uui-loader></uui-loader>` : w` ${JSON.stringify(this.value)}
      ${oe(
      this._layouts,
      (e, t) => `${t}_${e.contentKey}`,
      (e, t) => w`
          <umb-block-list-entry
            index=${t}
            .contentKey=${e.contentKey}
            .layout=${e}
            ${le()}
          >
          </umb-block-list-entry>
        `
    )}

      ${this._blocks.length ? k : w`<p class="empty-state">
            ${this.localize.term("blip_noBlocks")}
          </p>`}

      <div>
        <uui-button-group>
          <uui-button
            look="placeholder"
            label=${this.localize.term("blip_addBlock")}
            ?disabled=${!this._blocks.length}
            @click=${f(this, m, ee)}
          ></uui-button>

          ${this._userCanEdit ? w`
                <uui-button
                  compact
                  look="placeholder"
                  label=${this.localize.term("blip_manageBlocks")}
                  @click=${f(this, m, te)}
                >
                  <uui-icon name="icon-edit"></uui-icon>
                </uui-button>
              ` : k}
        </uui-button-group>
      </div>

      ${f(this, m, re).call(this)}
    `;
  }
};
I = /* @__PURE__ */ new WeakMap();
M = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
X = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
Y = async function() {
  if (this._loading = !0, !this._sourceNodeKey || !this._sourceProperty) {
    this._loading = !1;
    return;
  }
  const { data: e } = await d(this, I).requestByUnique(
    this._sourceNodeKey
  );
  if (!e) {
    this._loading = !1;
    return;
  }
  const r = e.values.find((l) => l.alias === this._sourceProperty)?.value;
  if (!r?.contentData?.length) {
    this._loading = !1;
    return;
  }
  const { data: a } = await fe(
    this,
    Me.getUmbracoBlipManagementApiV1({
      query: {
        key: this._sourceNodeKey,
        propertyAlias: this._sourceProperty
      }
    })
  );
  if (!a?.dataTypeKey) {
    this._loading = !1;
    return;
  }
  this._userCanEdit = a.allowedActions?.includes("A") ?? !1;
  const { data: o } = await d(this, N).requestByUnique(
    a.dataTypeKey
  );
  if (!o) {
    this._loading = !1;
    return;
  }
  const i = o.values.find((l) => l.alias === "blocks")?.value ?? [], s = [
    ...new Set(i.map((l) => l.contentElementTypeKey))
  ], { data: u } = await d(this, M).requestItems(s);
  if (!u) {
    this._loading = !1;
    return;
  }
  const h = new Map(
    u.map((l) => [
      l.unique,
      { name: l.name, icon: l.icon ?? "icon-document" }
    ])
  );
  d(this, b).setBlockTypes(i), d(this, b).setContents(
    r.contentData.map((l) => ({
      key: l.key,
      contentTypeKey: l.contentTypeKey,
      values: (l.values ?? []).map((p) => ({
        alias: p.alias,
        value: p.value,
        culture: null,
        segment: null,
        editorAlias: ""
      }))
    }))
  ), d(this, b).setSettings(
    (r.settingsData ?? []).map((l) => ({
      key: l.key,
      contentTypeKey: l.contentTypeKey,
      values: (l.values ?? []).map((p) => ({
        alias: p.alias,
        value: p.value,
        culture: null,
        segment: null,
        editorAlias: ""
      }))
    }))
  ), d(this, b).setExposes(
    r.contentData.map((l) => ({
      contentKey: l.key,
      culture: null,
      segment: null
    }))
  ), this._sourceLayouts = r.layout?.["Umbraco.BlockList"] ?? [], this._blocks = r.contentData.map((l) => {
    const p = h.get(l.contentTypeKey), c = i.find(
      (v) => v.contentElementTypeKey === l.contentTypeKey
    );
    return {
      key: l.key,
      contentTypeKey: l.contentTypeKey,
      label: c?.label || p?.name || "Block",
      icon: p?.icon ?? "icon-document",
      value: l.values
    };
  }), f(this, m, Q).call(this), this._loading = !1;
};
R = function(e) {
  return e.map((t) => {
    const r = t.replace("umb://element/", "");
    return this._sourceLayouts.find((a) => a.contentKey === r);
  }).filter((t) => t !== void 0);
};
Q = function() {
  this._layouts = f(this, m, R).call(this, this.value ?? []), d(this, b).setLayouts(this._layouts), d(this, C).setModel(this._layouts);
};
$ = function() {
  this.value = this._layouts.map((e) => `umb://element/${e.contentKey}`), d(this, b).setLayouts(this._layouts), this.dispatchEvent(new ue());
};
Z = function(e) {
  this._layouts = this._layouts.filter((t) => t.contentKey !== e), d(this, C).setModel(this._layouts), f(this, m, $).call(this);
};
ee = async function() {
  const e = await this.getContext(de);
  if (!e) return;
  const t = e.open(this, qe, {
    data: {
      blocks: this._blocks,
      multiPicker: this._multiPicker,
      selection: this._layouts.map((r) => `umb://element/${r.contentKey}`)
    }
  });
  try {
    const r = await t.onSubmit();
    r.selection && (this._layouts = f(this, m, R).call(this, r.selection), d(this, C).setModel(this._layouts), f(this, m, $).call(this));
  } catch {
  }
};
te = function() {
  this._sourceNodeKey && window.history.pushState(
    {},
    "",
    `/umbraco/section/content/workspace/document/edit/${this._sourceNodeKey}`
  );
};
re = function() {
  if (!this._multiPicker) return k;
  const e = this._layouts.length, t = this._minNumber, r = this._maxNumber;
  if (!t && !r) return k;
  if (e === 0 && !t) return k;
  let a = "";
  return t && r && t !== r ? (e < r && (a = `Add between ${t} and ${r} items`), e > r && (a = `Maximum ${r} items allowed`)) : t && r && t === r ? (e < r && (a = `Add ${t - e} more item(s)`), e > r && (a = `Maximum ${r} items allowed`)) : !t && r ? (e < r && (a = `Add up to ${r} items`), e > r && (a = `Maximum ${r} items allowed`)) : t && !r && e < t && (a = `Add at least ${t} item(s)`), a ? w`<div id="validation-message">${a}</div>` : k;
};
_.styles = [
  se`
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
    `
];
E([
  S()
], _.prototype, "_loading", 2);
E([
  S()
], _.prototype, "_blocks", 2);
E([
  S()
], _.prototype, "_layouts", 2);
E([
  S()
], _.prototype, "_userCanEdit", 2);
E([
  S()
], _.prototype, "_sourceNodeKey", 2);
_ = E([
  ae(He)
], _);
const Ge = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get default() {
    return _;
  }
}, Symbol.toStringTag, { value: "Module" })), nt = (e, t) => {
  t.registerMany(je), e.consumeContext(ie, async (r) => {
    if (!r) return;
    const a = r?.getOpenApiConfiguration();
    A.setConfig({
      baseUrl: a?.base ?? "",
      auth: a?.token ?? void 0,
      credentials: a?.credentials ?? "same-origin"
    });
  });
};
export {
  H as BLIP_BLOCK_LIST_PROPERTY_EDITOR_SCHEMA_ALIAS,
  G as BLIP_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS,
  nt as onInit
};
//# sourceMappingURL=blip.js.map
