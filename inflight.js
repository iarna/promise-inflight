'use strict'
module.exports = inflight

const active = {}

function cleanup() {
  delete active[unique]
}

function _inflight (unique, doFly) {
  if (!active[unique]) {
    active[unique] = (new Promise(function (resolve) {
      return resolve(doFly())
    }))
    active[unique].then(cleanup, cleanup)
    function cleanup() { delete active[unique] }
  }
  return active[unique]
}

inflight.active = active
function inflight (unique, doFly) {
  return Promise.all([unique, doFly]).then(function (args) {
    const unique = args[0]
    const doFly = args[1]
    if (Array.isArray(unique)) {
      return Promise.all(unique).then(function (uniqueArr) {
        return _inflight(uniqueArr.join(''), doFly)
      })
    } else {
      return _inflight(unique, doFly)
    }
  })
}
