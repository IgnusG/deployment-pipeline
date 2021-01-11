# Creating a version (auto-publish on preview)

1. Go to https://github.com/$OWNER$/$REPO$/actions
2. Find `Bump Version` Workflow
3. Click on `Run Workflow`
4. Type in one of major/minor/patch to select which version number should be updated
    > This will create a new commit with the new version as well as a GitHub pre-release
    > The pre-release will be automatically published to the preview channel

# Promoting a preview version

1. Go to https://github.com/$OWNER$/$REPO$/releases
2. Find the release you wish to promote
3. Un-check the pre-release button and save the release
    > This will release the given version to all public targets where the publishing version is higher than the currently published one

# Checking when a version is available (after review)

1. Go to https://github.com/$OWNER$/$REPO$/deployments
2. Search for your $TARGET$ - $CHANNEL$ environment
3. `Success` means the version is available, `Pending` means it was successfully published but is still under review


## Others

### `extension/functions`

This is a default implementation of how the bundling, packaging and publishing steps should look like.
The bundling step should be the only one you need to adjust. The other two can be taken one to one.

### `functions`

Helper methods for resetting the development version of this repository to its pure state.
