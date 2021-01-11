const fs = require('fs');

const chrome = require('chrome-webstore-upload');

const target = process.env.TARGET;
const channel = process.env.CHANNEL;

if (!target || !channel) {
    throw new Error("Both CHANNEL and TARGET need to be passed in");
}

const asset = `dist/${target}-${channel}.zip`;

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
        if (channel === "development") return "trustedTesters";

        throw new Error(`Channel ${channel} unknown`);
    }

    const store = chrome({
        extensionId: process.env[`CHROME_${channel.toUpperCase()}`],
        clientId: process.env.CHROME_CLIENT_ID,
        clientSecret: process.env.CHROME_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    });

    const token = await store.fetchToken();
    const scope = getChromeScope(channel);

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
})().catch((error) => console.error("Failed", error));
