const fs = require("fs");
const path = require("path");

const chrome = require("chrome-webstore-upload");

const target = process.env.TARGET;
const channel = process.env.CHANNEL;

if (!target || !channel) {
    throw new Error("Both CHANNEL and TARGET need to be passed in");
}

const asset = `dist/${target}-${channel}.zip`;

console.log(`Publishing to ${target} under ${channel} from`, path.join(process.cwd(), asset));

if (!fs.existsSync(asset)) {
    fs.readdir("dist", (err, files) => {
        files.forEach(file => {
            console.log("Instead found", file);
        });
    });

    throw new Error(`Asset ${asset} does not exist`);
}

const package = fs.createReadStream(`dist/${target}-${channel}.zip`);

async function uploadChromePackage(channel) {
    function getChromeScope(channel) {
        if (channel === "live") return "default";
        if (channel === "developer") return "trustedTesters";

        throw new Error(`Channel ${channel} unknown`);
    }

    const extensionId = process.env[`CHROME_${channel.toUpperCase()}`];

    console.log(`Creating Chrome Store for extension ${extensionId}`);

    const store = chrome({
        extensionId,
        clientId: process.env.CHROME_CLIENT_ID,
        clientSecret: process.env.CHROME_CLIENT_SECRET,
        refreshToken: process.env.CHROME_REFRESH_TOKEN,
    });

    console.log("Fetching token...");

    const token = await store.fetchToken();
    const scope = getChromeScope(channel);

    console.log("Uploading & publishing extension...");

    await store.uploadExisting(package, token);
    await store.publish(scope, token);
}

function uploadFirefoxPackage() {
    throw new Error(
        "AUT-EXT-1: Due to https://github.com/mozilla/addons-server/issues/9913 " +
        "automatic Firefox extension publishing is not possible at this time"
    );
}

function uploadEdgePackage() {
    throw new Error(
        "AUT-EXT-1: Due to https://techcommunity.microsoft.com/t5/discussions/edge-extension-store-api/m-p/1280901 " +
        "automatic Edge extensions publishing is not possible at this time"
    );
}

(async () => {
    switch (target) {
        case "chrome": return uploadChromePackage(channel);
        case "firefox": return uploadFirefoxPackage(channel);
        case "edge": return uploadEdgePackage(channel);
        default: throw new Error(`Target ${target} unknown`);
    }
})().then(() => console.log("Done!")).catch((error) => {
    throw error;
});
