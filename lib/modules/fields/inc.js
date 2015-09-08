var proto = Astro.BaseClass.prototype;

// Overloaded functions.

proto._incOne = function(fieldName, incAmount, options) {
  var doc = this;
  var Class = doc.constructor;
  var event;

  // Cast the "incAmount" argument to a number.
  incAmount = Number(incAmount);

  // Don not allow incrementing by non number value or by 0.
  if (_.isNaN(incAmount) || incAmount === 0) {
    return;
  }

  // Trigger the "beforeChange" event handlers.
  event = new Astro.Event('beforeChange', {
    fieldName: fieldName,
    incAmount: incAmount
  });
  event.target = doc;
  Class.emitEvent(event);
  // If an event was prevented from the execution, then we stop here.
  if (event.defaultPrevented) {
    return;
  }

  // Trigger the "beforeInc" event handlers.
  event = new Astro.Event('beforeInc', {
    fieldName: fieldName,
    incAmount: incAmount
  });
  event.target = doc;
  Class.emitEvent(event);
  // If an event was prevented from the execution, then we stop here.
  if (event.defaultPrevented) {
    return;
  }

  // Set default options of the function.
  options = _.extend({
    modifier: true
  }, options);

  // An indicator for detecting whether a change of a value was necessary.
  var changed = false;

  Astro.utils.fields.traverseNestedDocs(
    doc,
    fieldName,
    function(nestedDoc, nestedFieldName, Class, field, index) {
      // If we try to increment non number value, then we stop execution.
      if (!_.isNumber(nestedDoc[nestedFieldName])) {
        return;
      }

      if (Class && !field) {
        Astro.errors.warn(
          'fields.not_defined_field',
          nestedFieldName,
          Class.getName()
        );
        return;
      }

      // Add modifier.
      if (options.modifier) {
        if (nestedDoc instanceof Astro.BaseClass) {
          changed = nestedDoc._addModifier('$inc', nestedFieldName, incAmount);
        } else {
          changed = doc._addModifier('$inc', fieldName, incAmount);
        }
      } else {
        // If the "modifier" option is not set it means that we just want a
        // given value to be set without checking if it is possible.
        changed = true;
      }

      // If a value change was not possible, then we stop here.
      if (!changed) {
        return;
      }

      // Increment a value of the field by a given amount.
      nestedDoc[nestedFieldName] += incAmount;
    }
  );

  // If a value change did not take place, then we stop here and the following
  // events will not be triggered.
  if (!changed) {
    return;
  }

  // Trigger the "afterInc" event handlers.
  event = new Astro.Event('afterInc', {
    fieldName: fieldName,
    incAmount: incAmount
  });
  event.target = doc;
  Class.emitEvent(event);

  // Trigger the "afterChange" event handlers.
  event = new Astro.Event('afterChange', {
    fieldName: fieldName,
    incAmount: incAmount
  });
  event.target = doc;
  Class.emitEvent(event);
};

proto._incMany = function(fieldsValues, options) {
  var doc = this;

  // Set multiple fields.
  _.each(fieldsValues, function(incAmount, fieldName) {
    doc._incOne(fieldName, incAmount, options);
  });
};

// Public.

proto.inc = function(/* arguments */) {
  var doc = this;
  var args = arguments;

  if (args.length === 1 && _.isObject(args[0])) {
    doc._incMany(args[0]);
  } else if (args.length === 2) {
    doc._incOne(args[0], args[1]);
  }
};