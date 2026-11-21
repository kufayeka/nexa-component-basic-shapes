// Nexa "Basic" components: Rectangle, Circle / Ellipse, Triangle, Diamond,
// Star, Line, Freeform Path and Text Label. An ES module on the Nexa
// component SDK. These declare no `inspector`: the SDK lays their panel out
// automatically from `properties` (grouped by `group`).
import { defineComponent, NexaElement, html, svg, css, nothing, linePath, assetUrl } from "../../nexa-sdk/nexa-component-sdk.js";

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

// ---- flow line: a line / arrow bent at its points, with particles that run along it ------------------------------------------------
// Its points are edited on the canvas (editor.points: a handle per point; a point dropped on a component's connection point or on a point
// of another line is connected there and follows it).
//
// As light as it can be: the path is sampled ONCE per shape into a list of positions (and angles), and each particle runs it as a Web
// Animation of `transform` only. A transform animation runs on the browser's compositor (the GPU), not in JavaScript and not through
// layout, so hundreds of particles cost almost no CPU. The animations are paused while the line is out of view (an IntersectionObserver)
// and the browser stops them by itself in a hidden tab.

const FLOW = "Flow";
const PARTICLE_SHAPES = [{ value: "dot", label: "Dot" }, { value: "square", label: "Square" }, { value: "drop", label: "Drop" },
    { value: "arrow", label: "Arrow" }, { value: "icon", label: "Icon" }, { value: "image", label: "Picture" }];
const DEFAULT_POINTS = [{ id: "p1", x: 12, y: 12 }, { id: "p2", x: 172, y: 12 }];

function particleView(p, size, color) {
    const s = size, h = s / 2;
    if (p.particle === "icon") return html`<i class="${p.particleIcon || "fa fa-circle"}" style="font-size:${s}px;color:${color};line-height:1;display:block"></i>`;
    // a picture fits its square as the SVG component fits its box: the whole picture (contain), the square filled (cover), or stretched
    const fit = p.particleFit === "cover" ? "cover" : p.particleFit === "stretch" ? "fill" : "contain";
    if (p.particle === "image") return p.particleImage ? html`<img data-particle-img src="${assetUrl(p.particleImage)}" style="width:${s}px;height:${s}px;object-fit:${fit};display:block" alt="">` : nothing;
    // a dot and a square are plain boxes (the cheapest thing to draw); the other shapes one small path each
    if (p.particle === "square") return html`<div style="width:${s}px;height:${s}px;background:${color};border-radius:1px"></div>`;
    if (p.particle !== "arrow" && p.particle !== "drop") return html`<div style="width:${s}px;height:${s}px;background:${color};border-radius:50%"></div>`;
    // a drop: round at the back, its point ahead (it turns with the line)
    const d = p.particle === "arrow" ? "M0 0 L" + s + " " + h + " L0 " + s + " Z"
        : "M" + s + " " + h + " L" + 0.4 * s + " " + 0.1 * s + " A" + 0.4 * s + " " + 0.4 * s + " 0 1 0 " + 0.4 * s + " " + 0.9 * s + " Z";
    return html`<svg width="${s}" height="${s}" style="display:block;overflow:visible">${svg`<path d="${d}" fill="${color}"></path>`}</svg>`;
}

// the path sampled along its length: [{ x, y, a (degrees) }] about every `step` px, from the real SVG path (curves and rounded corners too).
// The angles are made continuous (unwrapped): from 179° to -179° is a step of 2°, not a turn of 358° the wrong way round. `smooth` px:
// each angle is the average over that much of the line before and after it, so a particle turns gradually through a bend (0: sharp).
function samplePath(pathEl, step, smooth) {
    const len = pathEl.getTotalLength();
    const n = Math.max(2, Math.min(400, Math.ceil(len / step) + 1));
    const out = [];
    for (let i = 0; i < n; i++) {
        const at = (len * i) / (n - 1);
        const q = pathEl.getPointAtLength(at);
        const r = pathEl.getPointAtLength(Math.min(len, at + 0.5)), l = pathEl.getPointAtLength(Math.max(0, at - 0.5));
        out.push({ x: q.x, y: q.y, a: Math.atan2(r.y - l.y, r.x - l.x) * 180 / Math.PI });
    }
    for (let i = 1; i < out.length; i++) {
        let d = out[i].a - out[i - 1].a;
        while (d > 180) d -= 360;
        while (d < -180) d += 360;
        out[i].a = out[i - 1].a + d;
    }
    const w = Math.round((Number(smooth) || 0) / ((len / (n - 1)) || 1));
    if (w > 0) {
        const raw = out.map((q) => q.a);
        out.forEach((q, i) => {
            let sum = 0, c = 0;
            for (let j = Math.max(0, i - w); j <= Math.min(raw.length - 1, i + w); j++) { sum += raw[j]; c++; }
            q.a = sum / c;
        });
    }
    return { len, samples: out };
}

