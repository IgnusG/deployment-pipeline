const targetURL = {
    'chrome': 'https://chrome.google.com/webstore/detail/',
    'firefox': 'https://addons.mozilla.org/en-US/firefox/addon/'
};

const tokenURLAndBody = {
    'chrome': ['https://www.googleapis.com/oauth2/v4/token', {
        client_id: process.env['chrome_client_id'],
        client_secret: process.env['chrome_client_secret'],
        refresh_token: process.env['chrome_refresh_token'],
        grant_type: 'refresh_token'
    }]
};

const environmentID = {
    'chrome-public': process.env['chrome_public'],
    'chrome-preview': process.env['chrome_preview'],
    'firefox-public': process.env['firefox_public']
}

function checkIfEnvironmentExists(target, environment) {
    const root = targetURL[target];
    const id = environmentID[environment];

    console.log('Root, ID', root, id);

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

    console.log('Result', result);

    return result;
}

async function fetchListing(environment) {
    const [target, channel] = environment.split('-');

    console.log('Target, Channel', target, channel);

    if (!checkIfEnvironmentExists(target, environment))
        return '';

    if (channel === 'preview') {
        return fetchWithToken(target);
    } else {
        return fetchWithoutToken(target);
    }
}

async function check(version, environment) {
    const listing = await fetchListing(environment);
    const versionMatcher = new RegExp(`<meta itemprop="version" content="${version}"\\/>`)

    if (listing === '')
        return 'error';

    if (listing.test(versionMatcher))
        return 'success';

    return 'pending';
}

module.exports = check;
