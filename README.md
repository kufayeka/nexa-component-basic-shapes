# Basic Shapes Plugin (`@kufayeka/nexa-component-basic-shapes`)

> **Reference vector shape & typography component pack for Nexa Dashboard.**
> Ships 8 fundamental components and doubles as the canonical example of the
> `window.NEXA.registerComponent` contract — see
> `@kufayeka/node-red-nexa-dashboard`'s README for the full contract spec and a
> step-by-step guide to writing your own component package.

---

## Included components

All 8 are registered from a single file, `dist/basic-shapes-components.js`:

| Component ID | Label | Render engine | Configurable properties (`defaults`) | Events |
| :--- | :--- | :--- | :--- | :--- |
| `kufayeka-rect` | **Rectangle** | Plain DOM (`el`'s own background/border) | Fill, Stroke, Stroke Width, Stroke Style (`solid`/`dashed`/`dotted`), Border Radius, Opacity, Shadow Blur, Shadow Color | `click` |
| `kufayeka-ellipse` | **Circle / Ellipse** | Plain DOM (`el`'s own background/border, `border-radius:50%`) | Fill, Stroke, Stroke Width, Stroke Style, Opacity, Shadow Blur, Shadow Color | `click` |
| `kufayeka-triangle` | **Triangle** | Inline SVG `<polygon>` | Fill, Stroke, Stroke Width, Stroke Style, Direction (`up`/`down`/`left`/`right`), Opacity | `click` |
| `kufayeka-diamond` | **Diamond** | Inline SVG `<polygon>` | Fill, Stroke, Stroke Width, Stroke Style, Opacity | `click` |
| `kufayeka-star` | **Star** | Inline SVG `<polygon>` (5-point) | Fill, Stroke, Stroke Width, Stroke Style, Opacity | `click` |
| `kufayeka-line` | **Line** | Inline SVG `<line>` + arrow `<marker>`s | Stroke, Stroke Width, Stroke Style, Arrow Start (checkbox), Arrow End (checkbox), Opacity | `click` |
| `kufayeka-path` | **Freeform Path** | Inline SVG `<path>` | Path Data (raw `d` attribute), Fill, Stroke, Stroke Width, Stroke Style, Opacity | `click` |
| `kufayeka-text-label` | **Text Label** | Lit Web Component (`<nexa-text-label>`, child of `el`) | Text, Color, Font Size, Font Family, Font Weight, Font Style, Text Align, Text Decoration, Line Height, Letter Spacing, Background Color, Padding, Word Wrap | `click` |

All 8 declare `capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true }` (Text Label omits `flippable`, since flipping text is rarely wanted) and all use the exact same `onclick`-based `click` event pattern shown in [§3](#3-the-click-event-pattern).

Every color/stroke/opacity property listed above is also declared in `bindable` (e.g.
`kufayeka-rect`'s is `["props.fill", "props.stroke", "props.strokeWidth", "props.borderRadius", "props.opacity"]`)
and has a matching branch in that component's `onBind(el, target, value)` for a fast,
no-full-re-render property update path. See the parent package's README §10 for the
current, honest status of what actually *drives* `bindable` end-to-end today (short
version: the field and the `onBind` fast path both work; there is no live asset-tag
picker UI wired up to them yet).

---

## 1. Two render strategies, and the one bug they used to share

This package demonstrates both ways `render(el, props, ctx)` can legitimately produce a
shape, plus the one mistake that's easy to make with the first strategy:

### Strategy A — style `el` itself directly (Rectangle, Ellipse)

`el` is the wrapper `<div>` that the Nexa canvas already created, sized, and positioned
for you (`position:absolute`, explicit `width`/`height` in px matching `comp.w`/`comp.h`,
`box-sizing:border-box`) **before** your `render()` runs. For a rectangle or ellipse,
there's no need for any child element — `render()` just sets `el.style.backgroundColor`,
`el.style.border`, `el.style.borderRadius`, etc. directly on `el`.

**The trap:** it is tempting to also write `el.style.width = "100%"` / `el.style.height =
"100%"` inside `render()` — e.g. copied from a pattern meant for a *child* element. Doing
that to `el` itself **overwrites its own explicit pixel size** with "100% of its
containing block", which for an absolutely-positioned element is the artboard, not the
component's own box — the shape balloons to fill the whole canvas while the selection box
(sized independently, straight from `comp.w`/`comp.h`) stays correctly small. This exact
regression happened in this package during development (introduced when the shape count
grew from 2 to 8) and was fixed by simply deleting those two lines from `kufayeka-rect`
and `kufayeka-ellipse`'s `render()` — `el` was already the right size. **Never set `el`'s
own `width`/`height` from inside `render()`.**

### Strategy B — render into `el.innerHTML`, or append a sized child (Triangle/Diamond/Star/Line/Path, Text Label)

The 5 SVG-based shapes set `el.innerHTML` to an `<svg width="100%" height="100%" ...>`
markup string on every render — `width`/`height` here are safe because they're on the
`<svg>` **child**, which correctly resolves "100%" against its actual parent (`el`, which
is already the right size), not against the artboard. `kufayeka-text-label` follows the
same rule via a `<nexa-text-label>` custom element child, whose own Shadow DOM `:host`
CSS also uses `width:100%; height:100%` safely for the identical reason.

**Rule of thumb:** it's always safe to size a *child* of `el` to `100%`. It is only ever a
bug to resize `el` itself, because the caller already sized `el` correctly before handing
it to you.

---

## 2. `onBind` — the high-frequency update path

`render()` may be too expensive to call on every value change (e.g. a value arriving from
a live tag every 100ms). `onBind(el, target, value)` receives the exact `props.<key>`
path that changed and should make the smallest possible DOM update:

```javascript
// kufayeka-rect
onBind: function (el, target, value) {
  if (target === "props.fill") el.style.backgroundColor = value;
  if (target === "props.stroke") el.style.borderColor = value;
  if (target === "props.strokeWidth") el.style.borderWidth = (value || 0) + "px";
  if (target === "props.borderRadius") el.style.borderRadius = (value || 0) + "px";
  if (target === "props.opacity") el.style.opacity = value;
}
```

For the SVG-based shapes, `onBind` looks up the actual child node (`el.querySelector("polygon")`,
`"line"`, `"path"`) and sets attributes on it directly rather than regenerating the whole
`innerHTML` string. For Text Label, it looks up (or lazily creates) the `<nexa-text-label>`
child and sets the corresponding property on the custom element instance.

If a component has no `onBind` for a given target, Nexa falls back to a full `render()`
re-invocation with the updated `props` — correct, just not optimized for high-frequency
updates.

---

## 3. The `click` event pattern

All 8 components use the identical, idempotent pattern for their one declared event:

```javascript
events: [{ name: "click", label: "Clicked" }],
render: function (el, props, ctx) {
  // ...styling...
  el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", { fill: props.fill /* ...whatever's relevant... */ }); };
}
```

Using `el.onclick = ...` (assignment) rather than `el.addEventListener("click", ...)` is
required, not stylistic — `render()` can be called repeatedly on the same live `el`
(e.g. every time a property changes in the Properties panel), and `addEventListener`
would silently stack up one more duplicate handler on every single re-render.

---

## 4. Package layout

```
nexa-component-basic-shapes/
├── package.json
├── widgets/
│   ├── basic-shapes-plugin.js    # backend: RED.plugins.registerPlugin(..., {type: "nexa-ui-component-package", runtimeScripts: [...]})
│   ├── basic-shapes-plugin.html  # editor-side <script src> tags for the same 2 files (loaded via the standard Node-RED plugin .html sibling)
│   └── src/
│       └── text-label-element.js  # Lit source for <nexa-text-label> — compiled, not shipped directly
└── dist/
    ├── basic-shapes-components.js      # all 8 NEXA.registerComponent(...) calls — hand-edited directly, no build step
    └── text-label-element.bundle.js    # ⚠️ AUTO-GENERATED by `npm run build` from widgets/src/text-label-element.js — do not hand-edit
```

`basic-shapes-plugin.js` serves both files under `/nexa-component-basic-shapes/vendor/*`
from **both** `RED.httpAdmin` (so the editor's Pages tray can load them while you design
screens) and `RED.httpNode` (so a deployed page — served publicly, unauthenticated — can
load them too). Both mounts point at the same `dist/` directory via `express.static`.

Only `text-label-element.bundle.js` goes through a build step (it needs `lit` bundled in,
since deployed pages can't be expected to have their own copy of Lit available).
`basic-shapes-components.js` is plain, dependency-free JS and is edited directly — there
is no `widgets/src/basic-shapes-components.js` source file to keep in sync.

---

## 5. Build & development

```bash
npm install               # installs esbuild + lit (devDependencies)
npm run build               # esbuild widgets/src/text-label-element.js --bundle --format=iife -> dist/text-label-element.bundle.js
```

There is no watch script for this package today — re-run `npm run build` after editing
`widgets/src/text-label-element.js`, then reload the Node-RED editor tab (and redeploy) to
pick up the new bundle. Changes to `dist/basic-shapes-components.js` (the 7 plain-DOM/SVG
shapes) take effect immediately on editor reload — no build step involved.

---

## 6. License

MIT &copy; Kufayeka Tech
