# @kufayeka/nexa-component-basic-shapes

Eight basic components for Nexa Dashboard, written with the Nexa Component SDK
(`@kufayeka/node-red-nexa-dashboard/docs/SDK.md`), all in `dist/shapes.js`. They declare
**no inspector**: the SDK lays their panel out from `properties` (sections by `group`),
which makes this package the reference for the automatic panel.

| Component | Properties | Event |
|---|---|---|
| `kufayeka-rect` Rectangle | fill, stroke, strokeWidth, strokeStyle, borderRadius, opacity, shadowBlur, shadowColor | `click` `{ fill, stroke }` |
| `kufayeka-ellipse` Circle / Ellipse | fill, stroke, strokeWidth, strokeStyle, opacity, shadowBlur, shadowColor | `click` |
| `kufayeka-triangle` Triangle | fill, stroke, strokeWidth, strokeStyle, direction, opacity | `click` `{ direction }` |
| `kufayeka-diamond` Diamond | fill, stroke, strokeWidth, strokeStyle, opacity | `click` |
| `kufayeka-star` Star | fill, stroke, strokeWidth, strokeStyle, opacity | `click` |
| `kufayeka-line` Line | stroke, strokeWidth, strokeStyle, arrowStart, arrowEnd, opacity | `click` |
| `kufayeka-path` Freeform Path | pathData, fill, stroke, strokeWidth, strokeStyle, opacity | `click` |
| `kufayeka-text-label` Text Label | text (may be a tag binding), color, font*, textAlign, textDecoration, lineHeight, letterSpacing, wordWrap, backgroundColor, padding | `click` `{ text }` |

Prop names are unchanged from the pre-SDK version, so saved screens keep working;
`strokeStyle`, `direction`, `fontWeight`, … are now real choices in the panel. Dropping a
Sparkplug metric on the canvas creates a Text Label bound to it.

```
dist/shapes.js                   the eight components (ES module, no build step)
widgets/basic-shapes-plugin.js   backend: one call to the SDK package helper
widgets/basic-shapes-plugin.html editor: <script type="module">
test/browser.test.js             headless Chrome through the SDK testkit (`npm test`, build the dashboard first)
```
