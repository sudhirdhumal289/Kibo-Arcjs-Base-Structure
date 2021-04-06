const EntityListController = require('./EntityListController');
const DocumentListController = require('./DocumentListController');

const entityListController = new EntityListController();
const documentListController = new DocumentListController();

/**
 * This proxy function is required to make 'this' available in all the methods of the class/object.
 * @param instance Class instance or object
 * @param method Method of the class/object which will be called.
 * @returns {function(...[*]=): *} return value after function invocation will be passed back to callee as is.
 */
function proxy(instance, method) {
  // eslint-disable-next-line prefer-spread
  return (...args) => instance[method].apply(instance, args);
}

module.exports = {
  postInstallActions: [
    // proxy(entityListController, 'wipeEntityLists'),
    proxy(entityListController, 'createEntities'),
    proxy(entityListController, 'populateData'),
    proxy(documentListController, 'createDocumentLists'),
  ],
};
