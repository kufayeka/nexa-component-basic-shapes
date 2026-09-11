// Hand-written, NOT esbuild output (unlike text-label-element.bundle.js in
// this same folder) — plain framework-free JS needs no compile step. Lives
// in dist/ anyway so ONE static route (mounted on both RED.httpAdmin, for
// the editor, and RED.httpNode, for deployed pages — see
// ../widgets/basic-shapes-plugin.js) serves this whole package's client
// assets, editor and runtime alike.
(function () {
    // Required first line for any Nexa component plugin: component and core
    // plugin scripts load via a bundle/route with no guaranteed order
    // between packages (bit this codebase twice already for the same
    // reason — RED.asset being per-plugin-object, and RED.nodes.getType
    // timing), so this queues safely even if node-red-nexa-dashboard's real
    // NEXA.registerComponent hasn't run yet, and gets flushed the moment it does.
    window.NEXA = window.NEXA || { _q: [], registerComponent: function (id, def) { this._q.push([id, def]); } };

    NEXA.registerComponent("kufayeka-rect", {
        category: "Basic",
        label: "Rectangle",
        icon: "fa fa-square-o",
        defaultSize: { w: 120, h: 80 },
        capabilities: { resizable: true, rotatable: true, flippable: true, lockable: true },
        defaults: {
            fill: { value: "#cfe0ff", type: "color" },
            stroke: { value: "#4a6fa5", type: "color" }
        },
        bindable: ["props.fill", "props.stroke"],
        // Every event a component fires is defined HERE, by the plugin —
        // {name, label} lets this component choose its own specific,
        // human-friendly palette label ("Rectangle #xxxx -> Clicked")
        // instead of the dashboard synthesizing a generic "on <name>" one.
        // `name` is what ctx.emit(name, payload) below must match.
        events: [{ name: "click", label: "Clicked" }],
        // Plain DOM/CSS — no framework needed for something this simple.
        render: function (el, props, ctx) {
            el.style.background = props.fill;
            el.style.border = "1px solid " + props.stroke;
            el.style.boxSizing = "border-box";
            // Plain assignment (not addEventListener) is deliberate: render()
            // re-runs on every prop change/live-bind, and this must stay
            // idempotent rather than stacking a new listener each time.
            el.onclick = function () { ctx.emit("click", { msg: 'hi yeKaa' }); };
        },
        onBind: function (el, target, value) {
            if (target === "props.fill") el.style.background = value;
            if (target === "props.stroke") el.style.border = "1px solid " + value;
        }
    });

    NEXA.registerComponent("kufayeka-text-label", {
        category: "Basic",
        label: "Text Label",
        icon: "fa fa-font",
        defaultSize: { w: 140, h: 30 },
        capabilities: { resizable: true, rotatable: true, flippable: false, lockable: true },
        defaults: {
            text: { value: "Text", type: "text" },
            color: { value: "#333333", type: "color" },
            fontSize: { value: 14, type: "number" }
        },
        bindable: ["props.text", "props.color"],
        // Lit-based Web Component (nexa-text-label, defined in
        // text-label-element.bundle.js loaded alongside this file) — proves
        // the framework-agnostic contract: render() just creates/updates a
        // custom element, same shape as the plain-DOM Rectangle above.
        render: function (el, props) {
            var wc = el.querySelector("nexa-text-label");
            if (!wc) {
                wc = document.createElement("nexa-text-label");
                el.appendChild(wc);
            }
            wc.text = props.text;
            wc.color = props.color;
            wc.fontSize = props.fontSize;
            try {
                if (props.text !== undefined) wc.setAttribute("text", props.text);
                if (props.color !== undefined) wc.setAttribute("color", props.color);
            } catch (e) {}
        },
        onBind: function (el, target, value) {
            var wc = el.querySelector("nexa-text-label");
            if (!wc) {
                wc = document.createElement("nexa-text-label");
                el.appendChild(wc);
            }
            if (target === "props.text") {
                wc.text = value;
                try { wc.setAttribute("text", value); } catch (e) {}
            }
            if (target === "props.color") {
                wc.color = value;
                try { wc.setAttribute("color", value); } catch (e) {}
            }
        }
    });
})();
