const path = require("path");
const express = require("express");

// Backend half of this component plugin. The Rectangle component is plain
// DOM/CSS (needs nothing here). The Text Label component is a Lit-based Web
// Component — its bundled, dependency-free build (see ../dist, produced by
// esbuild from widgets/src/text-label-element.js) needs to be reachable by
// the browser via a plain <script src>, so it has to be served as a static
// file — from BOTH RED.httpAdmin (the editor loads it while designing
// screens) AND RED.httpNode (deployed pages, viewed by anyone with the
// screen's URL, are served from that separate PUBLIC app — see
// @kufayeka/node-red-nexa-dashboard/lib/nexa-plugin.js).
//
// type: "nexa-ui-component-package" + runtimeScripts is how the dashboard
// core discovers what to <script src> into a deployed page without hard-
// coding knowledge of this specific package — RED.plugins.getByType(...)
// finds every installed component package this way.
module.exports = function (RED) {
  RED.plugins.registerPlugin("kufayeka-nexa-component-basic-shapes", {
    type: "nexa-ui-component-package",
    runtimeScripts: [
      "/nexa-component-basic-shapes/vendor/text-label-element.bundle.js",
      "/nexa-component-basic-shapes/vendor/basic-shapes-components.js"
    ],
    onadd: function () {
      const staticDir = express.static(path.join(__dirname, "..", "dist"));
      if (RED.httpAdmin) {
        RED.httpAdmin.use("/nexa-component-basic-shapes/vendor", staticDir);
      }
      if (RED.httpNode) {
        RED.httpNode.use("/nexa-component-basic-shapes/vendor", staticDir);
      }
    }
  });
};
