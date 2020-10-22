const fetch = require(`${process.env.GITHUB_WORKSPACE}/.github/pipeline/node_modules/node-fetch/lib/index.js`);

const targetURL = {
    'chrome': 'https://chrome.google.com/webstore/detail/',
    'firefox': 'https://addons.mozilla.org/en-US/firefox/addon/'
};

const tokenURLAndBody = {
    'chrome': ['https://www.googleapis.com/oauth2/v4/token', {
        client_id: process.env.CHROME_CLIENT_ID,
        client_secret: process.env.CHROME_CLIENT_SECRET,
        refresh_token: process.env.CHROME_REFRESH_TOKEN,
        grant_type: 'refresh_token'
    }]
};

const environmentID = {
    'chrome-public': process.env.CHROME_PUBLIC,
    'chrome-preview': process.env.CHROME_PREVIEW,
    'firefox-public': process.env.FIREFOX_PUBLIC
}

function checkIfEnvironmentExists(target, environment) {
    const root = targetURL[target];
    const id = environmentID[environment];

    if (!root) return false;
    if (!id) return false;

    return true;
}

async function fetchWithToken(target) {
    const [url, body] = tokenURLAndBody[target];

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const { access_token } = await response.json();

    return fetchWithoutToken(target, {
        'Authorization': `Bearer ${access_token}`
    });
}

async function fetchWithoutToken(target, headers = {}) {
    const root = targetURL[target];
    const response = await fetch(`${root}/${environmentID}`, {
        headers
    });
    const result = await response.text();

    return result;
}

async function fetchListing(environment) {
    const [target, channel] = environment.split('-');

    if (!checkIfEnvironmentExists(target, environment))
        return [''];

    if (channel === 'preview') {
        return fetchWithToken(target);
    } else {
        return fetchWithoutToken(target);
    }
}

async function check(version, environment) {
    try {
        const listing = await fetchListing(environment);
        const versionMatcher = new RegExp(`<meta itemprop="version" content="${version}"\\/>`)

        if (listing === '')
            return ['remove'];

        if (versionMatcher.test(listing))
            return ['success', `Version ${version} is published`];

        return ['pending'];
    } catch (error) {
        return ['error', error.message];
    }
}

module.exports = check;
