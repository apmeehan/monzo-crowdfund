(function() {

// Set global namespace object
window.monzo = monzo = {};

// To be set directly by passed arguments on execution, and treated as constants
var goal,
    pledgeValues,
    testData;

// Main variables
var allPledges,
    allPledgesTotal,
    runningTotal,
    successfulApplicants,
    numberOfFailed;

// For external programs to see if variables have already been loaded
var areVariablesLoaded = false;


/*---------------PUBLIC FUNCTIONS---------------*/

monzo.getGoal = function () {
  return Number( goal ).toLocaleString( "en" )
};
monzo.getAllPledgesTotal = function () {
  return Number( allPledgesTotal ).toLocaleString( "en" )
};
monzo.getRunningTotal = function () {
  return Number( runningTotal ).toLocaleString( "en" )
};
monzo.getNumberOfFailed = function () {
  return Number( numberOfFailed ).toLocaleString( "en" )
};
monzo.getAreVariablesLoaded = function () {
  return areVariablesLoaded
};

/**
 * Create the datastructure objects, which will hold the
 * sets of pledges and successful applicants, and calculate
 * total amount of pledges
 */
monzo.initialiseVariables = function (g, pv, td) {
  // Check local storage for existing variables, otherwise start over
  // and initialise with passed arguments
  if ( localStorage.getItem( "goal" ) !== null ) {
    goal = loadFromLocalStorage( "goal" );
    pledgeValues = loadFromLocalStorage( "pledgeValues" );
    testData = loadFromLocalStorage( "testData" );
    allPledges = loadFromLocalStorage( "allPledges" );
    allPledgesTotal = loadFromLocalStorage( "allPledgesTotal" );
    runningTotal = loadFromLocalStorage( "runningTotal" );
    successfulApplicants = loadFromLocalStorage( "successfulApplicants" );
    numberOfFailed = loadFromLocalStorage( "numberOfFailed" );

    console.log( "Variables successfully retrieved from local storage" );
    areVariablesLoaded = true;
  }
  else {
    goal = g;
    pledgeValues = pv;
    testData = td;

    // Convert dataset array to object so each pledge has a unique ID
    allPledges = testData.reduce( function( obj, currentValue, index ) {
      obj[ index ] = currentValue;
      return obj;
    }, {});

    allPledgesTotal = testData.reduce( function (a, b) { return a + b; }, 0 );

    console.log(
      "\nGOAL: " + goal +
      "\nTotal pledged: " + allPledgesTotal
    );

    runningTotal = allPledgesTotal;
    successfulApplicants = getCopyOfObject( allPledges );
    numberOfFailed = 0;

    saveToLocalStorage( "goal", goal );
    saveToLocalStorage( "pledgeValues", pledgeValues );
    saveToLocalStorage( "testData", testData );
    saveToLocalStorage( "allPledges", allPledges );
    saveToLocalStorage( "allPledgesTotal", allPledgesTotal );
    saveToLocalStorage( "runningTotal", runningTotal );
    saveToLocalStorage( "successfulApplicants", successfulApplicants );
    saveToLocalStorage( "numberOfFailed", numberOfFailed );
  }
}


/**
 * Randomly remove pledges and update the running total until it
 * is just under goal. This leaves us with only successful applicants
 */
monzo.chooseSuccessfulApplicants = function () {
  var ids = Object.keys( successfulApplicants );
  var randomId;

  // Check that there are enough pledges to reach goal
  if (allPledgesTotal < goal) {
    alert(
      "NOT ENOUGH PLEDGES TO REACH GOAL" +
      "\nOnly " + allPledgesTotal + " available towards " + goal + " goal"
    );
    throw Error( "Not enough pledges to reach goal" );
  }

  while (runningTotal >= goal) {
    randomId = ids.splice( getRandomIndex( ids ), 1 )[0];
    runningTotal -= successfulApplicants[randomId];
    delete successfulApplicants[randomId];
  }
  /*
   * Once we have our chosen applicants, we need to remove these applicants
   * from the original pledges list, so that they can't be chosen again later
   * if more applicants are required
   */
  for (var i in successfulApplicants) delete allPledges[i];

  console.log(
    "\nNumber of chosen pledgers: " + Object.keys( successfulApplicants ).length +
    "\nChosen pledges total: " + runningTotal
  );

  saveToLocalStorage( "allPledges", allPledges );
  saveToLocalStorage( "runningTotal", runningTotal );
  saveToLocalStorage( "successfulApplicants", successfulApplicants );
}


/**
 * On being given a decimal fraction between 0 and 1, removes this fraction
 * of applicants from the set
 * @param {Number} fractionOf
 */
monzo.removeFailedApplicants = function (fractionOf) {
  var arrayOfIDs = getRandomKeysFromObject( fractionOf, successfulApplicants );

  for (i = 0; i < arrayOfIDs.length; i++) {
    runningTotal -= successfulApplicants[ arrayOfIDs[i] ];
    allPledgesTotal -= successfulApplicants[ arrayOfIDs[i] ];
    delete successfulApplicants[ arrayOfIDs[i] ];
    numberOfFailed++;
  }

  console.log( "\nOH FUCK, WE LOST " + arrayOfIDs.length + " PLEDGERS!" +
    "\nNew number of chosen pledgers: " + Object.keys( successfulApplicants ).length +
    "\nNew chosen pledges total: " + runningTotal
  );

  saveToLocalStorage( "allPledgesTotal", allPledgesTotal );
  saveToLocalStorage( "runningTotal", runningTotal );
  saveToLocalStorage( "successfulApplicants", successfulApplicants );
  saveToLocalStorage( "numberOfFailed", numberOfFailed );
}


/**
 * If any pledges have been removed from the list of chosen pledges,
 * there will now be room for more to be chosen in their stead.
 * This function randomly selects as many additional pledges from
 * the initial list as needed to bring the total back up to as close
 * to the goal as possible
 */
monzo.repopulateSuccessfulApplicants = function () {
  var maxPledgeValue = pledgeValues[pledgeValues.length - 1];
  var ids = Object.keys( allPledges );

  // Check that there are enough pledges in original set to repopulate
  availablePledgesTotal = Object.keys( allPledges ).reduce( function (sum, key) {
    return sum + allPledges[key];
  }, 0 );
  if ( availablePledgesTotal < goal ) {
    alert(
      "NOT ENOUGH PLEDGES TO REACH GOAL" +
      "\nOnly " + availablePledgesTotal + " available towards goal of " + goal
    );
    throw Error( "Not enough pledges to reach goal" );
  }

  while ( runningTotal <= goal - maxPledgeValue ) {
    var randomId = ids.splice( getRandomIndex( ids ), 1 )[0];
    runningTotal += allPledges[randomId];
    successfulApplicants[randomId] = allPledges[randomId];
    delete allPledges[randomId];
  }

  console.log( "\nNEW PLEDGERS SELECTED" +
    "\nNew number of chosen pledgers: " + Object.keys( successfulApplicants ).length +
    "\nNew chosen pledges total: " + runningTotal +
    "\n"
  );

  saveToLocalStorage( "allPledges", allPledges );
  saveToLocalStorage( "runningTotal", runningTotal );
  saveToLocalStorage( "successfulApplicants", successfulApplicants );
}


/*---------------PRIVATE FUNCTIONS---------------*/

function getCopyOfObject( oldDatasetObject ) {
  var newDatasetObject = {};
  for ( var i in oldDatasetObject ) newDatasetObject[i] = oldDatasetObject[i];
  return newDatasetObject;
}

function getRandomIndex( arr ) {
  return Math.floor( Math.random() * arr.length );
}

/*
 * Returns an array of random keys, whose size is
 * a specified fraction of that of the passed object
 */
function getRandomKeysFromObject( fractionOf, obj ) {
  var numberOf = Math.floor( Object.keys( obj ).length * fractionOf );
  var arr = [];
  var keys = Object.keys( obj );
  for (var i = 0; i < numberOf; i++)
    arr.push( keys.splice( getRandomIndex( keys ), 1 )[0] );

  return arr;
}

function saveToLocalStorage( name, value ) {
  localStorage.setItem( name, JSON.stringify( value ) );
}
function loadFromLocalStorage( name ) {
  return JSON.parse( localStorage.getItem( name ) );
}

})();
