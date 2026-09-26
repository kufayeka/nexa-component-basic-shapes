// Backend half of this component plugin: serves dist/ (the shapes.js ES
// module) to the editor and to deployed pages, and registers it so every
// deployed page loads it — see @kufayeka/node-red-nexa-dashboard/sdk/package.js.
// The editor side is widgets/basic-shapes-plugin.html.
module.exports = function (RED) {
    require("@kufayeka/node-red-nexa-dashboard/sdk/package")(RED, {
        id: "kufayeka-nexa-component-basic-shapes",
        name: "nexa-component-basic-shapes",
        dir: require("path").join(__dirname, "..", "dist"),
        modules: ["shapes.js"]
    });
};