// ---- the "pipe" look of a Flow Line ----------------------------------------------------------------------------------------------------
// A tube drawn as layers of strokes along the path, so every bend and curve is right at once. Where pipes meet, the editor works out who
// draws what and keeps it on the points (point.fit, src/features/canvas/model/line-geometry.js markFittings):
//   { k: "tee" | "cross", d, dirs }   this pipe draws the junction: its own run and the first stretch of every other branch (dirs: their
//                                     directions and widths), LAYER BY LAYER together (all walls, then all bodies, then all liquids ...),
//                                     so the inside runs on through the junction without a seam
//   { k: "into", trim }               this pipe's end goes into another's junction: it is drawn short of it by `trim`
//   { k: "joint", d }                 this narrower pipe meets a wider one (width d) end to end: it draws the reducer
// Inside a fitting the liquid and the particles show at `flowInside` (the fitting's shell is laid over them again), so the fitting is seen.

const PIPE_DEFAULTS = { teeStyle: "flanged", reducerStyle: "concentric", elbowStyle: "fitting", teeLength: 1.8, elbowLength: 1.8, reducerLength: 1.8, flowInside: 0.35 };

// a colour made darker (k < 0) or lighter (k > 0): any CSS colour
function shade(color, k) {
    return "color-mix(in srgb, " + color + " " + Math.round((1 - Math.abs(k)) * 100) + "%, " + (k < 0 ? "black" : "white") + ")";
}
function pnum(p, key) { const v = Number(p[key]); return p[key] === undefined || p[key] === "" || !isFinite(v) ? PIPE_DEFAULTS[key] : v; }
function unitOf(a, b) { const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; return { x: dx / l, y: dy / l }; }
function along(q, u, s) { return { x: q.x + u.x * s, y: q.y + u.y * s }; }
function seg() { return "M" + Array.from(arguments).map((q) => q.x.toFixed(1) + " " + q.y.toFixed(1)).join(" L"); }
function poly(list) { return list.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" "); }
// a band across a pipe at q (the pipe along u): a weld line (extra 0) or a flange ring
function bandPts(q, u, w, extra, thick) {
    const n = { x: -u.y, y: u.x }, h = w / 2 + extra, a = along(q, u, -thick / 2), b = along(q, u, thick / 2);
    return poly([[a.x + n.x * h, a.y + n.y * h], [b.x + n.x * h, b.y + n.y * h], [b.x - n.x * h, b.y - n.y * h], [a.x - n.x * h, a.y - n.y * h]]);
}
// a taper from a (width wa) to b (width wb), its narrow end moved sideways by off (an eccentric reducer)
function taper(a, b, wa, wb, off) {
    const u = unitOf(a, b), n = { x: -u.y, y: u.x };
    return poly([[a.x + n.x * wa / 2, a.y + n.y * wa / 2], [b.x + n.x * (wb / 2 + off), b.y + n.y * (wb / 2 + off)], [b.x - n.x * (wb / 2 - off), b.y - n.y * (wb / 2 - off)], [a.x - n.x * wa / 2, a.y - n.y * wa / 2]]);
}

/** The corners of the drawn path that bend (an elbowed line's elbows too), each with its two directions. */
function pipeBends(pts, routing) {
    if (routing === "curved") return [];
    let all = pts;
    if (routing === "orthogonal") {
        all = [];
        pts.forEach((q, i) => { if (i > 0) { const a = all[all.length - 1]; if (a.x !== q.x && a.y !== q.y) all.push({ x: q.x, y: a.y }); } all.push({ x: q.x, y: q.y }); });
    }
    const out = [];
    for (let i = 1; i < all.length - 1; i++) {
        const a = all[i - 1], k = all[i], c = all[i + 1];
        if (Math.abs((k.x - a.x) * (c.y - k.y) - (k.y - a.y) * (c.x - k.x)) <= 0.5) continue;
        out.push({ k: k, u1: unitOf(a, k), u2: unitOf(k, c), l1: Math.hypot(k.x - a.x, k.y - a.y), l2: Math.hypot(c.x - k.x, c.y - k.y) });
    }
    return out;
}

/** The points as the tube is drawn: an end that goes into another's junction, or that ends in a reducer, stops short. */
function pipeDrawPoints(p, pts, D) {
    const out = pts.map((q) => ({ x: q.x, y: q.y }));
    [0, pts.length - 1].forEach((i) => {
        const f = pts[i].fit;
        if (!f) return;
        let cut = 0;
        if (f.k === "into") cut = Number(f.trim) || 0;
        else if (f.k === "joint" && p.fittings !== false && pnum(p, "reducerLength") > 0 && p.reducerStyle !== "step") cut = pnum(p, "reducerLength") * Math.max(D, Number(f.d) || D);
        if (!cut) return;
        const j = i === 0 ? 1 : pts.length - 2, len = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
        out[i] = along(pts[i], unitOf(pts[i], pts[j]), Math.min(cut, len * 0.9));
    });
    return out;
}

/** The corner radius the tube is drawn with: what the elbow style asks for (fittings off: the line's own corner radius). */
function pipeRadius(p, D) {
    if (p.routing === "curved") return 0;
    if (p.fittings === false) return Number(p.cornerRadius) || 0;
    const st = p.elbowStyle || PIPE_DEFAULTS.elbowStyle;
    return st === "sharp" ? 0 : st === "long" ? D * 1.8 : D * 0.9;
}

