'use strict';

// The eight basic components in a REAL browser (headless Chrome) through the
// Nexa SDK testkit: rendering from props, the click event, a live prop update
// (onBind) and the automatic inspector. Needs the dashboard built.
//   node test/browser.test.js         (skipped when Chrome is not installed)

const assert = require('assert');
const path = require('path');
const { withHarness } = require('@kufayeka/node-red-nexa-dashboard/sdk/testkit');

let passed = 0;
async function ok(label, fn) { await fn(); passed++; console.log('✔ ' + label); }

const IDS = ['kufayeka-rect', 'kufayeka-ellipse', 'kufayeka-triangle', 'kufayeka-diamond', 'kufayeka-star', 'kufayeka-line', 'kufayeka-path', 'kufayeka-text-label'];

withHarness({
    mounts: { '/nexa-component-basic-shapes/vendor': path.join(__dirname, '..', 'dist') },
    modules: ['/nexa-component-basic-shapes/vendor/shapes.js']
}, async ({ js, logs }) => {
    const settle = () => js('NexaTest.settle()');

    await ok('registers the eight components with their defaults (the saved prop names)', async () => {
        const d = await js(`${JSON.stringify(IDS)}.map(function (id) { var d = NEXA.getComponent(id); return d ? [d.category, Object.keys(d.defaults).join(",")] : null; })`);
        assert.ok(d.every((x) => x && x[0] === 'Basic'), JSON.stringify(d));
        assert.strictEqual(d[0][1], 'fill,stroke,strokeWidth,strokeStyle,borderRadius,opacity,shadowBlur,shadowColor');
        assert.strictEqual(d[7][1], 'text,color,fontSize,fontFamily,fontWeight,fontStyle,textAlign,textDecoration,lineHeight,letterSpacing,wordWrap,backgroundColor,padding');
    });

    await ok('each renders from its props and fires click with its payload', async () => {
        const r = await js(`(async function () {
            var out = {};
            ${JSON.stringify(IDS)}.forEach(function (id) {
                var props = {}; var d = NEXA.getComponent(id);
                Object.keys(d.defaults).forEach(function (k) { props[k] = d.defaults[k].value; });
                NexaTest.mount(id, id, props, { width: 120, height: 80 });
            });
            await NexaTest.settle();
            ${JSON.stringify(IDS)}.forEach(function (id) {
                var root = NexaTest.wc(id).renderRoot;
                var target = root.querySelector(".shape, .label-inner");
                target.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
                out[id] = { el: target.localName, poly: !!root.querySelector("polygon"), event: NexaTest.item(id).events[0] || null,
                    text: target.textContent.trim(), style: target.getAttribute("style") || "" };
            });
            return out;
        })()`);
        assert.deepStrictEqual(r['kufayeka-rect'].event, ['click', { fill: '#cfe0ff', stroke: '#4a6fa5' }]);
        assert.ok(/border:2px solid #4a6fa5/.test(r['kufayeka-rect'].style) && /border-radius:4px/.test(r['kufayeka-rect'].style), r['kufayeka-rect'].style);
        assert.ok(/border-radius:50%/.test(r['kufayeka-ellipse'].style));
        assert.deepStrictEqual(r['kufayeka-triangle'].event, ['click', { direction: 'up' }]);
        assert.ok(r['kufayeka-triangle'].poly && r['kufayeka-diamond'].poly && r['kufayeka-star'].poly);
        assert.strictEqual(r['kufayeka-text-label'].text, 'Text Label');
        assert.deepStrictEqual(r['kufayeka-text-label'].event, ['click', { text: 'Text Label' }]);
        assert.ok(IDS.every((id) => r[id].event && r[id].event[0] === 'click'));
    });

    await ok('a live prop update (Logic ui-update -> onBind) re-renders; a tag-bound text shows the tag value', async () => {
        const r = await js(`(async function () {
            var d = NEXA.getComponent("kufayeka-triangle"), el = NexaTest.item("kufayeka-triangle").el;
            d.onBind(el, "props.direction", "down"); d.onBind(el, "props.fill", "red");
            NexaTest.mount("bound", "kufayeka-text-label", { text: "{sparkplug:G::E::D::temp}" });
            NexaTest.setTag("bound", "21.5", "text");
            await NexaTest.settle();
            var poly = NexaTest.wc("kufayeka-triangle").renderRoot.querySelector("polygon");
            return [poly.getAttribute("points"), poly.getAttribute("fill"), NexaTest.wc("bound").renderRoot.querySelector(".label-inner").textContent.trim()];
        })()`);
        assert.deepStrictEqual(r, ['4,4 96,4 50,96', 'red', '21.5']);
    });

    await ok('line: arrows toggle the markers; dashed stroke', async () => {
        await js('NexaTest.setProps("kufayeka-line", { arrowEnd: true, strokeStyle: "dashed", strokeWidth: 2 })'); await settle();
        const r = await js(`(function () { var l = NexaTest.wc("kufayeka-line").renderRoot.querySelector("line");
            return [l.getAttribute("marker-end"), l.getAttribute("marker-start"), l.getAttribute("stroke-dasharray")]; })()`);
        assert.deepStrictEqual(r, ['url(#arr-end)', null, '6,6']);
    });

    await ok('automatic inspector: sections from `group`, enums as choices, visibleWhen, edits', async () => {
        const r = await js(`(async function () {
            var ins = NexaTest.inspector("kufayeka-rect", {});
            await NexaTest.wait();
            var headings = Array.from(ins.box.querySelectorAll(".nx-section-head .nx-title")).map(function (t) { return t.textContent; });
            var styleSel = Array.from(ins.box.querySelectorAll("nx-select, nx-segmented")).map(function (e) { return e.localName + ":" + e.label; });
            var shadowColorBefore = !!Array.from(ins.box.querySelectorAll("nx-color")).find(function (e) { return e.label === "Shadow colour"; });
            var blur = Array.from(ins.box.querySelectorAll("nx-number")).find(function (e) { return e.label === "Shadow blur"; }).querySelector("input");
            blur.value = "6"; blur.dispatchEvent(new Event("change"));
            await NexaTest.wait();
            var shadowColorAfter = !!Array.from(ins.box.querySelectorAll("nx-color")).find(function (e) { return e.label === "Shadow colour"; });
            var dashed = Array.from(ins.box.querySelectorAll("nx-segmented .nx-seg-item")).find(function (b) { return b.textContent.trim() === "Dashed"; });
            dashed.click(); await NexaTest.wait();
            var out = { headings: headings, styleSel: styleSel, before: shadowColorBefore, after: shadowColorAfter, props: { shadowBlur: ins.props.shadowBlur, strokeStyle: ins.props.strokeStyle } };
            ins.destroy();
            var t = NexaTest.inspector("kufayeka-text-label", {});
            await NexaTest.wait();
            out.textHeadings = Array.from(t.box.querySelectorAll(".nx-section-head .nx-title")).map(function (x) { return x.textContent; });
            out.weight = (Array.from(t.box.querySelectorAll("nx-select")).find(function (e) { return e.label === "Weight"; }) || {}).localName;
            t.destroy();
            return out;
        })()`);
        assert.deepStrictEqual(r.headings, ['Shape', 'Effects']);
        assert.ok(r.styleSel.indexOf('nx-segmented:Stroke style') !== -1, JSON.stringify(r.styleSel));
        assert.deepStrictEqual([r.before, r.after], [false, true], 'shadow colour appears once there is a blur');
        assert.deepStrictEqual(r.props, { shadowBlur: 6, strokeStyle: 'dashed' });
        assert.deepStrictEqual(r.textHeadings, ['Text', 'Box']);
        assert.strictEqual(r.weight, 'nx-select');
    });

    await ok('no JavaScript errors in the page', async () => {
        assert.deepStrictEqual(logs.filter((l) => !/Lit is in dev mode/.test(l)), []);
    });
    console.log(`\n${passed} passed`);
}).then((r) => { if (r === null) console.log('SKIP browser.test.js'); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
