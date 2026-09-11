(function () {
    // Required first line for any Nexa component plugin: safely queue registrations
    // if core NEXA.registerComponent hasn't finished loading yet.
    window.NEXA = window.NEXA || { _q: [], registerComponent: function (id, def) { this._q.push([id, def]); } };

    function applyStrokeDash(el, style, sw) {
        var width = sw || 1;
        if (style === "dashed") return (width * 3) + "," + (width * 3);
        if (style === "dotted") return width + "," + (width * 2);
        return "";
    }

    // =========================================================================
    // 1. RECTANGLE
    // =========================================================================
    NEXA.registerComponent("kufayeka-rect", {
        category: "Basic",
        label: "Rectangle",
        icon: "fa fa-square-o",
        defaultSize: { w: 120, h: 80 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            fill: { value: "#cfe0ff", type: "color" },
            stroke: { value: "#4a6fa5", type: "color" },
            strokeWidth: { value: 2, type: "number" },
            strokeStyle: { value: "solid", type: "text" },
            borderRadius: { value: 4, type: "number" },
            opacity: { value: 1, type: "number" },
            shadowBlur: { value: 0, type: "number" },
            shadowColor: { value: "rgba(0,0,0,0.2)", type: "color" }
        },
        bindable: ["props.fill", "props.stroke", "props.strokeWidth", "props.borderRadius", "props.opacity"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
            var br = props.borderRadius !== undefined ? props.borderRadius : 4;
            var op = props.opacity !== undefined ? props.opacity : 1;
            var blur = props.shadowBlur || 0;
            var shadow = blur > 0 ? "0 2px " + blur + "px " + (props.shadowColor || "rgba(0,0,0,0.2)") : "none";

            el.style.backgroundColor = props.fill || "transparent";
            el.style.border = sw > 0 ? sw + "px " + (props.strokeStyle || "solid") + " " + (props.stroke || "#4a6fa5") : "none";
            el.style.borderRadius = br + "px";
            el.style.boxShadow = shadow;
            el.style.opacity = op;
            el.style.boxSizing = "border-box";
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", { fill: props.fill, stroke: props.stroke }); };
        },
        onBind: function (el, target, value) {
            if (target === "props.fill") el.style.backgroundColor = value;
            if (target === "props.stroke") el.style.borderColor = value;
            if (target === "props.strokeWidth") el.style.borderWidth = (value || 0) + "px";
            if (target === "props.borderRadius") el.style.borderRadius = (value || 0) + "px";
            if (target === "props.opacity") el.style.opacity = value;
        }
    });

    // =========================================================================
    // 2. CIRCLE / ELLIPSE
    // =========================================================================
    NEXA.registerComponent("kufayeka-ellipse", {
        category: "Basic",
        label: "Circle / Ellipse",
        icon: "fa fa-circle-o",
        defaultSize: { w: 100, h: 100 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            fill: { value: "#cfe0ff", type: "color" },
            stroke: { value: "#4a6fa5", type: "color" },
            strokeWidth: { value: 2, type: "number" },
            strokeStyle: { value: "solid", type: "text" },
            opacity: { value: 1, type: "number" },
            shadowBlur: { value: 0, type: "number" },
            shadowColor: { value: "rgba(0,0,0,0.2)", type: "color" }
        },
        bindable: ["props.fill", "props.stroke", "props.strokeWidth", "props.opacity"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
            var op = props.opacity !== undefined ? props.opacity : 1;
            var blur = props.shadowBlur || 0;
            var shadow = blur > 0 ? "0 2px " + blur + "px " + (props.shadowColor || "rgba(0,0,0,0.2)") : "none";

            el.style.backgroundColor = props.fill || "transparent";
            el.style.border = sw > 0 ? sw + "px " + (props.strokeStyle || "solid") + " " + (props.stroke || "#4a6fa5") : "none";
            el.style.borderRadius = "50%";
            el.style.boxShadow = shadow;
            el.style.opacity = op;
            el.style.boxSizing = "border-box";
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", { fill: props.fill, stroke: props.stroke }); };
        },
        onBind: function (el, target, value) {
            if (target === "props.fill") el.style.backgroundColor = value;
            if (target === "props.stroke") el.style.borderColor = value;
            if (target === "props.strokeWidth") el.style.borderWidth = (value || 0) + "px";
            if (target === "props.opacity") el.style.opacity = value;
        }
    });

    // =========================================================================
    // 3. TRIANGLE
    // =========================================================================
    NEXA.registerComponent("kufayeka-triangle", {
        category: "Basic",
        label: "Triangle",
        icon: "fa fa-play",
        defaultSize: { w: 100, h: 100 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            fill: { value: "#cfe0ff", type: "color" },
            stroke: { value: "#4a6fa5", type: "color" },
            strokeWidth: { value: 2, type: "number" },
            strokeStyle: { value: "solid", type: "text" },
            direction: { value: "up", type: "text" },
            opacity: { value: 1, type: "number" }
        },
        bindable: ["props.fill", "props.stroke", "props.strokeWidth", "props.direction", "props.opacity"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
            var dir = props.direction || "up";
            var pts = "50,4 96,96 4,96";
            if (dir === "down") pts = "4,4 96,4 50,96";
            else if (dir === "left") pts = "4,50 96,4 96,96";
            else if (dir === "right") pts = "4,4 96,50 4,96";

            var dash = applyStrokeDash(null, props.strokeStyle, sw);
            var dashAttr = dash ? ' stroke-dasharray="' + dash + '"' : "";

            el.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="display:block; overflow:visible;">' +
                '<polygon points="' + pts + '" fill="' + (props.fill || "transparent") + '" stroke="' + (props.stroke || "#4a6fa5") + '" stroke-width="' + sw + '"' + dashAttr + ' stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
                '</svg>';
            el.style.opacity = props.opacity !== undefined ? props.opacity : 1;
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", { direction: dir }); };
        },
        onBind: function (el, target, value) {
            var poly = el.querySelector("polygon");
            if (!poly) return;
            if (target === "props.fill") poly.setAttribute("fill", value || "transparent");
            if (target === "props.stroke") poly.setAttribute("stroke", value || "#4a6fa5");
            if (target === "props.strokeWidth") poly.setAttribute("stroke-width", value || 2);
            if (target === "props.opacity") el.style.opacity = value;
        }
    });

    // =========================================================================
    // 4. DIAMOND / RHOMBUS
    // =========================================================================
    NEXA.registerComponent("kufayeka-diamond", {
        category: "Basic",
        label: "Diamond",
        icon: "fa fa-square",
        defaultSize: { w: 100, h: 100 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            fill: { value: "#cfe0ff", type: "color" },
            stroke: { value: "#4a6fa5", type: "color" },
            strokeWidth: { value: 2, type: "number" },
            strokeStyle: { value: "solid", type: "text" },
            opacity: { value: 1, type: "number" }
        },
        bindable: ["props.fill", "props.stroke", "props.strokeWidth", "props.opacity"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
            var dash = applyStrokeDash(null, props.strokeStyle, sw);
            var dashAttr = dash ? ' stroke-dasharray="' + dash + '"' : "";

            el.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="display:block; overflow:visible;">' +
                '<polygon points="50,4 96,50 50,96 4,50" fill="' + (props.fill || "transparent") + '" stroke="' + (props.stroke || "#4a6fa5") + '" stroke-width="' + sw + '"' + dashAttr + ' stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
                '</svg>';
            el.style.opacity = props.opacity !== undefined ? props.opacity : 1;
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", {}); };
        },
        onBind: function (el, target, value) {
            var poly = el.querySelector("polygon");
            if (!poly) return;
            if (target === "props.fill") poly.setAttribute("fill", value || "transparent");
            if (target === "props.stroke") poly.setAttribute("stroke", value || "#4a6fa5");
            if (target === "props.strokeWidth") poly.setAttribute("stroke-width", value || 2);
            if (target === "props.opacity") el.style.opacity = value;
        }
    });

    // =========================================================================
    // 5. STAR
    // =========================================================================
    NEXA.registerComponent("kufayeka-star", {
        category: "Basic",
        label: "Star",
        icon: "fa fa-star-o",
        defaultSize: { w: 100, h: 100 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            fill: { value: "#fff3cd", type: "color" },
            stroke: { value: "#ffc107", type: "color" },
            strokeWidth: { value: 2, type: "number" },
            strokeStyle: { value: "solid", type: "text" },
            opacity: { value: 1, type: "number" }
        },
        bindable: ["props.fill", "props.stroke", "props.strokeWidth", "props.opacity"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
            var dash = applyStrokeDash(null, props.strokeStyle, sw);
            var dashAttr = dash ? ' stroke-dasharray="' + dash + '"' : "";

            var starPoints = "50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36";
            el.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="display:block; overflow:visible;">' +
                '<polygon points="' + starPoints + '" fill="' + (props.fill || "transparent") + '" stroke="' + (props.stroke || "#ffc107") + '" stroke-width="' + sw + '"' + dashAttr + ' stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
                '</svg>';
            el.style.opacity = props.opacity !== undefined ? props.opacity : 1;
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", {}); };
        },
        onBind: function (el, target, value) {
            var poly = el.querySelector("polygon");
            if (!poly) return;
            if (target === "props.fill") poly.setAttribute("fill", value || "transparent");
            if (target === "props.stroke") poly.setAttribute("stroke", value || "#ffc107");
            if (target === "props.strokeWidth") poly.setAttribute("stroke-width", value || 2);
            if (target === "props.opacity") el.style.opacity = value;
        }
    });

    // =========================================================================
    // 6. LINE / ARROW
    // =========================================================================
    NEXA.registerComponent("kufayeka-line", {
        category: "Basic",
        label: "Line",
        icon: "fa fa-minus",
        defaultSize: { w: 140, h: 24 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            stroke: { value: "#4a6fa5", type: "color" },
            strokeWidth: { value: 2, type: "number" },
            strokeStyle: { value: "solid", type: "text" },
            arrowStart: { value: false, type: "checkbox" },
            arrowEnd: { value: false, type: "checkbox" },
            opacity: { value: 1, type: "number" }
        },
        bindable: ["props.stroke", "props.strokeWidth", "props.opacity"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
            var color = props.stroke || "#4a6fa5";
            var dash = applyStrokeDash(null, props.strokeStyle, sw);
            var dashAttr = dash ? ' stroke-dasharray="' + dash + '"' : "";

            var markerStart = props.arrowStart ? ' marker-start="url(#nexa-arr-start)"' : "";
            var markerEnd = props.arrowEnd ? ' marker-end="url(#nexa-arr-end)"' : "";

            el.innerHTML = '<svg width="100%" height="100%" style="display:block; overflow:visible;">' +
                '<defs>' +
                '  <marker id="nexa-arr-start" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">' +
                '    <path d="M5,0 L0,3 L5,6 Z" fill="' + color + '"/>' +
                '  </marker>' +
                '  <marker id="nexa-arr-end" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">' +
                '    <path d="M0,0 L5,3 L0,6 Z" fill="' + color + '"/>' +
                '  </marker>' +
                '</defs>' +
                '<line x1="8" y1="50%" x2="calc(100% - 8px)" y2="50%" stroke="' + color + '" stroke-width="' + sw + '"' + dashAttr + markerStart + markerEnd + ' vector-effect="non-scaling-stroke"/>' +
                '</svg>';
            el.style.opacity = props.opacity !== undefined ? props.opacity : 1;
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", {}); };
        },
        onBind: function (el, target, value) {
            var line = el.querySelector("line");
            if (!line) return;
            if (target === "props.stroke") {
                line.setAttribute("stroke", value || "#4a6fa5");
                var defPaths = el.querySelectorAll("defs path");
                for (var i = 0; i < defPaths.length; i++) defPaths[i].setAttribute("fill", value || "#4a6fa5");
            }
            if (target === "props.strokeWidth") line.setAttribute("stroke-width", value || 2);
            if (target === "props.opacity") el.style.opacity = value;
        }
    });

    // =========================================================================
    // 7. FREEFORM / SVG PATH
    // =========================================================================
    NEXA.registerComponent("kufayeka-path", {
        category: "Basic",
        label: "Freeform Path",
        icon: "fa fa-pencil",
        defaultSize: { w: 120, h: 80 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            pathData: { value: "M 10 70 Q 50 10, 90 70 T 170 70", type: "text" },
            fill: { value: "none", type: "text" },
            stroke: { value: "#4a6fa5", type: "color" },
            strokeWidth: { value: 2, type: "number" },
            strokeStyle: { value: "solid", type: "text" },
            opacity: { value: 1, type: "number" }
        },
        bindable: ["props.pathData", "props.fill", "props.stroke", "props.strokeWidth", "props.opacity"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
            var dash = applyStrokeDash(null, props.strokeStyle, sw);
            var dashAttr = dash ? ' stroke-dasharray="' + dash + '"' : "";
            var d = props.pathData || "M 10 70 Q 50 10, 90 70 T 170 70";

            el.innerHTML = '<svg width="100%" height="100%" style="display:block; overflow:visible;">' +
                '<path d="' + d + '" fill="' + (props.fill || "none") + '" stroke="' + (props.stroke || "#4a6fa5") + '" stroke-width="' + sw + '"' + dashAttr + ' stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>';
            el.style.opacity = props.opacity !== undefined ? props.opacity : 1;
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", {}); };
        },
        onBind: function (el, target, value) {
            var p = el.querySelector("path");
            if (!p) return;
            if (target === "props.pathData") p.setAttribute("d", value || "");
            if (target === "props.fill") p.setAttribute("fill", value || "none");
            if (target === "props.stroke") p.setAttribute("stroke", value || "#4a6fa5");
            if (target === "props.strokeWidth") p.setAttribute("stroke-width", value || 2);
            if (target === "props.opacity") el.style.opacity = value;
        }
    });

    // =========================================================================
    // 8. TEXT LABEL (LIT WEB COMPONENT)
    // =========================================================================
    NEXA.registerComponent("kufayeka-text-label", {
        category: "Basic",
        label: "Text Label",
        icon: "fa fa-font",
        defaultSize: { w: 160, h: 36 },
        capabilities: { resizable: true, rotatable: true, flippable: false, lockable: true },
        defaults: {
            text: { value: "Text Label", type: "text" },
            color: { value: "#333333", type: "color" },
            fontSize: { value: 14, type: "number" },
            fontFamily: { value: "sans-serif", type: "text" },
            fontWeight: { value: "normal", type: "text" },
            fontStyle: { value: "normal", type: "text" },
            textAlign: { value: "left", type: "text" },
            textDecoration: { value: "none", type: "text" },
            lineHeight: { value: 1.2, type: "number" },
            letterSpacing: { value: 0, type: "number" },
            backgroundColor: { value: "transparent", type: "text" },
            padding: { value: 0, type: "number" },
            wordWrap: { value: false, type: "checkbox" }
        },
        bindable: ["props.text", "props.color", "props.fontSize", "props.fontFamily", "props.fontWeight", "props.textAlign", "props.backgroundColor"],
        events: [{ name: "click", label: "Clicked" }],
        render: function (el, props, ctx) {
            var wc = el.querySelector("nexa-text-label");
            if (!wc) {
                wc = document.createElement("nexa-text-label");
                el.appendChild(wc);
            }
            for (var k in props) {
                if (props.hasOwnProperty(k)) wc[k] = props[k];
            }
            el.onclick = function () { if (ctx && ctx.emit) ctx.emit("click", { text: props.text }); };
        },
        onBind: function (el, target, value) {
            var wc = el.querySelector("nexa-text-label");
            if (!wc) {
                wc = document.createElement("nexa-text-label");
                el.appendChild(wc);
            }
            if (target && target.indexOf("props.") === 0) {
                var key = target.slice(6);
                wc[key] = value;
            }
        }
    });
})();