/**
 * Where along the line the particles are inside a fitting, as stretches of the line's points [{ at: {x, y}, reach }] (the particles there
 * show at flowInside).
 */
function pipeZones(p, pts, D) {
    if (p.look !== "pipe" || p.fittings === false) return [];
    const z = [];
    const elb = p.elbowStyle || PIPE_DEFAULTS.elbowStyle;
    if (elb === "fitting" || elb === "flanged") pipeBends(pts, p.routing).forEach((b) => z.push({ at: b.k, reach: pnum(p, "elbowLength") * D }));
    pts.forEach((q, i) => {
        const f = q.fit;
        if (!f) return;
        if (f.k === "tee" || f.k === "cross") z.push({ at: q, reach: pnum(p, "teeLength") * Math.max(D, Number(f.d) || D) });
        if (f.k === "into") z.push({ at: q, reach: Number(f.trim) || 0 });
        if (f.k === "joint") z.push({ at: q, reach: pnum(p, "reducerLength") * Math.max(D, Number(f.d) || D) });
    });
    return z;
}

/** The pipe: every tube, shell, cone, band of this line and of the junctions it draws, layer by layer. */
function pipeView(p, pts, D, dashes, marchStyle, dashLen) {
    const base = p.pipeColor || "#8a99ad";
    const wall = shade(base, -0.45), light = shade(base, 0.45), shell = shade(base, -0.12);
    const level = p.liquid ? Math.max(0, Math.min(1, p.liquidLevel === undefined || p.liquidLevel === "" ? 1 : Number(p.liquidLevel))) : 0;
    const on = p.fittings !== false;
    const teeSt = on ? (p.teeStyle || PIPE_DEFAULTS.teeStyle) : "seamless";
    const redSt = p.reducerStyle || PIPE_DEFAULTS.reducerStyle;
    const elbSt = on ? (p.elbowStyle || PIPE_DEFAULTS.elbowStyle) : "none";
    const inside = Math.max(0, Math.min(1, pnum(p, "flowInside"))), veil = on ? 1 - inside : 0;
    const radius = pipeRadius(p, D);
    const tubes = [{ d: linePath(pipeDrawPoints(p, pts, D), p.routing, radius), w: D }];
    const shells = [], cones = [], over = [], veils = [], fits = [];

    // elbows: a shell along the bend, reaching elbowLength along each pipe (never past half a stretch), welds or flanges at its ends
    if (elbSt === "fitting" || elbSt === "flanged") {
        pipeBends(pts, p.routing).forEach((b) => {
            const L = Math.min(pnum(p, "elbowLength") * D, b.l1 / 2, b.l2 / 2), r = Math.min(radius, L);
            const e1 = along(b.k, b.u1, -L), e2 = along(b.k, b.u2, L), p1 = along(b.k, b.u1, -r), p2 = along(b.k, b.u2, r);
            shells.push({ d: seg(e1, p1) + " Q" + b.k.x.toFixed(1) + " " + b.k.y.toFixed(1) + " " + p2.x.toFixed(1) + " " + p2.y.toFixed(1) + " L" + e2.x.toFixed(1) + " " + e2.y.toFixed(1), w: D * 1.26 });
            const fl = elbSt === "flanged";
            over.push(svg`<polygon data-band points="${bandPts(e1, b.u1, D * 1.26, fl ? 4 : 0, fl ? 5 : 1.6)}" fill="${fl ? shell : wall}" stroke="${fl ? wall : "none"}"></polygon>`);
            over.push(svg`<polygon data-band points="${bandPts(e2, b.u2, D * 1.26, fl ? 4 : 0, fl ? 5 : 1.6)}" fill="${fl ? shell : wall}" stroke="${fl ? wall : "none"}"></polygon>`);
            fits.push("elbow");
        });
    }
    pts.forEach((q, i) => {
        const f = q.fit;
        if (!f) return;
        if (f.k === "tee" || f.k === "cross") {
            // the junction: this run and every branch, each its first stretch, drawn with the rest so the inside joins up
            const W = Math.max(D, Number(f.d) || D), L = pnum(p, "teeLength") * W;
            const own = [];
            if (i > 0) own.push({ u: unitOf(q, pts[i - 1]), w: D });
            if (i < pts.length - 1) own.push({ u: unitOf(q, pts[i + 1]), w: D });
            const branches = own.concat((f.dirs || []).map((u) => ({ u: { x: u.x, y: u.y }, w: Number(u.w) || D })));
            branches.forEach((b) => {
                const end = along(q, b.u, L);
                tubes.push({ d: seg(q, end), w: b.w });
                if (teeSt === "fitting" || teeSt === "flanged") {
                    shells.push({ d: seg(q, end), w: W * 1.28 });
                    const fl = teeSt === "flanged";
                    over.push(svg`<polygon data-band points="${bandPts(end, b.u, W * 1.28, fl ? 4 : 0, fl ? 5 : 1.6)}" fill="${fl ? shell : wall}" stroke="${fl ? wall : "none"}"></polygon>`);
                }
            });
            if (teeSt === "saddle") {
                const run = own[0] ? own[0].u : { x: 1, y: 0 }, ang = Math.atan2(run.y, run.x) * 180 / Math.PI;
                const ell = (op) => svg`<ellipse cx="${q.x}" cy="${q.y}" rx="${W * 1.25}" ry="${W * 0.78}" transform="rotate(${ang} ${q.x} ${q.y})" fill="${shell}" fill-opacity="${op}" stroke="${wall}" stroke-width="1.5"></ellipse>`;
                shells.push({ ellipse: ell(1) });
                veils.push(ell(veil));
            }
            fits.push(f.k);
        }
        if (f.k === "joint" && (i === 0 || i === pts.length - 1) && on) {
            // the reducer: from the wider pipe's width at the joint to this one's, reducerLength x the wider along this pipe
            const next = pts[i === 0 ? 1 : pts.length - 2], u = unitOf(q, next), W = Math.max(D, Number(f.d) || D);
            if (redSt === "step") {
                over.push(svg`<polygon data-band points="${bandPts(q, u, W, 1, 4)}" fill="${shell}" stroke="${wall}"></polygon>`);
                tubes.push({ d: seg(q, along(q, u, 2)), w: D });
            } else {
                const L = Math.min(pnum(p, "reducerLength") * W, Math.hypot(next.x - q.x, next.y - q.y) * 0.9), s = along(q, u, L);
                const off = redSt === "eccentric" ? (W - D) / 2 : 0;
                cones.push({ wall: taper(q, s, W, D, off), body: taper(q, s, W * 0.8, D * 0.8, off), liq: taper(q, s, W * 0.6 * level, D * 0.6 * level, off) });
                if (redSt === "flanged") {
                    over.push(svg`<polygon data-band points="${bandPts(q, u, W, 4, 5)}" fill="${shell}" stroke="${wall}"></polygon>`);
                    over.push(svg`<polygon data-band points="${bandPts(s, u, D, 4, 5)}" fill="${shell}" stroke="${wall}"></polygon>`);
                }
            }
            fits.push("reducer");
        }
    });

    const layer = (list, k, color, extra) => list.filter((t) => t.d).map((t) => svg`<path d="${t.d}" fill="none" stroke="${color}" stroke-width="${t.w * k}" stroke-linejoin="round" stroke-linecap="butt" opacity="${extra === undefined ? 1 : extra}"></path>`);
    return svg`<g data-pipe data-fittings="${fits.join(" ")}">
        ${shells.map((s) => s.ellipse || svg`<path d="${s.d}" fill="none" stroke="${wall}" stroke-width="${s.w}" stroke-linejoin="round"></path>`)}
        ${layer(tubes, 1, wall)}
        ${cones.map((c) => svg`<polygon points="${c.wall}" fill="${wall}"></polygon>`)}
        ${shells.filter((s) => s.d).map((s) => svg`<path d="${s.d}" fill="none" stroke="${shell}" stroke-width="${s.w * 0.84}" stroke-linejoin="round"></path>`)}
        ${layer(tubes, 0.8, base)}
        ${cones.map((c) => svg`<polygon points="${c.body}" fill="${shell}"></polygon>`)}
        ${level > 0 ? svg`<g data-liquid opacity="0.92">${layer(tubes, 0.6 * level, p.liquidColor || "#2f8fff")}${cones.map((c) => svg`<polygon points="${c.liq}" fill="${p.liquidColor || "#2f8fff"}"></polygon>`)}</g>` : nothing}
        ${layer(tubes, 0.18, light, 0.8)}
        ${layer(tubes, 0.06, "#ffffff", 0.5)}
        ${veil > 0 ? svg`<g data-veil>${shells.filter((s) => s.d).map((s) => svg`<path d="${s.d}" fill="none" stroke="${shell}" stroke-width="${s.w * 0.84}" stroke-linejoin="round" opacity="${veil}"></path>`)}${cones.map((c) => svg`<polygon points="${c.body}" fill="${shell}" opacity="${veil}"></polygon>`)}${veils}</g>` : nothing}
        ${over}
        ${dashes ? svg`<path class="dashes" style="${marchStyle}" d="${linePath(pts, p.routing, radius)}" fill="none" stroke="${shade(base, 0.7)}" stroke-width="${Math.max(2, D * 0.22)}" stroke-dasharray="${dashLen},${dashLen}" stroke-linecap="round"></path>` : nothing}
    </g>`;
}

