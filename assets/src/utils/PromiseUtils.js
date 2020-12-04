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
          resolve([{ status: 'fulfilled', value: resp }]);
        } else {
          promiseSettled(promiseIndex + 1).then((chainedResp) => {
            const respPromise = Array.isArray(resp) ? resp
              : [failed ? { status: 'rejected', reason: resp } : { status: 'fulfilled', value: resp }];
            Array.prototype.push.apply(respPromise, chainedResp);
            resolve(respPromise);
          }).catch((chainedResp) => {
            const respPromise = Array.isArray(resp) ? resp
              : [failed ? { status: 'rejected', reason: resp } : { status: 'fulfilled', value: resp }];
            Array.prototype.push.apply(respPromise, chainedResp);
            resolve(respPromise);
          });
        }
      }

      if (currentPromise.then) {
        currentPromise.then(nextTick).catch((e) => {
          nextTick(e, true);
        });
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
