/* eslint-disable no-underscore-dangle */
const Logger = require('../core/Logger');
const ErrorMessages = require('./ErrorMessages');
const ValidationResult = require('./ValidationResult');

const logger = new Logger();
const errorMessageProvider = new ErrorMessages();

class BaseType {
  addValidator(validator) {
    this.validators = this.validators || [];

    if (validator && typeof validator === 'function') {
      this.validators.push(validator);
    } else {
      logger.error('Validator type is not valid');
    }
  }

  validate(value, stopOnFailure) {
    if (value instanceof Array) {
      // Run validate method for each array element.
      return value.map((elem) => this.validate(elem));
    }

    const validationResults = [];
    if (this.isRequired() && !this.isAvailable(value)) {
      validationResults.push(new ValidationResult(false, null,
        new Error(errorMessageProvider.getMessage('required'))));

      return validationResults;
    }

    this.validators = this.validators || [];
    let changedValue = value;
    for (let i = 0; i < this.validators.length; i += 1) {
      const validationResult = this.validators[i](changedValue, errorMessageProvider);
      validationResults.push(validationResult);

      if ((stopOnFailure || stopOnFailure === undefined) && !validationResult.isValid) {
        break;
      } else {
        changedValue = validationResult.propertyValue;
      }
    }

    return validationResults;
  }

  defaultValue(defaultValue) {
    this._defaultValue = defaultValue;

    return this;
  }

  required() {
    // eslint-disable-next-line no-underscore-dangle
    this._required = true;

    return this;
  }

  getDefaultValue() {
    return this._defaultValue;
  }

  isRequired() {
    return this._required;
  }

  isAvailable(value) {
    return value !== null && value !== undefined;
  }
}

module.exports = BaseType;
