var PD = require("probability-distributions");

var goal = 250000;
var pledgeValues = [10,20,50,100,250,500,1000];
var dataset = PD.sample(pledgeValues, 10000, true, [7,6,5,4,3,2,1]);
// Convert to object so each pledge has a unique ID
var allPledges = dataset.reduce(function(obj, currentValue, index) {
  obj[index] = currentValue;
  return obj;
}, {});

var allPledgesTotal = dataset.reduce(function (a, b) { return a + b; }, 0);
if (allPledgesTotal < goal) throw "Not enough pledges to reach goal";

var runningTotal = allPledgesTotal;

var successfulApplicants = getCopyOfObject(allPledges);

chooseSuccessfulApplicants();

removeObjectSubset(successfulApplicants, allPledges);




// Remove failed pledges
var percentageOfDroppedPledgers = 10;
var subset = getRandomSubsetOfChosenApplicants(percentageOfDroppedPledgers / 100);
removeSubsetOfApplicants(subset);


repopulateChosenPledges();


/*
 * Get shallow copy of object
 */
function getCopyOfObject(oldDatasetObject) {
  var newDatasetObject = {};
  for (var i in oldDatasetObject) newDatasetObject[i] = oldDatasetObject[i];
  return newDatasetObject;
}

/*
 * Randomly remove pledges and update the running total until it
 * is just under goal. This leaves us with only successful applicants
 */
function chooseSuccessfulApplicants() {
  var ids = Object.keys(successfulApplicants);
  while (runningTotal >= goal ) {
    var randomId = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    runningTotal -= successfulApplicants[randomId];
    delete successfulApplicants[randomId];
  }
  console.log("\nGoal: " + goal +
    "\nTotal pledged: " + allPledgesTotal +
    "\nNumber of chosen pledgers: " + Object.keys(successfulApplicants).length +
    "\nChosen pledges total: " + runningTotal
  );
}

/*
 * Once we have our chosen applicants, we need to remove these applicants
 * from the original pledges list, so that they can't be chosen again later
 * if more applicants are required
 */
function removeObjectSubset(subset, superset) {
  for (var i in subset) delete superset[i];
}

/*
 * Returns an array of random pledge IDs, whose length is
 * a specified fraction of the list of chosen pledges
 * @param {Number} fractionOf
 * @returns {Array} subset
 */
function getRandomSubsetOfChosenApplicants(fractionOf) {
  var numberOf = Math.floor(Object.keys(successfulApplicants).length * fractionOf);
  var subset = [];
  var keys = Object.keys(successfulApplicants);
  for (var i = 0; i < numberOf; i++) {
    var randomIndex = Math.floor(Math.random() * keys.length);
    var randomKey = keys.splice(randomIndex, 1)[0];
    subset.push(randomKey);
  }
  return subset;
}

/**
 * On being given an array of pledge IDs, removes those pledges
 * from the list of chosen pledges
 * @param {Array} arrayOfApplicantIDs
 */
function removeSubsetOfApplicants(arrayOfApplicantIDs) {
  var maxPledgeValue = pledgeValues[pledgeValues.length - 1];
  for (i = 0; i < arrayOfApplicantIDs.length; i++) {
    runningTotal -= successfulApplicants[arrayOfApplicantIDs[i]];
    delete successfulApplicants[arrayOfApplicantIDs[i]];
  }
  console.log("\nOH FUCK, WE LOST " + subset.length + " PLEDGERS!" +
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
function repopulateChosenPledges() {
  var maxPledgeValue = pledgeValues[pledgeValues.length - 1];
  while (runningTotal <= goal - maxPledgeValue) {
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
