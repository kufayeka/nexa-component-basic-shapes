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

    await ok('flow line: its path through the points (elbows), the arrow, particles that move along it as transform animations; Stop / Reverse / Running; two opacities; out of view: paused', async () => {
        const r = await js(`(async function () {
            var d = NEXA.getComponent("kufayeka-flow-line");
            var props = {}; Object.keys(d.defaults).forEach(function (k) { props[k] = d.defaults[k].value; });
            props.points = [{ id: "p1", x: 12, y: 12 }, { id: "p2", x: 212, y: 12 }, { id: "p3", x: 212, y: 112 }];
            props.routing = "orthogonal"; props.count = 3; props.speed = 200; props.lineOpacity = 0.4; props.particleOpacity = 0.7;
            NexaTest.mount("fl", "kufayeka-flow-line", props, { width: 224, height: 124 });
            await NexaTest.settle();
            var wc = NexaTest.wc("fl"), root = wc.renderRoot;
            var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
            var anims = function () { return root.querySelector("[data-particle='0']").getAnimations(); };
            var at = function () { var b = root.querySelector("[data-particle='0']").getBoundingClientRect(); return Math.round(b.left) + "," + Math.round(b.top); };
            // in view (the harness mounts it below the fold, where it is rightly paused)
            wc.scrollIntoView(); await wait(200);
            var line = root.querySelector("[data-line]");
            var out = { d: line.getAttribute("d"), arrow: line.getAttribute("marker-end"), particles: root.querySelectorAll("[data-particle]").length,
                editor: d.nexa && d.nexa.editor && d.nexa.editor.points, defaults: Object.keys(d.defaults).join(","),
                lineOpacity: line.parentNode.getAttribute("opacity"), particleOpacity: root.querySelector(".parts").style.opacity,
                transformOnly: anims().length === 1 && Object.keys(anims()[0].effect.getKeyframes()[0]).indexOf("transform") !== -1 && Object.keys(anims()[0].effect.getKeyframes()[0]).indexOf("left") === -1 };
            out.diag = [anims()[0].playState, wc._seen, JSON.stringify(wc.getBoundingClientRect())]; var a = at(); await wait(250); out.moves = at() !== a;
            wc.stop(); await NexaTest.settle(); await wait(60); out.stopState = anims()[0].playState; a = at(); await wait(250); out.stopped = at() === a;
            wc.start(); await NexaTest.settle(); out.startState = anims()[0].playState;
            wc.reverse(); await NexaTest.settle(); out.reversed = anims()[0].effect.getTiming().direction;
            NexaTest.setProps("fl", { running: false }); wc._run = null; await NexaTest.settle();
            out.paused = anims()[0].playState;
            NexaTest.setProps("fl", { running: true }); await NexaTest.settle();
            wc._seen = false; wc._play(); out.offscreen = anims()[0].playState; wc._seen = true; wc._play();
            NexaTest.setProps("fl", { turnAlong: false, particleRotation: 90 }); await NexaTest.settle();
            out.rotation = anims()[0].effect.getKeyframes()[0].transform;
            NexaTest.setProps("fl", { motion: "dashes" }); await NexaTest.settle();
            out.dashes = [root.querySelectorAll("[data-particle]").length, root.querySelector("[data-line]").getAttribute("class")];
            return out;
        })()`);
        assert.strictEqual(r.d, 'M12 12 L212 12 L212 112');
        assert.strictEqual(r.arrow, 'url(#fl-end)');
        assert.strictEqual(r.particles, 3);
        assert.strictEqual(r.editor, 'points', 'the canvas edits its points');
        assert.ok(/connect/.test(r.defaults) && /lineOpacity/.test(r.defaults) && /particleOpacity/.test(r.defaults) && !/(^|,)(from|to|opacity)(,|$)/.test(r.defaults), r.defaults);
        assert.deepStrictEqual([r.lineOpacity, r.particleOpacity], ['0.4', '0.7'], 'the line and the particles each their own opacity');
        assert.ok(r.transformOnly, 'the particles run as a transform animation (the compositor), nothing that needs layout');
        assert.ok(r.moves, 'the particles move along the line: ' + JSON.stringify(r.diag));
        assert.ok(r.stopped && r.stopState === 'paused', 'Stop holds them where they are: ' + r.stopState);
        assert.strictEqual(r.startState, 'running');
        assert.strictEqual(r.reversed, 'reverse');
        assert.strictEqual(r.paused, 'paused', 'Running off (a binding) pauses them');
        assert.strictEqual(r.offscreen, 'paused', 'out of view: paused');
        assert.ok(String(r.rotation).indexOf('rotate(90deg)') !== -1, 'Particle rotation 90 (not turning with the line): ' + r.rotation);
        assert.deepStrictEqual(r.dashes, [0, 'dashes'], 'Moving dashes: no particles, the stroke marches');
    });

    await ok('flow line: a particle turns through every bend (0° along the top, 90° down the side, gradually at the corner); Turn with the line off: one fixed angle', async () => {
        const r = await js(`(async function () {
            var d = NEXA.getComponent("kufayeka-flow-line");
            var props = {}; Object.keys(d.defaults).forEach(function (k) { props[k] = d.defaults[k].value; });
            props.points = [{ id: "p1", x: 12, y: 12 }, { id: "p2", x: 212, y: 12 }, { id: "p3", x: 212, y: 212 }];
            props.count = 1; props.speed = 100;
            NexaTest.mount("bend", "kufayeka-flow-line", props, { width: 224, height: 224 });
            await NexaTest.settle();
            var wc = NexaTest.wc("bend"); wc.scrollIntoView();
            await new Promise(function (r) { setTimeout(r, 150); });
            // the angle the particle is drawn at, a share f of the way along (the animation held there)
            var angleAt = function (f) {
                var el = wc.renderRoot.querySelector("[data-particle='0']"), a = el.getAnimations()[0];
                a.pause(); a.currentTime = a.effect.getTiming().duration * f;
                var m = new DOMMatrix(getComputedStyle(el).transform);
                return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI);
            };
            var out = { top: angleAt(0.25), side: angleAt(0.75), corner: angleAt(0.5) };
            NexaTest.setProps("bend", { turnAlong: false }); await NexaTest.settle();
            out.offTop = angleAt(0.25); out.offSide = angleAt(0.75);
            return out;
        })()`);
        assert.strictEqual(r.top, 0, 'along the top: 0°');
        assert.strictEqual(r.side, 90, 'down the side: 90°');
        assert.ok(r.corner > 10 && r.corner < 80, 'at the corner it is turning (gradually): ' + r.corner);
        assert.deepStrictEqual([r.offTop, r.offSide], [0, 0], 'off: the same angle all the way');
    });

    await ok('flow line: a speed that keeps rising (bound to a value that grows every moment) speeds the particles up smoothly, never back to the start; speed 0 stands still', async () => {
        const r = await js(`(async function () {
            var d = NEXA.getComponent("kufayeka-flow-line");
            var props = {}; Object.keys(d.defaults).forEach(function (k) { props[k] = d.defaults[k].value; });
            props.points = [{ id: "p1", x: 12, y: 12 }, { id: "p2", x: 412, y: 12 }];
            props.count = 1; props.speed = 0;
            NexaTest.mount("fast", "kufayeka-flow-line", props, { width: 424, height: 24 });
            await NexaTest.settle();
            var wc = NexaTest.wc("fast"); wc.scrollIntoView();
            var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
            await wait(150);
            var el = wc.renderRoot.querySelector("[data-particle='0']");
            var anim = function () { return el.getAnimations()[0]; };
            var out = { zeroState: anim().playState, built: 0, back: 0, steps: [] };
            var first = anim();
            // the value rises every 50 ms, as liquid does: speed = 0.1 * liquid
            var last = -1;
            for (var liquid = 100; liquid <= 1500; liquid += 100) {
                NexaTest.setProps("fast", { speed: 0.1 * liquid }); await NexaTest.settle();
                await wait(50);
                var a = anim();
                if (a !== first) out.built++;
                var t = Number(a.currentTime) || 0;
                if (t < last) out.back++;
                last = t;
                out.steps.push(Math.round(t));
            }
            out.rate = anim().playbackRate;
            out.running = anim().playState;
            NexaTest.setProps("fast", { speed: 0 }); await NexaTest.settle();
            out.stopped = anim().playState;
            return out;
        })()`);
        assert.strictEqual(r.zeroState, 'paused', 'speed 0 (liquid 0) stands still, not the default 80');
        assert.strictEqual(r.built, 0, 'the same animation all along (not made again at each new speed)');
        assert.strictEqual(r.back, 0, 'never thrown back towards the start: ' + JSON.stringify(r.steps));
        assert.strictEqual(r.running, 'running');
        assert.ok(r.rate > 1, 'it plays faster as the speed rises: rate ' + r.rate);
        assert.strictEqual(r.stopped, 'paused', 'back to 0: it stands still where it is');
    });

    await ok('flow line, Pipe look: the tee draws every branch layer by layer (one liquid through the junction), a branch end into it is drawn short, the styles and lengths are its own, the flow fades inside fittings', async () => {
        const r = await js(`(async function () {
            var d = NEXA.getComponent("kufayeka-flow-line");
            var base = {}; Object.keys(d.defaults).forEach(function (k) { base[k] = d.defaults[k].value; });
            var main = Object.assign({}, base, { look: "pipe", diameter: 20, motion: "particles", count: 12, liquid: true, liquidLevel: 1,
                points: [{ id: "p1", x: 20, y: 20 }, { id: "p2", x: 200, y: 20, fit: { k: "tee", d: 20, dirs: [{ x: 0, y: 1, w: 20 }] } }, { id: "p3", x: 400, y: 20 }, { id: "p4", x: 400, y: 200 }] });
            NexaTest.mount("pm", "kufayeka-flow-line", main, { width: 440, height: 240 });
            NexaTest.mount("pb", "kufayeka-flow-line", Object.assign({}, base, { look: "pipe", diameter: 20, motion: "none", points: [{ id: "p1", x: 20, y: 20, fit: { k: "into", trim: 36 } }, { id: "p2", x: 20, y: 200 }] }), { width: 60, height: 240 });
            NexaTest.mount("pr", "kufayeka-flow-line", Object.assign({}, base, { look: "pipe", diameter: 10, motion: "none", liquid: true, points: [{ id: "p1", x: 20, y: 20, fit: { k: "joint", d: 20 } }, { id: "p2", x: 300, y: 20 }] }), { width: 340, height: 40 });
            await NexaTest.settle();
            var root = function (id) { return NexaTest.wc(id).renderRoot; };
            var fits = function (id) { return (root(id).querySelector("[data-pipe]").dataset.fittings || "").split(" ").filter(Boolean).sort(); };
            var liquidPaths = function (id) { return root(id).querySelectorAll("[data-liquid] path").length; };
            var out = { main: fits("pm"), mainLiquids: liquidPaths("pm"), red: fits("pr"), flanges: root("pm").querySelectorAll("[data-band]").length,
                veil: !!root("pm").querySelector("[data-veil]") };
            // the branch's tube starts 36 below its end (into the tee); its particles' line still starts at the tee
            var tube = root("pb").querySelector("[data-pipe] > path:not(.dashes)").getAttribute("d");
            out.branchTube = tube.split(" L")[0];
            out.branchLine = root("pb").querySelector("[data-line]").getAttribute("d").split(" L")[0];
            // the particles fade inside the fittings: an opacity keyframe of flowInside (0.35) inside, 1 outside
            var frames = root("pm").querySelector("[data-particle='0']").getAnimations()[0].effect.getKeyframes();
            out.opacities = Array.from(new Set(frames.map(function (f) { return Number(f.opacity); }))).sort();
            // the styles and lengths: a seamless tee draws no flanges; a longer tee reaches further
            NexaTest.setProps("pm", { teeStyle: "seamless", elbowStyle: "sharp" }); await NexaTest.settle();
            out.seamlessBands = root("pm").querySelectorAll("[data-band]").length;
            out.sharp = fits("pm");
            NexaTest.setProps("pm", { teeStyle: "flanged", elbowStyle: "fitting", teeLength: 3 }); await NexaTest.settle();
            var stub = Array.from(root("pm").querySelectorAll("[data-pipe] > path")).map(function (p) { return p.getAttribute("d"); }).filter(function (dd) { return /^M200\\.0 20\\.0 L200\\.0 /.test(dd); })[0];
            out.longStub = stub;
            NexaTest.setProps("pm", { flowInside: 1 }); await NexaTest.settle();
            out.noVeil = !root("pm").querySelector("[data-veil]");
            NexaTest.setProps("pr", { reducerStyle: "flanged", reducerLength: 3 }); await NexaTest.settle();
            out.redFlanges = root("pr").querySelectorAll("[data-band]").length;
            out.redTube = root("pr").querySelector("[data-pipe] > path").getAttribute("d").split(" L")[0];
            return out;
        })()`);
        assert.deepStrictEqual(r.main, ['elbow', 'tee'], 'a tee and an elbow: ' + JSON.stringify(r.main));
        assert.ok(r.mainLiquids >= 4, 'the liquid of the run and of every branch stretch, drawn together: ' + r.mainLiquids);
        assert.deepStrictEqual(r.red, ['reducer']);
        assert.ok(r.flanges >= 5, 'flanged: 3 on the tee, 2 on the elbow: ' + r.flanges);
        assert.ok(r.veil, 'inside the fittings the flow is veiled (35%)');
        assert.strictEqual(r.branchTube, 'M20 56', 'the branch tube starts 36 short of the tee');
        assert.strictEqual(r.branchLine, 'M20 20', 'its particles still start at the tee');
        assert.deepStrictEqual(r.opacities, [0.35, 1], 'particles at 35% inside the fittings, 100% outside');
        assert.strictEqual(r.seamlessBands, 0, 'seamless tee, sharp elbow: no bands');
        assert.deepStrictEqual(r.sharp, ['tee'], 'a sharp elbow is no fitting');
        assert.strictEqual(r.longStub, 'M200.0 20.0 L200.0 80.0', 'tee length 3: the branch stretch reaches 3 x 20');
        assert.ok(r.noVeil, 'Flow inside fittings 100%: nothing veiled');
        assert.strictEqual(r.redFlanges, 2, 'a flanged reducer: a flange at each end');
        assert.strictEqual(r.redTube, 'M80 20', 'reducer length 3: the narrow tube starts after a 3 x 20 cone');
    });

    await ok('flow line: a picture particle fits its square as the SVG component fits its box: contain (default), cover, stretch', async () => {
        const r = await js(`(async function () {
            var d = NEXA.getComponent("kufayeka-flow-line");
            var props = {}; Object.keys(d.defaults).forEach(function (k) { props[k] = d.defaults[k].value; });
            var pic = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="10"><rect width="40" height="10" fill="red"/></svg>');
            Object.assign(props, { particle: "image", particleImage: pic, count: 1, particleSize: 20, points: [{ id: "p1", x: 12, y: 12 }, { id: "p2", x: 212, y: 12 }] });
            NexaTest.mount("pic", "kufayeka-flow-line", props, { width: 224, height: 24 });
            await NexaTest.settle();
            var fit = function () { var img = NexaTest.wc("pic").renderRoot.querySelector("[data-particle-img]"); return img ? img.style.objectFit : null; };
            var out = [d.defaults.particleFit && d.defaults.particleFit.value, fit()];
            NexaTest.setProps("pic", { particleFit: "cover" }); await NexaTest.settle(); out.push(fit());
            NexaTest.setProps("pic", { particleFit: "stretch" }); await NexaTest.settle(); out.push(fit());
            return out;
        })()`);
        assert.deepStrictEqual(r, ['contain', 'contain', 'cover', 'fill']);
    });

    await ok('inspector: tree groups from `group`, enums as choices, visibleWhen, edits', async () => {
        const r = await js(`(async function () {
            var ins = NexaTest.inspector("kufayeka-rect", {});
            await NexaTest.wait();
            // the property tree: groups are its top rows; a prop's widget is in the pane once picked
            var groupsOf = function (box) { return NexaTest.rows(box).filter(function (x) { return /^@[^/]+$/.test(x.id); }).map(function (x) { return x.label; }); };
            var shown = function (label) { return NexaTest.rows(ins.box).some(function (x) { return x.label === label; }); };
            var headings = groupsOf(ins.box);
            var strokeStyle = await ins.field("strokeStyle");
            var styleSel = [strokeStyle.localName + ":" + strokeStyle.label];
            var shadowColorBefore = shown("Shadow colour");
            var blur = (await ins.field("shadowBlur")).querySelector("input");
            blur.value = "6"; blur.dispatchEvent(new Event("change"));
            await NexaTest.wait();
            var shadowColorAfter = shown("Shadow colour");
            strokeStyle = await ins.field("strokeStyle");
            var dashed = Array.from(strokeStyle.querySelectorAll(".knx-seg-item")).find(function (b) { return b.textContent.trim() === "Dashed"; });
            dashed.click(); await NexaTest.wait();
            var out = { headings: headings, styleSel: styleSel, before: shadowColorBefore, after: shadowColorAfter, props: { shadowBlur: ins.props.shadowBlur, strokeStyle: ins.props.strokeStyle } };
            ins.destroy();
            var t = NexaTest.inspector("kufayeka-text-label", {});
            await NexaTest.wait();
            out.textHeadings = groupsOf(t.box);
            var wRow = NexaTest.rows(t.box).filter(function (x) { return x.label === "Weight"; })[0];
            out.weight = wRow ? (await t.field(wRow.id)).localName : null;
            t.destroy();
            return out;
        })()`);
        assert.deepStrictEqual(r.headings, ['Shape', 'Effects']);
        assert.ok(r.styleSel.indexOf('knx-segmented:Stroke style') !== -1, JSON.stringify(r.styleSel));
        assert.deepStrictEqual([r.before, r.after], [false, true], 'shadow colour appears once there is a blur');
        assert.deepStrictEqual(r.props, { shadowBlur: 6, strokeStyle: 'dashed' });
        assert.deepStrictEqual(r.textHeadings, ['Text', 'Box']);
        assert.strictEqual(r.weight, 'knx-select');
    });

    await ok('no JavaScript errors in the page', async () => {
        assert.deepStrictEqual(logs.filter((l) => !/Lit is in dev mode/.test(l)), []);
    });
    console.log(`\n${passed} passed`);
}).then((r) => { if (r === null) console.log('SKIP browser.test.js'); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
