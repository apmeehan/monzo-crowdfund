var PD = require("probability-distributions");

var goal = 2500000;
var pledgeValues = [10,20,50,100,250,500,1000];

/*
Generate test data and convert to object 'allPledges', giving each pledge
a unique ID
*/
var dataset = PD.sample(pledgeValues, 100000, true, [7,6,5,4,3,2,1]);
var allPledges = dataset.reduce(function(obj, currentValue, index) {
  obj[index] = currentValue;
  return obj;
}, {});
var allPledgesTotal = dataset.reduce(function (a, b) { return a + b; }, 0);

// Make copy of original dataset, called successfulApplicants
var successfulApplicants = {};
var runningTotal = allPledgesTotal;
for (var i in allPledges) successfulApplicants[i] = allPledges[i];
/*
Now randomly remove pledges until the running total is just under goal.
This leaves us with only successful applicants in our new object
*/
var ids = Object.keys(successfulApplicants);
while (runningTotal >= goal ) {
  var randomId = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
  runningTotal -= successfulApplicants[randomId];
  delete successfulApplicants[randomId];
}

/*
Update original dataset by removing chosen applicants, so they can't
be chosen again later if more applicants are required
*/
for (var i in successfulApplicants) delete allPledges[i];

console.log("\nGoal: " + goal +
  "\nTotal pledged: " + allPledgesTotal +
  "\nNumber of chosen pledgers: " + Object.keys(successfulApplicants).length +
  "\nChosen pledges total: " + runningTotal
);



// Remove failed pledges
var fractionOfDroppedPledgers = 0.1;
var subset = getRandomSubsetOfChosenApplicants(fractionOfDroppedPledgers);
removeSubsetOfApplicants(subset);

console.log("\nOH FUCK, WE LOST " + subset.length + " PLEDGERS!" +
  "\nNew number of chosen pledgers: " + Object.keys(successfulApplicants).length +
  "\nNew chosen pledges total: " + runningTotal
);

// Repopulate chosen pledges dataset
repopulateChosenPledges();

console.log("\nNEW PLEDGERS SELECTED" +
  "\nNew number of chosen pledgers: " + Object.keys(successfulApplicants).length +
  "\nNew chosen pledges total: " + runningTotal
);


/**
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
}
