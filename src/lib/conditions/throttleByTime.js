'use strict';

var storageELementName = 'jeThrottleState';

module.exports = function(settings, event) {
  var result = true; // passes by default
  var thisRuleID = event.$rule.id;
  var restAtPageLoad = settings.restAtPageLoad;

  // get state
  var oldState;
  try {
    if (restAtPageLoad) {
      oldState = _satellite._ags055.throttle.throttleByTime.oldState;
    } else {
      var oldStateRaw = sessionStorage.getItem(storageELementName);
      oldState = JSON.parse(oldStateRaw);
    }
    // check max events per time
    var timeUnit = settings.timeUnit;
    var timeLimit = settings.timeLimit;
    var watchGlobally = settings.watchGlobally;
    // convert timeLimit to seconds
    switch (timeUnit) {
      case 'days':
        timeLimit = timeLimit * 60 * 60 * 24;
        break;
      case 'hours':
        timeLimit = timeLimit * 60 * 60;
        break;
      case 'minutes':
        timeLimit = timeLimit * 60;
        break;
      case 'seconds':
      default:
        break;
    }
    // how long ago was the last call? In seconds?
    var difference = new Date();
    if (watchGlobally) {
      difference = difference - new Date(oldState.lastCall);
    } else {
      if ('undefined' !== oldState[thisRuleID] && oldState[thisRuleID] && 'undefined' !== oldState[thisRuleID].lastCall && oldState[thisRuleID].lastCall) {
        difference = difference - new Date(oldState[thisRuleID].lastCall);
      } else {
        // never had a call from this Rule
        difference = 1000 * timeLimit;
      }
    }
    difference = difference / 1000; // convert from ms to s
    console.log('timeDiff', difference);
    if (difference < timeLimit) {
      // too early
      result = false;
    }
  } catch (e) {
    oldState = {};
  }

  // done. make new state
  var newState = oldState;
  if (result) {
    // since we'll reply true, record now as the time.
    // (yes, technically, we're a bit too early)
    // (and yes, technically, another Condition could kill the call)
    newState.lastCall = new Date();
    if (!watchGlobally) {
      newState[thisRuleID] = newState[thisRuleID] || {};
      newState[thisRuleID].lastCall = new Date();
    }
  }
  // store new state
  if (resetAtPageLoad) {
    _satellite._ags055 = _satellite._ags055 || {};
    _satellite._ags055.throttle = _satellite._ags055.throttle || {};
    _satellite._ags055.throttle.throttleByTime = _satellite._ags055.throttle.throttleByTime || {};
    _satellite._ags055.throttle.throttleByTime.oldState = newState;
  } else {
    var newStateRaw = JSON.stringify(newState);
    sessionStorage.setItem(storageELementName, newStateRaw);
  }
};
