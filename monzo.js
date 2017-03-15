(function() {

// Set global namespace object
window.monzo = monzo = {};

const GOAL = 250000;
const PLEDGE_VALUES = [10,20,50,100,250,500,1000];
const DATASET = PD.sample(PLEDGE_VALUES, 10000, true, [7,6,5,4,3,2,1]);

var allPledges,
    allPledgesTotal,
    runningTotal,
    successfulApplicants;

monzo.getAllPledges = function() { return allPledges };
monzo.getAllPledgesTotal = function() { return allPledgesTotal };
monzo.getRunningTotal = function() { return runningTotal };
monzo.getSuccessfulApplicants = function() { return successfulApplicants };



/*---------------INTERNAL FUNCTIONS---------------*/

function getCopyOfObject(oldDatasetObject) {
  var newDatasetObject = {};
  for (var i in oldDatasetObject) newDatasetObject[i] = oldDatasetObject[i];
  return newDatasetObject;
}

function removeObjectSubset(subset, superset) {
  for (var i in subset) delete superset[i];
}

/**
 * Returns an array of random object keys, whose length is
 * a specified fraction of the list of chosen pledges
 * @param {Number} fractionOf
 * @param {Object} obj
 * @returns {Array} subset
 */
function getRandomSubsetOfObject(fractionOf, obj) {
  var numberOf = Math.floor(Object.keys(obj).length * fractionOf);
  var subset = [];
  var keys = Object.keys(obj);
  for (var i = 0; i < numberOf; i++) {
    var randomIndex = Math.floor(Math.random() * keys.length);
    var randomKey = keys.splice(randomIndex, 1)[0];
    subset.push(randomKey);
  }
  return subset;
}


/*---------------EXTERNAL FUNCTIONS---------------*/

/*
 *
 */
monzo.initialiseVariables = function () {
  // Convert dataset array to object so each pledge has a unique ID
  allPledges = DATASET.reduce(function(obj, currentValue, index) {
    obj[index] = currentValue;
    return obj;
  }, {});

  allPledgesTotal = DATASET.reduce(function (a, b) { return a + b; }, 0);
  console.log("GOAL: " + GOAL + "\nTotal pledged: " + allPledgesTotal);
  if (allPledgesTotal < GOAL) {
    throw Error("Not enough pledges to reach goal");
  }

  runningTotal = allPledgesTotal;
  successfulApplicants = getCopyOfObject(allPledges);
}


/*
 * Randomly remove pledges and update the running total until it
 * is just under goal. This leaves us with only successful applicants
 */
monzo.chooseSuccessfulApplicants = function () {
  var ids = Object.keys(successfulApplicants);

  while (runningTotal >= GOAL ) {
    var randomId = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    runningTotal -= successfulApplicants[randomId];
    delete successfulApplicants[randomId];
  }
  /*
   * Once we have our chosen applicants, we need to remove these applicants
   * from the original pledges list, so that they can't be chosen again later
   * if more applicants are required
   */
  removeObjectSubset(successfulApplicants, allPledges);

  console.log(
    "\nNumber of chosen pledgers: " + Object.keys(successfulApplicants).length +
    "\nChosen pledges total: " + runningTotal
  );
}


/**
 * On being given an array of pledge IDs, removes those pledges
 * from the list of chosen pledges
 * @param {Array} arrayOfIDs
 */
monzo.removeFailedApplicants = function (fractionOf) {
  arrayOfIDs = getRandomSubsetOfObject(fractionOf, successfulApplicants);

  for (i = 0; i < arrayOfIDs.length; i++) {
    runningTotal -= successfulApplicants[arrayOfIDs[i]];
    delete successfulApplicants[arrayOfIDs[i]];
  }

  console.log("\nOH FUCK, WE LOST " + arrayOfIDs.length + " PLEDGERS!" +
    "\nNew number of chosen pledgers: " + Object.keys(successfulApplicants).length +
    "\nNew chosen pledges total: " + runningTotal
  );
}


/**
 * If any pledges have been removed from the list of chosen pledges,
 * there will now be room for more to be chosen in their stead.
 * This function randomly selects as many additional pledges from
 * the initial list as needed to bring the total back up to as close
 * to the goal as possible
 */
monzo.repopulateSuccessfulApplicants = function () {
  var maxPledgeValue = PLEDGE_VALUES[PLEDGE_VALUES.length - 1];
  while (runningTotal <= GOAL - maxPledgeValue) {
    var ids = Object.keys(allPledges);
  	var randomId = ids[Math.floor(Math.random() * ids.length)];
  	runningTotal += allPledges[randomId];
    successfulApplicants[randomId] = allPledges[randomId];
    delete allPledges[randomId];
  }
  console.log("\nNEW PLEDGERS SELECTED" +
    "\nNew number of chosen pledgers: " + Object.keys(successfulApplicants).length +
    "\nNew chosen pledges total: " + runningTotal +
    "\n"
  );
}

})();
