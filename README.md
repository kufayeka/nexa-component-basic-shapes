# @kufayeka/nexa-component-basic-shapes

Nine basic components for Nexa Dashboard, written with the Nexa Component SDK
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
| `kufayeka-flow-line` Flow Line | points (set on the canvas, and per point in the Points list: fitting auto / none / elbow / tee / cross / reducer / flange / cap / valve, its own style and length, the diameter from it on, a valve's style, flip and opening (bindable), the particle speed from it on (bindable), X / Y; each point may be connected), connect, look (line / pipe), diameter, pipeColor, fittings, teeStyle (seamless / welded / flanged / saddle), teeLength, elbowStyle (sharp / long radius / welded / flanged), elbowLength, reducerStyle (concentric / eccentric / bushing / flanged), reducerLength, flowInside, centerLine (the white centre highlight: editor always, page only when on), valveStyle (gate / globe / ball / butterfly / control), valveOpenColor, valveClosedColor, liquid, liquidColor, liquidLevel, routing (straight / elbows / curved), cornerRadius, stroke, strokeWidth, strokeStyle, lineOpacity, arrowStart, arrowEnd, running, motion (particles / moving dashes / nothing), particle (dot, square, drop, arrow, icon, picture), particleIcon, particleImage, particleFit (contain / cover / stretch), count, particleSize, particleColor, particleOpacity, turnAlong, turnSmooth, particleRotation, speed (px/s), reverse, repeat (loop / once), easing | `click`, `cycle` (a particle reached the end). Actions: `start`, `stop`, `reverse`, `restart` |

Prop names are unchanged from the pre-SDK version, so saved screens keep working;
`strokeStyle`, `direction`, `fontWeight`, … are now real choices in the panel. Dropping a
Sparkplug metric on the canvas creates a Text Label bound to it.

### Flow Line

A line or an arrow bent at its points, with particles that run along it (a flow in a pipe, a conveyor). On the Design canvas a
selected Flow Line shows a handle on each point: drag to move (Shift: 0 / 45 / 90°), double click the line to add a point, double click
a point to remove it. While a point is dragged near a component, its 8 connection points (corners and side middles) show and the point
snaps to the nearest one: dropped there it is connected and follows that component when it is moved or resized. A point dropped on a
point of another Flow Line joins it (flowcharts). Any point may be connected, not only an end. Away from connection points, a dragged point lines up with the edges and middles of
the other components (smart guides), so a line runs down the middle of a pipe made of several pictures. With Turn with the line, each particle
turns through every bend (gradually over Turn smoothly over px). `connect` off: no component points, lines
still join. The line and the particles each have their own opacity. The particles run as Web Animations of `transform` (the GPU, not
the CPU) along the sampled path, and pause while the line is out of view; bind **Running** to a status (a pump on) to start and stop the
flow, or use the Update actions Start / Stop / Reverse / Restart. **Pipe look**: a tube drawn as layers of strokes along the path (every bend and curve right at once), an optional liquid as wide as its
level (bindable). Fittings are drawn by themselves, each in its style and length (in diameters): an elbow on each bend, a tee or a cross where pipes
branch, a reducer where a narrower pipe meets a wider one end to end. The pipe that owns a junction draws every branch there layer by
layer (walls, bodies, liquid ...), and the branches stop short of it, so the liquid and the particles run on through it without a seam;
inside a fitting they show at Flow inside fittings (default 35%), so the fitting is seen. A point dropped on the body of another line makes a new point there and joins it (a
branch: a tee). The editor works the fittings out and keeps them on the points (point.fit), so the page only draws them. **Each point its own** (the inspector Points list; a click on a point on the canvas opens its row): Fitting here overrides what the joins
and bends would make (None takes an elbow off, Elbow / Tee / Cross / Reducer / Flange / Cap ask for one, each with its own style and
length or the line's), and Diameter from here changes the pipe width from that point on, with a reducer drawn there (None: a plain step).

**Valves and flow sensors.** Set a point's Fitting to Valve and bind its Valve opening (0..100) to the valve's position: at 0 the particles of
the whole line stand still where they are (a closed valve stops a pipe without branches), above 0 they move. The valve is green when open,
red when closed, only on the part that shows the state (handwheel, light, lever, disc, actuator); the body sits between two flanges in the pipe's own metal. Valve flipped puts the stem on the other side. The opening never sets the speed: bind a point's Particle speed from here to a
flow sensor, and the particles run that fast from that point on (empty: as before it; 0: no flow). A new reading re-times the particles
where they are, so they never jump. With no flow sensor, leave the speeds as they are and let the valves start and stop the flow.
Its path is the SDK's `linePath` (SDK.md §11b-1).

```
dist/shapes.js                   the nine components (ES module, no build step)
widgets/basic-shapes-plugin.js   backend: one call to the SDK package helper
widgets/basic-shapes-plugin.html editor: <script type="module">
test/browser.test.js             headless Chrome through the SDK testkit (`npm test`, build the dashboard first)
```
