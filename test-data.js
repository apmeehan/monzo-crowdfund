var PD = {
  /**
   *
   * @param collection Array of items to sample from
   * @param n Number of items to sample. If missing, n will be set to the length of the collection and it will shuffle
   * @param replace Sample with replacement? False by default
   * @param ratios Ratios to weight items. Can be any non-negative number. By default all items are given equal weight
   * @returns {Array} Array of sampled items
   */
  sample: function(collection, n, replace, ratios) {

      // Validations
      collection = this._v(collection, "a");
      n = this._v(n, "n", collection.length); // If n is undefined, sample the full array
      if(replace === undefined) replace = false;
      if(!replace && collection.length < n)
          throw new Error("You cannot select " + n + " items from an array of length " + collection.length + " without replacement");

      if(ratios === undefined) {
          ratios = [];
          for(var m=0; m<collection.length; m++) { ratios[m] = 1 }
      }

      var cumulativeProbs = this._getCumulativeProbs(ratios, collection.length);

      // Main loop
      var toReturn = [];

      for(var i=0; i<n; i++) {

          var chosen = this._sampleOneIndex(cumulativeProbs);

          if(replace) {
              toReturn[i] = collection[chosen];
          } else {

              // Remove from collection and ratios
              toReturn[i] = collection.splice(chosen, 1)[0];
              ratios.splice(chosen, 1);

              // Make sure we aren't at the end
              if(ratios.length) {
                  cumulativeProbs = this._getCumulativeProbs(ratios, collection.length);
              }
          }
      }

      return toReturn;
  },

  // HELPERS

  /**
   *
   * @param ratios Array of non-negative numbers to be turned into CDF
   * @param len length of the collection
   * @returns {Array}
   * @private
   */
  _getCumulativeProbs: function(ratios, len) {
      if(len === undefined) throw new Error("An error occurred: len was not sent to _getCumulativeProbs");
      if(ratios.length !== len) throw new Error("Probabilities for sample must be same length as the array to sample from");

      var toReturn = [];

      if(ratios !== undefined) {
          ratios = this._v(ratios, "a");
          if(ratios.length !== len) throw new Error("Probabilities array must be the same length as the array you are sampling from");

          var sum = 0;
          ratios.map(function(ratio) {
              ratio = this._v(ratio, "nn"); // Note validating as ANY non-negative number
              sum+= ratio;
              toReturn.push(sum);
          }.bind(this));

          // Divide by total to normalize
          for(var k=0; k<toReturn.length; k++) { toReturn[k] = toReturn[k]/sum }
          return toReturn
      }
  },

  _sampleOneIndex: function(cumulativeProbs) {

      var toTake = Math.random();

      // Find out where this lands in weights
      var cur = 0;
      while(toTake > cumulativeProbs[cur]) cur++;

      return cur;
  },

  // Return default if undefined, otherwise validate
  // Return a COPY of the validated parameter
  _v: function(param, type, defaultParam) {
      if(param == null && defaultParam != null)
          return defaultParam;

      switch(type) {

          // Array of 1 item or more
          case "a":
              if(!Array.isArray(param) || !param.length) throw new Error("Expected an array of length 1 or greater");
              return param.slice(0);

          // Integer
          case "int":
              if(param !== Number(param)) throw new Error("A required parameter is missing or not a number");
              if(param !== Math.round(param)) throw new Error("Parameter must be a whole number");
              if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
              return param;

          // Natural number
          case "n":
              if(param === undefined) throw new Error("You must specify how many values you want");
              if(param !== Number(param)) throw new Error("The number of values must be numeric");
              if(param !== Math.round(param)) throw new Error("The number of values must be a whole number");
              if(param < 1) throw new Error("The number of values must be a whole number of 1 or greater");
              if(param === Infinity) throw new Error("The number of values cannot be infinite ;-)");
              return param;

          // Valid probability
          case "p":
              if(Number(param) !== param) throw new Error("Probability value is missing or not a number");
              if(param > 1) throw new Error("Probability values cannot be greater than 1");
              if(param < 0) throw new Error("Probability values cannot be less than 0");
              return param;

          // Positive numbers
          case "pos":
              if(Number(param) !== param) throw new Error("A required parameter is missing or not a number");
              if(param <= 0) throw new Error("Parameter must be greater than 0");
              if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
              return param;

          // Look for numbers (reals)
          case "r":
              if(Number(param) !== param) throw new Error("A required parameter is missing or not a number");
              if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
              return param;

          // Non negative real number
          case "nn":
              if(param !== Number(param)) throw new Error("A required parameter is missing or not a number");
              if(param < 0) throw new Error("Parameter cannot be less than 0");
              if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
              return param;

          // Non negative whole number (integer)
          case "nni":
              if(param !== Number(param)) throw new Error("A required parameter is missing or not a number");
              if(param !== Math.round(param)) throw new Error("Parameter must be a whole number");
              if(param < 0) throw new Error("Parameter cannot be less than zero");
              if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
              return param;

          // Non-empty string
          case "str":
              if(param !== String(param)) throw new Error("A required parameter is missing or not a string");
              if(param.length === 0) throw new Error("Parameter must be at least one character long");
              return param;


      }
  }
}
