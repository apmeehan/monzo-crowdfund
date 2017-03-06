var PD = require("probability-distributions");
var _ = require('underscore');

var goal = 2500000;
var pledgeValues = [10,20,50,100,250,500,1000];
var maxPledgeValue = pledgeValues[pledgeValues.length - 1];

var dataset = PD.sample(pledgeValues, 100000, true, [7,6,5,4,3,2,1]);

function chooseRandomArrayIndex(array) {
	return Math.floor(Math.random() * array.length);
}


var datasetTotal = dataset.reduce((a, b) => a + b, 0);
var randomlyChosenPledge;
while (datasetTotal >= goal ) {
	randomlyChosenPledge = dataset.splice(Math.floor(Math.random() * dataset.length), 1)[0];
	datasetTotal -= randomlyChosenPledge;
}

console.log("Goal: " + goal);
console.log("Total pledged: " + datasetTotal);
console.log("Number of chosen pledgers: " + dataset.length);
console.log("Chosen pledges total: " + datasetTotal);
