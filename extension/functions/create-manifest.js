const { version } = require("../../package.json");
const manifest = require("../manifest-base.json");

const fs = require("fs");
const path = require("path");

const finalManifest = {
    ...manifest,
    version,
};

if (!fs.existsSync("build")) fs.mkdirSync("build");

console.log("Creating manifest.json in", path.join(process.cwd, "build"));

fs.writeFileSync("build/manifest.json", JSON.stringify(finalManifest, null, 2));

console.log("Done!");
