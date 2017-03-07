var PD = require("probability-distributions");

var goal = 2500;
var pledgeValues = [10,20,50,100];
var maxPledgeValue = pledgeValues[pledgeValues.length - 1];
var dataset = PD.sample(pledgeValues, 1000, true, [7,6,5,4]);

var datasetTotal = dataset.reduce((a, b) => a + b, 0);

/*  Convert array to object so each pledge has an ID */
dataset = dataset.reduce(function(obj, currentValue, index) {
    obj[index] = currentValue;
    return obj;
}, {});

/*  Make copy of original dataset and total and randomly select pledges to
    to remove so it now contains only chosen pledges */
var chosenDatasetTotal = datasetTotal;
var chosenDataset = {};
for (var i in dataset) chosenDataset[i] = dataset[i]; // replace with Object.assign()?
while (chosenDatasetTotal >= goal ) {
  var ids = Object.keys(chosenDataset);
	var randomId = ids[Math.floor(Math.random() * ids.length)];
	chosenDatasetTotal -= chosenDataset[randomId];
  delete chosenDataset[randomId];
}
/*  Update original dataset by removing chosen applicants, so they can't
    be chosen again later if more applicants are required */
for (var i in chosenDataset) delete dataset[i];

console.log("\nGoal: " + goal);
console.log("Total pledged: " + datasetTotal);
console.log("Number of chosen pledgers: " + Object.keys(chosenDataset).length);
console.log("Chosen pledges total: " + chosenDatasetTotal);



/*  Remove failed pledges */
var numberOfDroppedPledgers = 10;
var subset = getRandomSubsetOfChosenApplicants(numberOfDroppedPledgers);
removeSubsetOfApplicants(subset);

console.log("\nOH FUCK, WE LOST " + numberOfDroppedPledgers + " PLEDGERS!");
console.log("New number of chosen pledgers: " + Object.keys(chosenDataset).length);
console.log("New chosen pledges total: " + chosenDatasetTotal);


/*  Repopulate chosen pledges dataset */
repopulateChosenDataset();

console.log("\nNEW PLEDGERS SELECTED");
console.log("New number of chosen pledgers: " + Object.keys(chosenDataset).length);
console.log("New chosen pledges total: " + chosenDatasetTotal);



function getRandomSubsetOfChosenApplicants(numberOf) {
  var subset = [];
  var keys = Object.keys(chosenDataset);
  for (var i = 0; i < numberOf; i++) {
    var randomIndex = Math.floor(Math.random() * keys.length);
    var randomKey = keys.splice(randomIndex, 1)[0];
    subset.push(randomKey);
  }
  return subset;
}

function removeSubsetOfApplicants(arrayOfApplicantIds) {
  for (i = 0; i < arrayOfApplicantIds.length; i++) {
    chosenDatasetTotal -= chosenDataset[arrayOfApplicantIds[i]];
    delete chosenDataset[arrayOfApplicantIds[i]];
  }
}

function repopulateChosenDataset() {
  while (chosenDatasetTotal <= goal - maxPledgeValue) {
    var ids = Object.keys(dataset);
  	var randomId = ids[Math.floor(Math.random() * ids.length)];
  	chosenDatasetTotal += dataset[randomId];
    chosenDataset[randomId] = dataset[randomId];
    delete dataset[randomId];
  }
}
