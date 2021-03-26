/*
 * Copyright 2021 Sudhir A. Dhumal
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Everything from source types will be added to targets prototype scope.
 *
 * @param target Target type to extend
 * @returns target Target type extended with all the prototype properties
 * and instance properties as prototype properties.
 */
function extendPrototype(target) {
  if (!target) return target;

  // eslint-disable-next-line prefer-rest-params
  Array.prototype.slice.call(arguments, 1).forEach((Source) => {
    if (Source) {
      Object.getOwnPropertyNames(Source.prototype).forEach((sourceProperty) => {
        if (sourceProperty !== 'constructor'
          && target.prototype
          && typeof target.prototype[sourceProperty] === 'undefined') {
          // eslint-disable-next-line no-param-reassign
          target.prototype[sourceProperty] = Source.prototype[sourceProperty];
        }
      });

      try {
        const sourceInstance = new Source();
        Object.getOwnPropertyNames(sourceInstance).forEach((sourceProperty) => {
          if (target.prototype && typeof target.prototype[sourceProperty] === 'undefined') {
            // eslint-disable-next-line no-param-reassign
            target.prototype[sourceProperty] = sourceInstance[sourceProperty];
          }
        });
      } catch (err) {
        // ignore
      }
    }
  });

  return target;
}

/**
 * Everything from source types will be added at instance level.
 *
 * @param currentInstance Instance extended with all the prototype properties
 * and instance properties as instance properties.
 */
function extendInstance(currentInstance) {
  if (!currentInstance) return;

  // eslint-disable-next-line prefer-rest-params
  Array.prototype.slice.call(arguments, 1).forEach((Source) => {
    if (Source) {
      Object.getOwnPropertyNames(Source.prototype).forEach((sourceProperty) => {
        if (sourceProperty !== 'constructor' && typeof currentInstance[sourceProperty] === 'undefined') {
          // eslint-disable-next-line no-param-reassign
          currentInstance[sourceProperty] = Source.prototype[sourceProperty];
        }
      });

      try {
        const sourceInstance = new Source();
        Object.getOwnPropertyNames(sourceInstance).forEach((sourceProperty) => {
          if (typeof currentInstance[sourceProperty] === 'undefined') {
            // eslint-disable-next-line no-param-reassign
            currentInstance[sourceProperty] = sourceInstance[sourceProperty];
          }
        });
      } catch (err) {
        // ignore
      }
    }
  });
}

/**
 * Map prototype scoped properties from source at prototype level and instance scoped properties at instance level.
 *
 * @param target Target object with extended prototype and instance properties from source types.
 * @returns {*} New instance of the target type
 */
function extend(target) {
  if (!target) return target;

  // eslint-disable-next-line new-cap
  const targetInstance = new target();
  // eslint-disable-next-line prefer-rest-params
  Array.prototype.slice.call(arguments, 1).forEach((Source) => {
    if (Source) {
      Object.getOwnPropertyNames(Source.prototype).forEach((sourceProperty) => {
        if (sourceProperty !== 'constructor'
          && target.prototype
          && typeof target.prototype[sourceProperty] === 'undefined') {
          // eslint-disable-next-line no-param-reassign
          target.prototype[sourceProperty] = Source.prototype[sourceProperty];
        }
      });

      try {
        const sourceInstance = new Source();
        Object.getOwnPropertyNames(sourceInstance).forEach((sourceProperty) => {
          if (typeof targetInstance[sourceProperty] === 'undefined') {
            targetInstance[sourceProperty] = sourceInstance[sourceProperty];
          }
        });
      } catch (err) {
        // ignore
      }
    }
  });

  return targetInstance;
}

function extendWrapper() {
  // eslint-disable-next-line prefer-rest-params
  const args = arguments; // Suppress as Arc.js uses older version or Node JS (5.5)
  return function wrapperForExport() {
    // eslint-disable-next-line prefer-spread
    return extend.apply(null, args); // Suppress as Arc.js uses older version or Node JS (5.5)
  };
}

module.exports = {
  extendInstance, extendPrototype, extend, extendWrapper,
};
