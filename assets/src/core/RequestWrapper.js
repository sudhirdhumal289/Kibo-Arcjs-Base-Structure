const Logger = require('./Logger');

const logger = new Logger();

class RequestWrapper {
  init(controllerInstance, controllerMethod, config) {
    this.controllerInstance = controllerInstance;
    this.controllerMethod = controllerMethod;

    const defaultConfig = {
      sleepTimeInMilliSeconds: 500,
      timeoutInMilliSeconds: 29 * 1000,
    };
    this.config = Object.assign(defaultConfig, config || {});

    return this;
  }

  callControllerAction(request, response, context) {
    return new Promise((resolve, reject) => {
      if (!this.controllerInstance || !this.controllerInstance[this.controllerMethod]) {
        const errorMessage = `Controller or its method (${this.controllerMethod}) is not available.`;
        logger.error(errorMessage);

        reject(new Error(errorMessage));
        return;
      }

      try {
        const args = [request, response, context];
        // eslint-disable-next-line prefer-spread
        const returnValue = this.controllerInstance[this.controllerMethod].apply(this.controllerInstance, args);

        if (returnValue && returnValue.then) {
          returnValue.then((resp) => {
            if (resp && resp.redirectUrl) {
              context.response.redirect(resp.redirectUrl);
              resolve();
            } else if (resp) {
              resolve(resp);
            } else {
              resolve();
            }
          }).catch(reject);
        } else if (returnValue) {
          if (returnValue.redirectUrl) {
            context.response.redirect(returnValue.redirectUrl);
            resolve();
          } else {
            resolve(returnValue);
          }
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  service(context, callback) {
    const request = context.request || {};

    const contextResp = context.response ? context.response : {};
    // eslint-disable-next-line prefer-object-spread
    const response = {
      body: contextResp.body,
      redirect(redirectUrl) {
        response.redirectUrl = redirectUrl;
      },
    };

    // TODO - Check if Arc.js built-in action or custom-route action and pass req, resp accordingly
    // TODO - Set security headers
    // TODO - Check auth token validity
    // TODO - Check request source

    const controllerActionPromise = this.callControllerAction(request, response, context);

    let timeElapsed = 0;
    const waitInterval = setInterval(() => {
      timeElapsed += this.config.sleepTimeInMilliSeconds;

      if (timeElapsed >= this.config.timeoutInMilliSeconds) {
        callback(new Error('Function execution timed-out'));
        clearInterval(waitInterval);
      }
    }, this.config.sleepTimeInMilliSeconds);

    controllerActionPromise.then((resp) => {
      clearInterval(waitInterval);
      callback(resp || undefined);
    }).catch((error) => {
      clearInterval(waitInterval);
      callback(error || undefined);
    });
  }
}

module.exports = RequestWrapper;
