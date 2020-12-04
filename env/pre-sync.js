/* eslint-disable import/no-extraneous-dependencies,node/no-unpublished-require */
const commander = require('commander');
const fs = require('fs');
const path = require('path');

const appDetails = require('./app-details.json');

// eslint-disable-next-line node/no-unsupported-features/node-builtins
const fsPromise = fs.promises;

class PreSync {
  constructor() {
    const program = new commander.Command();

    program
      .requiredOption('-e, --env <environment>', 'Environment where code will be deployed')
      .parse(process.argv);

    this.createMozuConfig(program.env);
  }

  // Create token config file every-time we run the command
  async createMozuConfig(environment) {
    // eslint-disable-next-line no-console
    console.info('Creating mozu config file in project directory.');

    const configStoreFilePath = `${process.cwd()}${path.sep}mozu.config.json`;

    const mozuConfig = {
      baseUrl: 'https://home.mozu.com',
      developerAccountId: appDetails[environment].devAccountId,
      workingApplicationKey: appDetails[environment].appKey,
    };

    const mozuConfigStr = JSON.stringify(mozuConfig, null, '\t');

    await this.createFile(configStoreFilePath, Buffer.from(mozuConfigStr));
  }

  async createFile(filePath, fileContents) {
    let fileHandle = null;

    if (!(fileContents instanceof Buffer)) throw new TypeError('File contents needs to be wrapped in Buffer instance.');

    try {
      // Check if parent folders exists or not.
      await fsPromise.mkdir(path.dirname(filePath), {
        recursive: true,
      });

      fileHandle = await fsPromise.open(filePath, 'w');

      await fileHandle.write(fileContents, 0, fileContents.length, 0);
    } catch (e) {
      throw new Error('Failed to create the file with provided content.');
    } finally {
      // Close the stream opened to read the file contents.
      if (fileHandle && fileHandle.close) await fileHandle.close();
    }
  }
}

module.exports = new PreSync();
