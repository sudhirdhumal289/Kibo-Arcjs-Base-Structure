const EntityList = require('mozu-node-sdk/clients/platform/entityList');
const EntityListEntity = require('mozu-node-sdk/clients/platform/entitylists/entity');

class EntityListUtils {
  getCommonEntityListProps(context) {
    const tenant = context.get.tenant();

    return {
      contextLevel: 'tenant',
      createDate: new Date(),
      isLocaleSpecific: false,
      isSandboxDataCloningSupported: true,
      isShopperSpecific: false,
      isVisibleInStorefront: false,
      nameSpace: context.apiContext.appKey.split('.')[0],
      tenantId: tenant.id,
      updateDate: new Date(),
      usages: ['entityManager'],
      useSystemAssignedId: false,
    };
  }

  getEntityList(context, entityListFullName) {
    const entityListResource = new EntityList(context);
    entityListResource.context['user-claims'] = null;

    return entityListResource.getEntityList({ entityListFullName });
  }

  createEntityList(context, entityListConfig) {
    return new Promise((resolve, reject) => {
      const getEntityPromise = this.getEntityList(context,
        `${entityListConfig.name}@${entityListConfig.nameSpace}`);
      getEntityPromise.then(resolve);
      getEntityPromise.catch(() => {
        // Create entityList only if its already not there.
        const entityListResource = new EntityList(context);
        entityListResource.context['user-claims'] = null;

        entityListResource.createEntityList(entityListConfig).then(resolve).catch(reject);
      });
    });
  }

  deleteEntityList(context, entityListFullName) {
    const entityListResource = new EntityList(context);
    entityListResource.context['user-claims'] = null;

    return entityListResource.deleteEntityList({ entityListFullName });
  }

  getEntityById(context, entityListFullName, id) {
    const entityResource = new EntityListEntity(context);
    entityResource.context['user-claims'] = null;

    return entityResource.getEntity({ entityListFullName, id });
  }

  getEntities(context, filters) {
    const entityResource = new EntityListEntity(context);
    entityResource.context['user-claims'] = null;

    return entityResource.getEntities(filters);
  }

  insertEntity(context, entityListFullName, entityData) {
    const entityResource = new EntityListEntity(context);
    entityResource.context['user-claims'] = null;

    return entityResource.insertEntity({ entityListFullName }, { body: entityData });
  }

  updateEntity(context, entityListFullName, id, entityData) {
    const entityResource = new EntityListEntity(context);
    entityResource.context['user-claims'] = null;

    return entityResource.updateEntity({ entityListFullName, id }, { body: entityData });
  }

  upsertEntity(context, entityListFullName, id, entityData) {
    return new Promise((resolve, reject) => {
      this.getEntityById(context, entityListFullName, id).then((existingEntityData) => {
        this.updateEntity(context, entityListFullName, id, Object.assign(entityData, existingEntityData))
          .then(resolve).catch(reject);
      }).catch(() => {
        this.insertEntity(context, entityListFullName, entityData).then(resolve).catch(reject);
      });
    });
  }

  insertEntityIfNotFound(context, entityListFullName, id, entityData) {
    return new Promise((resolve, reject) => {
      this.getEntityById(context, entityListFullName, id).then(resolve).catch(() => {
        this.insertEntity(context, entityListFullName, entityData).then(resolve).catch(reject);
      });
    });
  }
}

module.exports = EntityListUtils;
