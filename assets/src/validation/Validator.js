const Logger = require('../core/Logger');
const BaseType = require('./BaseType');

const logger = new Logger();

class Validator {
  validate(schema, data) {
    if (!this.isValidSchema(schema)) {
      logger.error('Schema provided for validation is not valid.');

      return false;
    }

    if (!data) {
      logger.error('Validation failed. Data to validate is not present');

      return false;
    }

    const validationResult = this.getValidationResult(schema, data)
      .filter((validationResultInstance) => !validationResultInstance.isValid);

    return {
      status: validationResult.length > 0 ? 'failure' : 'success',
      error: validationResult.length > 0 ? validationResult : null,
    };
  }

  getValidationResult(schema, data) {
    let validationResults = [];

    Object.keys(schema)
      .every((schemaKey) => {
        let isValid = true;
        if (schema[schemaKey] instanceof BaseType && schema[schemaKey].validate) {
          validationResults = schema[schemaKey].validate(data[schemaKey], true);
        }

        if (schema[schemaKey] instanceof Array && schema[schemaKey].length > 0
          && schema[schemaKey][0] instanceof BaseType && schema[schemaKey][0].validate) {
          // There will be only one validator for specific type;
          // even if more than one provided we will consider only first one.
          validationResults = schema[schemaKey][0].validate(data[schemaKey], true);
        }

        if (schema[schemaKey] instanceof BaseType || schema[schemaKey] instanceof Array) {
          validationResults.forEach((validationResult) => {
            // eslint-disable-next-line no-param-reassign
            validationResult.propertyName = schemaKey;
            if (validationResult.isValid) {
              // eslint-disable-next-line no-param-reassign
              data[schemaKey] = validationResult.propertyValue;
            } else {
              isValid = false;
            }
          });
        } else if (typeof schema[schemaKey] === 'object') {
          const objValidationResults = this.getValidationResult(schema[schemaKey], data[schemaKey]);
          objValidationResults.forEach((validationResult) => {
            // eslint-disable-next-line no-param-reassign
            validationResult.propertyName = `${schemaKey}.${validationResult.propertyName}`;

            if (!validationResult.isValid) isValid = false;
          });

          Array.prototype.push.apply(validationResults, objValidationResults);
        }

        return isValid;
      });

    return validationResults;
  }

  isValidSchema(schema) {
    if (!schema) return false;

    return Object.keys(schema)
      .every((schemaKey) => {
        if (schema[schemaKey] instanceof BaseType) {
          return true;
        }

        if (schema[schemaKey] instanceof Array) {
          // There will be only one validator for specific type;
          // even if more than one provided we will consider only first one.
          return schema[schemaKey].length >= 1 && schema[schemaKey][0] instanceof BaseType;
        }

        if (typeof schema[schemaKey] === 'object') {
          return this.isValidSchema(schema[schemaKey]);
        }

        return false;
      });
  }
}

module.exports = Validator;
