const { version } = require("../../package.json");
const manifest = require("../manifest-base.json");

const fs = require("fs");

const finalManifest = {
    ...manifest,
    version,
};

if (!fs.existsSync("build")) fs.mkdirSync("build");

fs.writeFileSync("build/manifest.json", JSON.stringify(finalManifest, null, 2));
