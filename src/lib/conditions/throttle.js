'use strict';

const storageELementName = 'jeThrottleState';

module.exports = function(settings, event) {
  var result = true; // passes by default

  // get state
  var oldStateRaw = sessionStorage.getItem(storageELementName);
  oldStateRaw = oldStateRaw || "{}";
  var oldState = JSON.parse(oldStateRaw);

  // check max events per time
  var timeUnit = settings.timeUnit;
  var timeLimit = settings.timeLimit;
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
  difference = difference - oldState.lastCall;
  difference = difference / 1000; // convert from ms to s
  if (difference < timeLimit) {
    // too early
    result = false;
  }

  // done. store new state
  var newState = oldState;
  if (result) {
    // since we'll reply treu, there will be a call. Record now as the time.
    // (yes, technically, we're a bit too early)
    newState.lastCall = new Date();
  }
  var newStateRaw = JSON.stringify(newState);
  sessionStorage.setItem(storageELementName);
};
