# Basic Shapes Plugin (`@kufayeka/nexa-component-basic-shapes`)

> **Official Vector Shape & Typography Component Suite for Nexa Dashboard**  
> Provides 8 fundamental vector shapes and rich typography components with full property inspectors, real-time asset tag binding, event triggers, and hardware-accelerated CSS/SVG rendering.

---

## Included Components

| Component ID | Label | Capabilities | Render Engine | Configurable Properties |
| :--- | :--- | :--- | :--- | :--- |
| `kufayeka-rect` | **Rectangle** | Resize, Rotate, Flip, Lock | CSS / DOM | Fill, Stroke, Stroke Width, Stroke Style (`solid`, `dashed`, `dotted`), Border Radius, Opacity, Shadow Blur, Shadow Color |
| `kufayeka-ellipse` | **Circle / Ellipse** | Resize, Rotate, Flip, Lock | CSS / DOM | Fill, Stroke, Stroke Width, Stroke Style, Opacity, Shadow Blur, Shadow Color |
| `kufayeka-triangle` | **Triangle** | Resize, Rotate, Flip, Lock | SVG Polygon | Fill, Stroke, Stroke Width, Stroke Style, Direction (`up`, `down`, `left`, `right`), Opacity |
| `kufayeka-diamond` | **Diamond** | Resize, Rotate, Flip, Lock | SVG Polygon | Fill, Stroke, Stroke Width, Stroke Style, Opacity |
| `kufayeka-star` | **Star** | Resize, Rotate, Flip, Lock | SVG Polygon (5-pt) | Fill, Stroke, Stroke Width, Stroke Style, Opacity |
| `kufayeka-line` | **Line** | Resize, Rotate, Flip, Lock | SVG Line & Markers | Stroke, Stroke Width, Stroke Style, Arrow Start (`checkbox`), Arrow End (`checkbox`), Opacity |
| `kufayeka-path` | **Freeform Path** | Resize, Rotate, Flip, Lock | SVG Path (`d`) | Path Data (`d` attribute), Fill, Stroke, Stroke Width, Stroke Style, Opacity |
| `kufayeka-text-label` | **Text Label** | Resize, Rotate, Lock | Lit Web Component | Text, Color, Font Size, Font Family, Font Weight, Font Style, Text Align, Text Decoration, Line Height, Letter Spacing, Background Color, Padding, Word Wrap |

---

## 1. Property Details & Capabilities

### Geometric & Transform Capabilities
Every shape component in this suite supports:
- **Resizing**: Interactive 8-point bounding box handles with grid snap.
- **Rotation**: 360-degree rotation with 15-degree angle snap when holding `Shift`.
- **Flipping**:
  - Horizontal Flip (`Flip H` or `Shift+H`)
  - Vertical Flip (`Flip V` or `Shift+V`)
- **Locking**: Protects position and size from accidental edits during screen layout design.

### Real-time Asset Tag Binding (`bindable`)
All visual properties (`fill`, `stroke`, `strokeWidth`, `opacity`, `text`, `color`, `fontSize`, etc.) can be bound to industrial tags via `kufayeka-asset-engine`. When an OPC-UA, Modbus, or MQTT value changes on the PLC, the component updates instantly via the optimized `onBind` handler without re-rendering the entire element.

---

## 2. Text Label Component (Lit Web Component)

The `kufayeka-text-label` component is implemented as a **Lit Web Component** (`<nexa-text-label>`). It provides rich typography formatting:

```html
<nexa-text-label
  text="Boiler Pressure (PSI)"
  color="#d32f2f"
  fontsize="16"
  fontfamily="'Segoe UI', Roboto, sans-serif"
  fontweight="bold"
  textalign="center"
  lineheight="1.4"
  letterspacing="1"
  backgroundcolor="rgba(255,255,255,0.8)"
  padding="4">
</nexa-text-label>
```

---

## 3. Build & Development

The Lit component is authored in `widgets/src/text-label-element.js` and compiled into a standalone bundle:

```bash
# Build the Lit web component bundle into dist/text-label-element.bundle.js
npm run build
```

---

## 4. License
MIT &copy; Kufayeka Tech
