/**
 * This function behaves exactly same as the Promise.allSettled with enhancement to handle non-promise input.
 * If function is present in promises array then that function will be executed sequentially
 * and its result will be represented same as the the promise result.
 *
 * @param promises Array of promises or plain values or functions or mix or all.
 * @returns {Promise<unknown>} Returns promise which will be fulfilled when
 * all the promise-array elements are processed.
 */
function allSettled(promises) {
  function promiseSettled(promiseIndex) {
    return new Promise((resolve) => {
      if (!promises[promiseIndex]) {
        resolve([]);

        return;
      }

      const currentPromise = promises[promiseIndex];

      function nextTick(resp, failed) {
        if (promiseIndex === promises.length - 1) {
          resolve([{
            status: 'fulfilled',
            value: resp,
          }]);
        } else {
          promiseSettled(promiseIndex + 1)
            .then((chainedResp) => {
              const respPromise = Array.isArray(resp) ? resp
                : [failed ? {
                  status: 'rejected',
                  reason: resp,
                } : {
                  status: 'fulfilled',
                  value: resp,
                }];
              Array.prototype.push.apply(respPromise, chainedResp);
              resolve(respPromise);
            })
            .catch((chainedResp) => {
              const respPromise = Array.isArray(resp) ? resp
                : [failed ? {
                  status: 'rejected',
                  reason: resp,
                } : {
                  status: 'fulfilled',
                  value: resp,
                }];
              Array.prototype.push.apply(respPromise, chainedResp);
              resolve(respPromise);
            });
        }
      }

      if (currentPromise.then) {
        currentPromise.then(nextTick)
          .catch((e) => {
            nextTick(e, true);
          });
      } else if (typeof currentPromise === 'function') {
        try {
          const fnReturnValue = currentPromise();

          if (fnReturnValue && fnReturnValue.then) {
            fnReturnValue.then(nextTick)
              .catch((e) => {
                nextTick(e, true);
              });
          } else {
            nextTick(fnReturnValue);
          }
        } catch (err) {
          nextTick(err, true);
        }
      } else {
        nextTick(currentPromise);
      }
    });
  }

  return promiseSettled(0);
}

module.exports = {
  allSettled,
};