export const flowLine = defineComponent({
    category: "Basic",
    id: "kufayeka-flow-line", label: "Flow Line", icon: "fa fa-code-fork", size: { w: 184, h: 24 },
    help: "A line or an arrow bent at its points, with particles that run along it (a flow in a pipe, a conveyor). Drag its points on the canvas; drop a point on a component's connection point, or on a point of another line, to connect it. Bind Running to a status to start and stop the flow.",
    // its points are its shape: no resize or turn handle (the box follows the points), no flip
    capabilities: { resizable: false, rotatable: false, flippable: false, lockable: true },
    editor: { points: "points" },
    properties: {
        points: { type: "list", default: DEFAULT_POINTS, hidden: true, bindable: false },
        connect: { type: "boolean", default: true, group: "Shape", label: "Connect points to components",
            help: "While a point is dragged near a component, its 8 connection points show and the point snaps to them. Off: it only joins other lines' points." },
        routing: { type: "enum", default: "straight", group: "Shape", label: "Corners", style: "segmented",
            options: [{ value: "straight", label: "Straight" }, { value: "orthogonal", label: "Elbows" }, { value: "curved", label: "Curved" }] },
        cornerRadius: { type: "number", default: 0, min: 0, max: 200, unit: "px", group: "Shape", label: "Corner radius",
            // a pipe's corners are its elbow style's (fittings off: this radius again)
            visibleWhen: (p) => p.routing !== "curved" && (p.look !== "pipe" || p.fittings === false) },
        look: { type: "enum", default: "plain", group: "Shape", label: "Look", style: "segmented",
            options: [{ value: "plain", label: "Line", icon: "fa fa-minus" }, { value: "pipe", label: "Pipe", icon: "fa fa-circle-o" }],
            help: "Pipe: a tube with its fittings drawn by themselves (an elbow on each bend, a tee or a cross where pipes branch, a reducer where a narrower pipe meets a wider one)." },
        stroke: Object.assign(stroke("#4a6fa5"), { visibleWhen: (p) => p.look !== "pipe" }),
        strokeWidth: Object.assign({}, strokeWidth, { default: 3, visibleWhen: (p) => p.look !== "pipe" }),
        strokeStyle: Object.assign({}, STROKE_STYLE, { visibleWhen: (p) => p.look !== "pipe" }),
        diameter: { type: "number", default: 16, min: 2, max: 200, unit: "px", group: "Pipe", label: "Diameter", visibleWhen: (p) => p.look === "pipe",
            help: "Pipes of other diameters joined end to end get a reducer between them." },
        pipeColor: { type: "color", default: "#8a99ad", group: "Pipe", label: "Pipe colour", visibleWhen: (p) => p.look === "pipe" },
        fittings: { type: "boolean", default: true, group: "Pipe", label: "Fittings (elbows, tees, reducers)", visibleWhen: (p) => p.look === "pipe" },
        teeStyle: { type: "enum", default: "flanged", group: "Pipe", label: "Tee style", visibleWhen: (p) => p.look === "pipe" && p.fittings !== false,
            help: "How a tee or a cross looks where this pipe is the main run.",
            options: [{ value: "seamless", label: "Seamless (no body)" }, { value: "fitting", label: "Tee fitting (welded)" }, { value: "flanged", label: "Flanged tee" }, { value: "saddle", label: "Saddle (branch outlet)" }] },
        teeLength: { type: "number", default: 1.8, min: 0.6, max: 6, step: 0.1, unit: "× Ø", group: "Pipe", label: "Tee length", visibleWhen: (p) => p.look === "pipe" && p.fittings !== false,
            help: "How far the tee reaches along each pipe, in diameters." },
        elbowStyle: { type: "enum", default: "fitting", group: "Pipe", label: "Elbow style", visibleWhen: (p) => p.look === "pipe" && p.fittings !== false,
            options: [{ value: "sharp", label: "Sharp (mitre)" }, { value: "long", label: "Long radius bend" }, { value: "fitting", label: "Elbow fitting (welded)" }, { value: "flanged", label: "Flanged elbow" }] },
        elbowLength: { type: "number", default: 1.8, min: 0.6, max: 6, step: 0.1, unit: "× Ø", group: "Pipe", label: "Elbow length",
            visibleWhen: (p) => p.look === "pipe" && p.fittings !== false && (p.elbowStyle === undefined || p.elbowStyle === "fitting" || p.elbowStyle === "flanged"),
            help: "How far the elbow reaches along each pipe from the corner, in diameters." },
        reducerStyle: { type: "enum", default: "concentric", group: "Pipe", label: "Reducer style", visibleWhen: (p) => p.look === "pipe" && p.fittings !== false,
            help: "Where this pipe is the narrower one, joined end to end to a wider pipe.",
            options: [{ value: "concentric", label: "Concentric" }, { value: "eccentric", label: "Eccentric (one side flat)" }, { value: "step", label: "Bushing (step)" }, { value: "flanged", label: "Flanged" }] },
        reducerLength: { type: "number", default: 1.8, min: 0.3, max: 6, step: 0.1, unit: "× Ø", group: "Pipe", label: "Reducer length",
            visibleWhen: (p) => p.look === "pipe" && p.fittings !== false && p.reducerStyle !== "step", help: "How long the cone is, in diameters of the wider pipe." },
        flowInside: { type: "range", default: 0.35, min: 0, max: 1, step: 0.05, group: "Pipe", label: "Flow inside fittings",
            visibleWhen: (p) => p.look === "pipe" && p.fittings !== false,
            help: "How much of the liquid and the particles shows inside a tee, an elbow or a reducer, so the fitting is seen: 0 = hidden, 1 = all." },
        liquid: { type: "boolean", default: false, group: "Pipe", label: "Liquid inside", visibleWhen: (p) => p.look === "pipe" },
        liquidColor: { type: "color", default: "#2f8fff", group: "Pipe", label: "Liquid colour", visibleWhen: (p) => p.look === "pipe" && !!p.liquid },
        liquidLevel: { type: "range", default: 1, min: 0, max: 1, step: 0.05, group: "Pipe", label: "Liquid level", visibleWhen: (p) => p.look === "pipe" && !!p.liquid,
            help: "How full the pipe looks, 0 to 1. Bind it to a level or a flow." },
        lineOpacity: { type: "range", default: 1, min: 0, max: 1, step: 0.05, group: "Shape", label: "Line opacity" },
        arrowStart: { type: "boolean", default: false, group: "Shape", label: "Arrow at the start", visibleWhen: (p) => p.look !== "pipe" },
        arrowEnd: { type: "boolean", default: true, group: "Shape", label: "Arrow at the end", visibleWhen: (p) => p.look !== "pipe" },
        running: { type: "boolean", default: true, group: FLOW, label: "Running", help: "Bind it to a status (a pump on) to start and stop the flow." },
        motion: { type: "enum", default: "particles", group: FLOW, label: "Shows the flow as", style: "segmented",
            options: [{ value: "particles", label: "Particles" }, { value: "dashes", label: "Moving dashes" }, { value: "none", label: "Nothing" }] },
        particle: { type: "enum", default: "dot", group: FLOW, label: "Particle", options: PARTICLE_SHAPES, visibleWhen: (p) => p.motion === "particles" },
        particleIcon: { type: "string", default: "fa fa-tint", group: FLOW, label: "Icon (class)", visibleWhen: (p) => p.motion === "particles" && p.particle === "icon" },
        particleImage: { type: "asset", default: "", group: FLOW, label: "Picture", visibleWhen: (p) => p.motion === "particles" && p.particle === "image" },
        particleFit: { type: "enum", default: "contain", group: FLOW, label: "Picture fit", visibleWhen: (p) => p.motion === "particles" && p.particle === "image",
            help: "How the picture fills the particle's square (its Size).",
            options: [{ value: "contain", label: "Whole picture (contain)" }, { value: "cover", label: "Fill the box (cover)" }, { value: "stretch", label: "Stretch" }] },
        count: { type: "number", default: 4, min: 1, max: 200, step: 1, group: FLOW, label: "How many", help: "1 = one object running along it; more = copies spread evenly.", visibleWhen: (p) => p.motion === "particles" },
        particleSize: { type: "number", default: 8, min: 2, max: 200, unit: "px", group: FLOW, label: "Size", visibleWhen: (p) => p.motion === "particles" },
        particleColor: { type: "color", default: "#00a3ff", group: FLOW, label: "Colour", visibleWhen: (p) => p.motion === "particles" && p.particle !== "image" },
        particleOpacity: { type: "range", default: 1, min: 0, max: 1, step: 0.05, group: FLOW, label: "Particle opacity", visibleWhen: (p) => p.motion === "particles" },
        turnAlong: { type: "boolean", default: true, group: FLOW, label: "Turn with the line (through every bend)",
            help: "On: each particle keeps its angle to the line, so it turns at every bend (water in a pipe). Off: every particle keeps one fixed angle.",
            visibleWhen: (p) => p.motion === "particles" },
        turnSmooth: { type: "number", default: 16, min: 0, max: 400, unit: "px", group: FLOW, label: "Turn smoothly over",
            help: "How much of the line a particle takes to turn through a bend: 0 = at once, more = a gentle turn.",
            visibleWhen: (p) => p.motion === "particles" && p.turnAlong !== false },
        particleRotation: { type: "number", default: 0, min: -360, max: 360, step: 15, unit: "°", group: FLOW, label: "Particle rotation",
            help: "Turns each particle by this much: on top of the line's direction when it turns with the line (an icon drawn pointing up: 90), or its fixed angle when it does not.",
            visibleWhen: (p) => p.motion === "particles" },
        speed: { type: "number", default: 80, min: 1, max: 5000, unit: "px/s", group: FLOW, label: "Speed", visibleWhen: (p) => p.motion !== "none" },
        reverse: { type: "boolean", default: false, group: FLOW, label: "Backwards (end to start)", visibleWhen: (p) => p.motion !== "none" },
        repeat: { type: "enum", default: "loop", group: FLOW, label: "Repeat", style: "segmented", visibleWhen: (p) => p.motion === "particles",
            options: [{ value: "loop", label: "Loop" }, { value: "once", label: "Once" }] },
        easing: { type: "enum", default: "linear", group: FLOW, label: "Easing", visibleWhen: (p) => p.motion === "particles",
            options: [{ value: "linear", label: "Even" }, { value: "ease-in-out", label: "Slow at the ends" }, { value: "ease-in", label: "Speeds up" }, { value: "ease-out", label: "Slows down" }] }
    },
    events: { click: { label: "Clicked" }, cycle: { label: "On Cycle End", help: "A particle reached the end (each time round in a loop; once in Once)." } },
    actions: {
        start: { label: "Start", help: "Runs the flow (whatever Running says)." },
        stop: { label: "Stop", help: "Stops the flow where it is." },
        reverse: { label: "Reverse", help: "Turns the direction round." },
        restart: { label: "Restart", help: "Starts the particles from the beginning (a Once run again)." }
    },
    view: class extends NexaElement {
        static styles = css`
            :host { display: block; width: 100%; height: 100%; position: relative; }
            svg.line { position: absolute; left: 0; top: 0; overflow: visible; }
            .p { position: absolute; left: 0; top: 0; pointer-events: none; will-change: transform; }
            .dashes { animation: march var(--d) linear infinite; }
            @keyframes march { to { stroke-dashoffset: var(--o); } }
        `;
        constructor() { super(); this._run = null; this._flip = false; this._gen = 0; this._seen = true; this._anims = []; this._key = ""; }
        start() { this._run = true; this.requestUpdate(); }
        stop() { this._run = false; this.requestUpdate(); }
        reverse() { this._flip = !this._flip; this._key = ""; this.requestUpdate(); }
        restart() { this._gen++; this._run = true; this._key = ""; this.requestUpdate(); }
        connectedCallback() {
            super.connectedCallback();
            // out of view: paused (nothing moves that nobody sees)
            if (typeof IntersectionObserver === "function") {
                this._io = new IntersectionObserver((entries) => { this._seen = entries.some((e) => e.isIntersecting); this._play(); });
                this._io.observe(this);
            }
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this._io) { this._io.disconnect(); this._io = null; }
            this._anims.forEach((a) => a.cancel());
            this._anims = [];
        }
        mounted() {
            // a loop's "cycle" event: a few checks a second of the first particle's round (no work per frame)
            this.every(200, () => {
                const a = this._anims[0];
                if (!a || !this._loop || !this._ms) return;
                const r = Math.floor((Number(a.currentTime) || 0) / this._ms);
                if (r > this._round) { this._round = r; this.emit("cycle", {}); }
            });
        }
        _running() { return this._run === null ? this.p.running !== false : this._run; }
        /** The speed in px/s as set or bound: 0 (or less) stands still. Only a missing or unreadable value is the default 80. */
        _speed() {
            const v = this.p.speed;
            const n = v === undefined || v === null || v === "" ? 80 : Number(v);
            return isFinite(n) ? n : 80;
        }
        _play() {
            const on = this._running() && this._seen && this._speed() > 0;
            this._anims.forEach((a) => { if (on && a.playState !== "running" && a.playState !== "finished") a.play(); else if (!on && a.playState === "running") a.pause(); });
        }
        /**
         * The particles' animations, made again only when what they run ALONG changes (the shape, the count, the direction ...). The speed is
         * not one of those: a speed that changes (bound to a value that rises every moment) only changes how fast the same animations play
         * (their playback rate), so every particle keeps its place and speeds up or slows down smoothly. Making them again would throw them
         * all back to the start each time: they would shake on the spot, faster and faster as the value rises.
         */
        updated(changed) {
            super.updated(changed);
            const p = this.p;
            const els = Array.from(this.renderRoot.querySelectorAll(".p"));
            const path = this.renderRoot.querySelector("[data-line]");
            const key = [JSON.stringify(p.points), p.routing, p.cornerRadius, p.look, p.diameter, p.fittings, p.elbowStyle, p.teeLength, p.elbowLength, p.reducerLength, p.flowInside, p.count, p.reverse, p.repeat, p.easing, p.turnAlong, p.turnSmooth, p.particleRotation, p.particleSize, p.particle, this._gen, this._flip, els.length].join("|");
            if (key !== this._key) {
                this._key = key;
                this._anims.forEach((a) => a.cancel());
                this._anims = [];
                if (els.length && path && typeof path.getTotalLength === "function" && typeof els[0].animate === "function") {
                    const { len, samples } = samplePath(path, 6, p.turnAlong !== false ? p.turnSmooth : 0);
                    const half = Math.max(2, Number(p.particleSize) || 8) / 2;
                    const turn = p.turnAlong !== false;
                    const spin = Number(p.particleRotation) || 0;
                    // inside a pipe's fittings the particles fade to flowInside (an opacity keyframe: the compositor runs it too)
                    const D = Math.max(2, Number(p.diameter) || 16);
                    const zones = pipeZones(p, Array.isArray(p.points) ? p.points : DEFAULT_POINTS, D).map((z) => {
                        let best = 0, bd = Infinity;
                        samples.forEach((q, j) => { const dd = Math.hypot(q.x - z.at.x, q.y - z.at.y); if (dd < bd) { bd = dd; best = j; } });
                        return { at: (len * best) / Math.max(1, samples.length - 1), reach: z.reach };
                    });
                    const faded = Math.max(0, Math.min(1, pnum(p, "flowInside")));
                    const frames = samples.map((q, j) => {
                        const f = { transform: "translate(" + (q.x - half) + "px," + (q.y - half) + "px) rotate(" + ((turn ? q.a : 0) + spin) + "deg)" };
                        if (zones.length) { const at = (len * j) / Math.max(1, samples.length - 1); f.opacity = zones.some((z) => Math.abs(at - z.at) <= z.reach) ? faded : 1; }
                        return f;
                    });
                    // timed at the speed of now (80 while it stands still); later speeds are a playback rate against this one
                    this._base = this._speed() > 0 ? this._speed() : 80;
                    const ms = Math.max(50, (len / this._base) * 1000);
                    const once = p.repeat === "once";
                    const back = !!p.reverse !== this._flip;
                    // a loop's "cycle": the first particle's rounds, counted by the one slow check in mounted()
                    this._ms = ms; this._loop = !once; this._round = 0;
                    els.forEach((el, i) => {
                        // spread evenly: each starts a share of the run later (a negative delay: already on its way round)
                        const a = el.animate(frames, { duration: ms, iterations: once ? 1 : Infinity, easing: p.easing || "linear",
                            direction: back ? "reverse" : "normal", delay: once ? (ms / els.length) * i : -(ms / els.length) * i, fill: once ? "both" : "none" });
                        if (i === els.length - 1 && once) a.onfinish = () => this.emit("cycle", {});
                        this._anims.push(a);
                    });
                }
            }
            // the speed of now, as how fast the animations play: each particle goes on from where it is
            const speed = this._speed();
            if (speed > 0 && this._base) {
                const rate = speed / this._base;
                this._anims.forEach((a) => {
                    if (Math.abs(a.playbackRate - rate) < 1e-9) return;
                    if (typeof a.updatePlaybackRate === "function") a.updatePlaybackRate(rate); else a.playbackRate = rate;
                });
            }
            this._play();
        }
        render() {
            const p = this.p;
            const pts = Array.isArray(p.points) && p.points.length >= 2 ? p.points : DEFAULT_POINTS;
            const d = linePath(pts, p.routing, Number(p.cornerRadius) || 0);
            const sw = p.strokeWidth !== undefined && p.strokeWidth !== "" ? Number(p.strokeWidth) : 3;
            const color = p.stroke || "#4a6fa5";
            // the moving dashes stand still at speed 0 too
            const play = this._running() && this._speed() > 0 ? "running" : "paused";
            const back = !!p.reverse !== this._flip;
            const speed = Math.max(1, this._speed());
            const dashes = p.motion === "dashes";
            const n = p.motion === "particles" ? Math.max(1, Math.min(200, Math.round(Number(p.count) || 1))) : 0;
            const size = Math.max(2, Number(p.particleSize) || 8);
            const dashLen = Math.max(4, sw * 3);
            // the arrow head in pixels: grows with the stroke, but slower (a thick pipe does not get a giant head)
            const arrow = Math.round(8 + sw * 2);
            const lineOpacity = p.lineOpacity === undefined || p.lineOpacity === "" ? 1 : Number(p.lineOpacity);
            const particleOpacity = p.particleOpacity === undefined || p.particleOpacity === "" ? 1 : Number(p.particleOpacity);
            const one = particleView(p, size, p.particleColor || "#00a3ff");
            const parts = [];
            for (let i = 0; i < n; i++) parts.push(html`<div class="p" data-particle="${i}">${one}</div>`);
            const marchStyle = dashes ? "--d:" + (dashLen * 2 / speed) + "s;--o:" + (back ? dashLen * 2 : -dashLen * 2) + ";animation-play-state:" + play : "";
            if (p.look === "pipe") {
                const D = Math.max(2, Number(p.diameter) || 16);
                // the whole run with the elbow style's corners: what the particles follow (through the junctions too) and what is clicked
                const full = linePath(pts, p.routing, pipeRadius(p, D));
                return html`<svg class="line" width="100%" height="100%" @click="${() => this.emit("click", {})}">
                        ${svg`<path d="${full}" fill="none" stroke="transparent" stroke-width="${D + 6}" style="pointer-events:stroke"></path>
                        <g opacity="${lineOpacity}">${pipeView(p, pts, D, dashes, marchStyle, Math.max(4, D * 0.6))}</g>
                        <path data-line d="${full}" fill="none" stroke="none"></path>`}
                    </svg><div class="parts" style="opacity:${particleOpacity}">${parts}</div>`;
            }
            // marker ids are local to this component's shadow root
            return html`<svg class="line" width="100%" height="100%" @click="${() => this.emit("click", {})}">
                    ${svg`<defs>
                        <marker id="fl-start" viewBox="0 0 6 6" markerWidth="${arrow}" markerHeight="${arrow}" markerUnits="userSpaceOnUse" refX="2" refY="3" orient="auto"><path d="M5,0 L0,3 L5,6 Z" fill="${color}"></path></marker>
                        <marker id="fl-end" viewBox="0 0 6 6" markerWidth="${arrow}" markerHeight="${arrow}" markerUnits="userSpaceOnUse" refX="4" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 Z" fill="${color}"></path></marker>
                    </defs>
                    <path d="${d}" fill="none" stroke="transparent" stroke-width="${Math.max(12, sw + 8)}" style="pointer-events:stroke"></path>
                    <g opacity="${lineOpacity}"><path class="${dashes ? "dashes" : ""}" style="${marchStyle}" d="${d}" fill="none" stroke="${color}" stroke-width="${sw}"
                        stroke-dasharray="${dashes ? dashLen + "," + dashLen : dash(p.strokeStyle, sw)}" stroke-linecap="round" stroke-linejoin="round"
                        marker-start="${p.arrowStart ? "url(#fl-start)" : nothing}" marker-end="${p.arrowEnd ? "url(#fl-end)" : nothing}" data-line></path></g>`}
                </svg><div class="parts" style="opacity:${particleOpacity}">${parts}</div>`;
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
