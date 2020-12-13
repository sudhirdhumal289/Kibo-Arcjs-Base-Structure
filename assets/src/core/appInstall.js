const ActionInstaller = require('mozu-action-helpers/installers/actions');
const CustomRoutesApi = require('mozu-node-sdk/clients/commerce/settings/general/customRouteSettings');
const PostInstall = require('../post-install');
const Logger = require('./Logger');
const PromiseUtils = require('../utils/PromiseUtils');
const globalConfig = require('../post-install/globalConfig');

const logger = new Logger();

function registerActions(actionIds, entrypointManifest, context) {
  const actionConfigurator = actionIds.reduce((finalConfig, currentActionId) => {
    // eslint-disable-next-line no-param-reassign
    finalConfig[currentActionId] = (customFunction) => {
      // eslint-disable-next-line no-param-reassign
      customFunction.configuration = entrypointManifest[currentActionId].configuration;
      return customFunction;
    };

    return finalConfig;
  }, {});

  const globalConfigurator = (currentConfig) => Object.assign(currentConfig || {}, globalConfig || {});

  const installer = new ActionInstaller({ context: context.apiContext });
  return installer.enableActions(context, globalConfigurator, actionConfigurator);
}

function registerCustomRoutes(actionIds, entrypointManifest, context) {
  logger.info('Actions registered successfully. Registering custom routes.');
  const tenant = context.get.tenant();

  return tenant.sites.map((site) => new Promise((resolve, reject) => {
    const customRoutesApi = new CustomRoutesApi();
    customRoutesApi.context.site = site.id;
    customRoutesApi.getCustomRouteSettings()
      .then((currentRoutesConfig) => {
        const updatedRoutes = currentRoutesConfig ? (currentRoutesConfig.routes || []) : [];

        actionIds.forEach((actionId) => {
          if (entrypointManifest[actionId].actionName === 'http.storefront.routes') {
            const existingRouteConfig = updatedRoutes.find((config) => config.functionId === actionId);
            const routeConfig = existingRouteConfig || {};
            routeConfig.template = entrypointManifest[actionId].customRoute || `api/${actionId}`;
            routeConfig.defaults = {};
            routeConfig.internalRoute = 'Arcjs';
            routeConfig.functionId = actionId;
            routeConfig.mappings = {};
            routeConfig.validators = {};

            if (!existingRouteConfig) {
              updatedRoutes.push(routeConfig);
            }
          }
        });

        const customRouteConfig = currentRoutesConfig || {};
        customRouteConfig.routes = updatedRoutes;
        customRoutesApi.updateCustomRouteSettings(customRouteConfig)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  }));
}

function postInstallAction(context, actions, currentIndex) {
  return new Promise((resolve) => {
    if (!actions[currentIndex]) {
      resolve();
      return;
    }

    const returnVal = actions[currentIndex](context);

    function nextTick() {
      postInstallAction(context, actions, currentIndex + 1)
        .then(resolve)
        .catch((error) => {
          logger.error({
            message: `Error occurred while running post install action(s). Error: ${error.message}`,
            stack: error.stack,
          });

          resolve();
        });
    }

    if (returnVal && returnVal.then) {
      returnVal.then(() => {
        if (actions.length === currentIndex + 1) {
          resolve();
        } else {
          nextTick();
        }
      })
        .catch((error) => {
          logger.error({
            message: `Error occurred while running post install action. Error: ${error.message}`,
            stack: error.stack,
          });

          if (actions.length === currentIndex + 1) {
            resolve();
          } else {
            nextTick();
          }
        });
    } else {
      nextTick();
    }
  });
}

function postInstall(context, callback) {
  logger.info('Custom route registration completed. Running post-install action(s).');

  postInstallAction(context, PostInstall.postInstallActions, 0)
    .then(() => {
      logger.info('Post install action(s) completed successfully.');
      callback();
    })
    .catch((error) => {
      logger.error({
        message: `Error occurred while running post install action(s). Error: ${error.message}`,
        stack: error.stack,
      });

      callback();
    });
}

function processManifestFile(context, manifestEntry) {
  return function manifestProcessor() {
    const actionIds = Object.keys(manifestEntry);

    return new Promise((resolve) => {
      function postRegisterActions() {
        Promise.all(registerCustomRoutes(actionIds, manifestEntry, context))
          .then(() => {
            postInstall(context, resolve);
          })
          .catch(() => {
            postInstall(context, resolve);
          });
      }

      registerActions(actionIds, manifestEntry, context)
        .then(postRegisterActions)
        .catch(postRegisterActions);
    });
  };
}

module.exports = (context, callback) => {
  // eslint-disable-next-line global-require
  const manifests = require('../bundles');
  const manifestProcessors = manifests.fileExports.map((manifestEntry) => processManifestFile(context, manifestEntry));

  PromiseUtils.allSettled(manifestProcessors)
    .then(() => callback())
    .catch(callback);
};
