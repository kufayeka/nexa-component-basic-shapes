// Nexa "Basic" components: Rectangle, Circle / Ellipse, Triangle, Diamond,
// Star, Line, Freeform Path and Text Label. An ES module on the Nexa
// component SDK. These declare no `inspector`: the SDK lays their panel out
// automatically from `properties` (grouped by `group`).
import { defineComponent, NexaElement, html, svg, css, nothing } from "../../nexa-sdk/nexa-component-sdk.js";

// ---- shared properties -------------------------------------------------------------------

const STROKE_STYLE = {
    type: "enum", default: "solid", group: "Shape", label: "Stroke style",
    options: [{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]
};
const fill = (def) => ({ type: "color", default: def || "#cfe0ff", group: "Shape" });
const stroke = (def) => ({ type: "color", default: def || "#4a6fa5", group: "Shape" });
const strokeWidth = { type: "number", default: 2, min: 0, max: 50, step: 1, unit: "px", group: "Shape", label: "Stroke width" };
const opacity = { type: "range", default: 1, min: 0, max: 1, step: 0.05, group: "Effects" };
const shadow = {
    shadowBlur: { type: "number", default: 0, min: 0, max: 60, unit: "px", group: "Effects", label: "Shadow blur" },
    shadowColor: { type: "color", default: "rgba(0,0,0,0.2)", group: "Effects", label: "Shadow colour", visibleWhen: (p) => Number(p.shadowBlur) > 0 }
};

const clickEvent = { click: { label: "Clicked" } };
const common = {
    category: "Basic",
    capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
    events: clickEvent
};

function dash(style, width) {
    const w = width || 1;
    if (style === "dashed") return (w * 3) + "," + (w * 3);
    if (style === "dotted") return w + "," + (w * 2);
    return nothing;
}

const fillHost = css`:host { display: block; width: 100%; height: 100%; box-sizing: border-box; } .shape { width: 100%; height: 100%; box-sizing: border-box; } svg { display: block; overflow: visible; }`;

// ---- box shapes (CSS) --------------------------------------------------------------------

class BoxShapeView extends NexaElement {
    static styles = fillHost;
    static round = false;
    render() {
        const p = this.p;
        const sw = Number(p.strokeWidth) || 0;
        const blur = Number(p.shadowBlur) || 0;
        const style = [
            "background-color:" + (p.fill || "transparent"),
            "border:" + (sw > 0 ? sw + "px " + (p.strokeStyle || "solid") + " " + (p.stroke || "#4a6fa5") : "none"),
            "border-radius:" + (this.constructor.round ? "50%" : (Number(p.borderRadius) || 0) + "px"),
            "box-shadow:" + (blur > 0 ? "0 2px " + blur + "px " + (p.shadowColor || "rgba(0,0,0,0.2)") : "none")
        ].join(";");
        return html`<div class="shape" style="${style}" @click="${() => this.emit("click", { fill: p.fill, stroke: p.stroke })}"></div>`;
    }
}

export const rect = defineComponent({
    ...common,
    id: "kufayeka-rect", label: "Rectangle", icon: "fa fa-square-o", size: { w: 120, h: 80 },
    properties: {
        fill: fill(), stroke: stroke(), strokeWidth, strokeStyle: STROKE_STYLE,
        borderRadius: { type: "number", default: 4, min: 0, unit: "px", group: "Shape", label: "Corner radius" },
        opacity, ...shadow
    },
    view: class extends BoxShapeView {}
});

export const ellipse = defineComponent({
    ...common,
    id: "kufayeka-ellipse", label: "Circle / Ellipse", icon: "fa fa-circle-o", size: { w: 100, h: 100 },
    properties: { fill: fill(), stroke: stroke(), strokeWidth, strokeStyle: STROKE_STYLE, opacity, ...shadow },
    view: class extends BoxShapeView { static round = true; }
});

// ---- polygons (SVG) --------------------------------------------------------------------------

class PolygonView extends NexaElement {
    static styles = fillHost;
    points() { return ""; }
    payload() { return {}; }
    render() {
        const p = this.p;
        const sw = p.strokeWidth !== undefined && p.strokeWidth !== "" ? Number(p.strokeWidth) : 2;
        return html`<svg class="shape" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" @click="${() => this.emit("click", this.payload())}">
            ${svg`<polygon points="${this.points()}" fill="${p.fill || "transparent"}" stroke="${p.stroke}" stroke-width="${sw}"
                stroke-dasharray="${dash(p.strokeStyle, sw)}" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polygon>`}
        </svg>`;
    }
}

const TRIANGLE = { up: "50,4 96,96 4,96", down: "4,4 96,4 50,96", left: "4,50 96,4 96,96", right: "4,4 96,50 4,96" };

export const triangle = defineComponent({
    ...common,
    id: "kufayeka-triangle", label: "Triangle", icon: "fa fa-play", size: { w: 100, h: 100 },
    properties: {
        fill: fill(), stroke: stroke(), strokeWidth, strokeStyle: STROKE_STYLE,
        direction: {
            type: "enum", default: "up", group: "Shape", iconsOnly: true, style: "segmented",
            options: [{ value: "up", label: "Up", icon: "fa fa-caret-up" }, { value: "down", label: "Down", icon: "fa fa-caret-down" },
                { value: "left", label: "Left", icon: "fa fa-caret-left" }, { value: "right", label: "Right", icon: "fa fa-caret-right" }]
        },
        opacity
    },
    view: class extends PolygonView {
        points() { return TRIANGLE[this.p.direction] || TRIANGLE.up; }
        payload() { return { direction: this.p.direction || "up" }; }
    }
});

export const diamond = defineComponent({
    ...common,
    id: "kufayeka-diamond", label: "Diamond", icon: "fa fa-square", size: { w: 100, h: 100 },
    properties: { fill: fill(), stroke: stroke(), strokeWidth, strokeStyle: STROKE_STYLE, opacity },
    view: class extends PolygonView { points() { return "50,4 96,50 50,96 4,50"; } }
});

export const star = defineComponent({
    ...common,
    id: "kufayeka-star", label: "Star", icon: "fa fa-star-o", size: { w: 100, h: 100 },
    properties: { fill: fill("#fff3cd"), stroke: stroke("#ffc107"), strokeWidth, strokeStyle: STROKE_STYLE, opacity },
    view: class extends PolygonView { points() { return "50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"; } }
});

// ---- line / path -------------------------------------------------------------------------------

export const line = defineComponent({
    ...common,
    id: "kufayeka-line", label: "Line", icon: "fa fa-minus", size: { w: 140, h: 24 },
    properties: {
        stroke: stroke(), strokeWidth, strokeStyle: STROKE_STYLE,
        arrowStart: { type: "boolean", default: false, group: "Shape", label: "Arrow at the start" },
        arrowEnd: { type: "boolean", default: false, group: "Shape", label: "Arrow at the end" },
        opacity
    },
    view: class extends NexaElement {
        static styles = fillHost;
        render() {
            const p = this.p;
            const sw = p.strokeWidth !== undefined && p.strokeWidth !== "" ? Number(p.strokeWidth) : 2;
            const color = p.stroke || "#4a6fa5";
            // marker ids are local to this component's shadow root
            return html`<svg class="shape" width="100%" height="100%" @click="${() => this.emit("click", {})}">
                ${svg`<defs>
                    <marker id="arr-start" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto"><path d="M5,0 L0,3 L5,6 Z" fill="${color}"></path></marker>
                    <marker id="arr-end" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 Z" fill="${color}"></path></marker>
                </defs>
                <line x1="8" y1="50%" x2="calc(100% - 8px)" y2="50%" stroke="${color}" stroke-width="${sw}" stroke-dasharray="${dash(p.strokeStyle, sw)}"
                    marker-start="${p.arrowStart ? "url(#arr-start)" : nothing}" marker-end="${p.arrowEnd ? "url(#arr-end)" : nothing}" vector-effect="non-scaling-stroke"></line>`}
            </svg>`;
        }
    }
});

export const path = defineComponent({
    ...common,
    id: "kufayeka-path", label: "Freeform Path", icon: "fa fa-pencil", size: { w: 120, h: 80 },
    properties: {
        pathData: { type: "text", default: "M 10 70 Q 50 10, 90 70 T 170 70", mono: true, rows: 3, group: "Shape", label: "Path data (SVG d)", help: "e.g. M 10 70 L 90 10" },
        fill: { type: "color", default: "none", group: "Shape", placeholder: "none" },
        stroke: stroke(), strokeWidth, strokeStyle: STROKE_STYLE, opacity
    },
    view: class extends NexaElement {
        static styles = fillHost;
        render() {
            const p = this.p;
            const sw = p.strokeWidth !== undefined && p.strokeWidth !== "" ? Number(p.strokeWidth) : 2;
            return html`<svg class="shape" width="100%" height="100%" @click="${() => this.emit("click", {})}">
                ${svg`<path d="${p.pathData || ""}" fill="${p.fill || "none"}" stroke="${p.stroke}" stroke-width="${sw}" stroke-dasharray="${dash(p.strokeStyle, sw)}"
                    stroke-linecap="round" stroke-linejoin="round"></path>`}
            </svg>`;
        }
    }
});

// ---- text label ----------------------------------------------------------------------------------
// `text` may hold a tag binding ("{sparkplug:...}"): the host resolves it,
// and dropping a Sparkplug metric on the canvas creates one of these.

export const textLabel = defineComponent({
    ...common,
    id: "kufayeka-text-label", label: "Text Label", icon: "fa fa-font", size: { w: 160, h: 36 },
    capabilities: { resizable: true, rotatable: true, flippable: false, lockable: true },
    properties: {
        text: { type: "string", default: "Text Label", group: "Text", help: "Plain text, or a tag / parameter binding like {sparkplug:...}." },
        color: { type: "color", default: "#333333", group: "Text" },
        fontSize: { type: "number", default: 14, min: 1, unit: "px", group: "Text", label: "Font size" },
        fontFamily: { type: "string", default: "sans-serif", group: "Text", label: "Font family" },
        fontWeight: { type: "enum", default: "normal", group: "Text", label: "Weight", options: ["normal", "bold", "100", "300", "500", "600", "700", "900"] },
        fontStyle: { type: "enum", default: "normal", group: "Text", label: "Style", options: [{ value: "normal", label: "Normal" }, { value: "italic", label: "Italic" }] },
        textAlign: {
            type: "enum", default: "left", group: "Text", label: "Align", style: "segmented", iconsOnly: true,
            options: [{ value: "left", label: "Left", icon: "fa fa-align-left" }, { value: "center", label: "Center", icon: "fa fa-align-center" }, { value: "right", label: "Right", icon: "fa fa-align-right" }]
        },
        textDecoration: { type: "enum", default: "none", group: "Text", label: "Decoration", options: [{ value: "none", label: "None" }, { value: "underline", label: "Underline" }, { value: "line-through", label: "Strike" }] },
        lineHeight: { type: "number", default: 1.2, min: 0, step: 0.1, group: "Text", label: "Line height" },
        letterSpacing: { type: "number", default: 0, step: 0.5, unit: "px", group: "Text", label: "Letter spacing" },
        wordWrap: { type: "boolean", default: false, group: "Text", label: "Wrap long text" },
        backgroundColor: { type: "color", default: "transparent", group: "Box", label: "Background" },
        padding: { type: "number", default: 0, min: 0, unit: "px", group: "Box" }
    },
    view: class extends NexaElement {
        static styles = css`
            :host { display: block; width: 100%; height: 100%; box-sizing: border-box; overflow: hidden; }
            .label-inner { width: 100%; height: 100%; display: flex; align-items: center; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; }
        `;
        render() {
            const p = this.p;
            const align = p.textAlign || "left";
            const style = [
                "color:" + (p.color || "#333333"),
                "font-size:" + (p.fontSize ? p.fontSize + "px" : "14px"),
                "font-family:" + (p.fontFamily || "sans-serif"),
                "font-weight:" + (p.fontWeight || "normal"),
                "font-style:" + (p.fontStyle || "normal"),
                "text-align:" + align,
                "justify-content:" + (align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"),
                "text-decoration:" + (p.textDecoration || "none"),
                "line-height:" + (p.lineHeight || 1.2),
                "letter-spacing:" + (p.letterSpacing ? p.letterSpacing + "px" : "normal"),
                "background-color:" + (p.backgroundColor || "transparent"),
                "padding:" + (p.padding ? p.padding + "px" : "0"),
                "white-space:" + (p.wordWrap ? "normal" : "nowrap"),
                "word-break:" + (p.wordWrap ? "break-word" : "normal")
            ].join(";");
            return html`<div class="label-inner" style="${style}" @click="${() => this.emit("click", { text: p.text })}">${p.text !== undefined ? p.text : "Text"}</div>`;
        }
    }
});
