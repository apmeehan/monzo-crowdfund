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

monzo.getAllPledgesTotal = function() { return allPledgesTotal };
monzo.getRunningTotal = function() { return runningTotal };



/*---------------PRIVATE FUNCTIONS---------------*/

function getCopyOfObject(oldDatasetObject) {
  var newDatasetObject = {};
  for (var i in oldDatasetObject) newDatasetObject[i] = oldDatasetObject[i];
  return newDatasetObject;
}

function removeObjectSubset(subset, superset) {
  for (var i in subset) delete superset[i];
}

function getRandomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

/*
 * Returns an array of random keys, whose size is
 * a specified fraction of that of the passed object
 */
function getRandomSubsetOfObject(fractionOf, obj) {
  var numberOf = Math.floor(Object.keys(obj).length * fractionOf);
  var subset = [];
  var keys = Object.keys(obj);
  for (var i = 0; i < numberOf; i++) {
    var randomIndex = getRandomIndex(keys);
    var randomKey = keys.splice(randomIndex, 1)[0];
    subset.push(randomKey);
  }
  return subset;
}


/*---------------PUBLIC FUNCTIONS---------------*/

/**
 * Create the datastructure objects, which will hold the
 * sets of pledges and successful applicants, and calculate
 * total amount of pledges
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


/**
 * Randomly remove pledges and update the running total until it
 * is just under goal. This leaves us with only successful applicants
 */
monzo.chooseSuccessfulApplicants = function () {
  var ids = Object.keys(successfulApplicants);

  while (runningTotal >= GOAL ) {
    var randomId = ids.splice(getRandomIndex(ids), 1)[0];
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
 * On being given a decimal fraction between 0 and 1, removes this fraction
 * of applicants from the set
 * @param {Number} fractionOf
 */
monzo.removeFailedApplicants = function (fractionOf) {
  arrayOfIDs = getRandomSubsetOfObject(fractionOf, successfulApplicants);

  for (i = 0; i < arrayOfIDs.length; i++) {
    runningTotal -= successfulApplicants[arrayOfIDs[i]];
    allPledgesTotal -= successfulApplicants[arrayOfIDs[i]];
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
  var ids = Object.keys(allPledges);

  while (runningTotal <= GOAL - maxPledgeValue) {
  	var randomId = ids.splice(getRandomIndex(ids), 1)[0];
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
