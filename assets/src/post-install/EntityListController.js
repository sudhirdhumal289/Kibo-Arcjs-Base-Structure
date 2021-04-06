const EntityListUtils = require('../resources/EntityListUtils');
const globalConfig = require('./globalConfig');

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

    // Wait for prev promises to finish. Because Kibo can handle only 20 concurrent operations.
    return entityListUtils.upsertEntity(context, entityListFullName, 'global_config', globalConfig);
  }

  wipeEntityLists(context) {
    const entityListFullName = `Global_Config@${context.apiContext.appKey.split('.')[0]}`;
    return entityListUtils.deleteEntityList(context, entityListFullName);
  }
}

module.exports = EntityListController;
