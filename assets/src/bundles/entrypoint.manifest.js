const RequestWrapper = require('../core/RequestWrapper');
const appInstall = require('../core/appInstall');

// Controllers
const ShippingRatesController = require('../arc-actions/checkout/ShippingRatesController');

const shippingRatesController = new ShippingRatesController();

global.logServer = null;
global.proxyServer = null;

module.exports = {
  appInstall: {
    actionName: 'embedded.platform.applications.install',
    customFunction: appInstall,
  },
  shippingAfter: {
    actionName: 'http.commerce.catalog.storefront.shipping.requestRates.after',
    customFunction(ctx, callback) {
      new RequestWrapper().init(shippingRatesController, 'after').service(ctx, callback);
    },
  },
};
