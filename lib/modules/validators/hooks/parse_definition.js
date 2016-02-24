Astro.Module.modules.validators.onParseDefinition = function(
  definition, className
) {
  let parsedDefinition = {
    validators: {},
    resolveError: definition.resolveError
  };

  _.each(definition.fields, function(fieldDefinition, fieldName) {
    if (_.has(fieldDefinition, 'validators')) {
			Astro.utils.validators.parseValidators(
				fieldDefinition.validators, [
					{class: className}, {'schema property': 'fields'},
					{field: fieldName}, {'field property': 'validators'}
				]
			);

      parsedDefinition.validators[fieldName] = fieldDefinition.validators;
	  definition.fields[fieldName] = _.omit(fieldDefinition, 'validators');
    }
  });

  _.each(definition.validators, function(validators, fieldName) {
		Astro.utils.validators.parseValidators(
			validators, [
				{class: className}, {'schema property': 'validators'}
			]
		);

    parsedDefinition.validators[fieldName] = validators;
  });

  return parsedDefinition;
};