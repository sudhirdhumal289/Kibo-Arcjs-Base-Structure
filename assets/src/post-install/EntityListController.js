const EntityListUtils = require('../resources/EntityListUtils');

const entityListUtils = new EntityListUtils();

class EntityListController {
  globalConfig(context) {
    return Object.assign(entityListUtils.getCommonEntityListProps(context), {
      idProperty: {
        dataType: 'string',
        propertyName: 'configId',
      },
      name: 'Global_Config',
    });
  }

  createEntities(context) {
    return entityListUtils.createEntityList(context, this.globalConfig(context));
  }

  populateData(context) {
    const entityListFullName = `Global_Config@${context.apiContext.appKey.split('.')[0]}`;
    const globalConfig = {
      configId: 'global_config',
      sendAmountWithReceiptApi: true,
      preloadApiUrl: {
        qa: 'https://gatewayt.moneris.com/chkt/request/request.php',
        prod: 'https://gateway.moneris.com/chkt/request/request.php',
      },
    };

    // Wait for prev promises to finish. Because Kibo can handle only 20 concurrent operations.
    return entityListUtils.upsertEntity(context, entityListFullName, 'global_config', globalConfig);
  }

  wipeEntityLists(context) {
    const entityListFullName = `Global_Config@${context.apiContext.appKey.split('.')[0]}`;
    return entityListUtils.deleteEntityList(context, entityListFullName);
  }
}

module.exports = EntityListController;
