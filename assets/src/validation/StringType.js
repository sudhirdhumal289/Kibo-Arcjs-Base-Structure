const BaseType = require('./BaseType');
const ValidationResult = require('./ValidationResult');

class StringType extends BaseType {
  alphanum() {
    this.addValidator((value, errorMessageProvider) => {
      const currentValue = this.isAvailable(value) ? value : this.getDefaultValue();
      if (!currentValue) return new ValidationResult(true, null);

      if (/^[a-zA-Z0-9]+$/.test(currentValue)) {
        return new ValidationResult(true, currentValue);
      }

      return new ValidationResult(false, currentValue,
        new Error(errorMessageProvider.getMessage('string.alphanum')));
    });

    return this;
  }

  empty() {
    this.addValidator((value, errorMessageProvider) => {
      const currentValue = this.isAvailable(value) ? value : this.getDefaultValue();
      if (!currentValue) {
        return new ValidationResult(true, null);
      }

      const isValid = currentValue === '';
      return new ValidationResult(isValid, currentValue,
        !isValid ? new Error(errorMessageProvider.getMessage('string.empty')) : null);
    });

    return this;
  }

  min(minLength) {
    this.addValidator((value, errorMessageProvider) => {
      const currentValue = this.isAvailable(value) ? value : this.getDefaultValue();
      if (currentValue && currentValue.length < minLength) {
        return new ValidationResult(false, currentValue,
          new Error(errorMessageProvider.getMessage('string.min')));
      }

      return new ValidationResult(true, currentValue);
    });

    return this;
  }

  max(maxLength) {
    this.addValidator((value, errorMessageProvider) => {
      const currentValue = this.isAvailable(value) ? value : this.getDefaultValue();
      if (currentValue && currentValue.length > maxLength) {
        return new ValidationResult(false, currentValue,
          new Error(errorMessageProvider.getMessage('string.max')));
      }

      return new ValidationResult(true, currentValue);
    });

    return this;
  }

  email() {
    this.addValidator((value, errorMessageProvider) => {
      const currentValue = this.isAvailable(value) ? value : this.getDefaultValue();
      if (!currentValue) {
        return new ValidationResult(true, null);
      }

      // eslint-disable-next-line no-control-regex
      const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

      if (emailRegex.test(value)) {
        return new ValidationResult(true, value);
      }

      return new ValidationResult(false, value, new Error(errorMessageProvider.getMessage('string.email')));
    });

    return this;
  }

  phone() {
    this.addValidator((value, errorMessageProvider) => {
      const currentValue = this.isAvailable(value) ? value : this.getDefaultValue();
      if (!currentValue) {
        return new ValidationResult(true, null);
      }

      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

      if (phoneRegex.test(value)) {
        return new ValidationResult(true, value);
      }

      return new ValidationResult(false, value, new Error(errorMessageProvider.getMessage('string.phone')));
    });

    return this;
  }

  enum(validValues) {
    this.addValidator((value, errorMessageProvider) => {
      const currentValue = this.isAvailable(value) ? value : this.getDefaultValue();
      if (!currentValue) {
        return new ValidationResult(false, null,
          new Error(errorMessageProvider.getMessage('string.enum')));
      }

      if (!validValues || !(validValues instanceof Array) || validValues.length <= 1) {
        return new ValidationResult(false, currentValue,
          new Error(errorMessageProvider.getMessage('string.enum.validValues')));
      }

      if (validValues.indexOf(value) >= 0) {
        return new ValidationResult(true, currentValue);
      }

      return new ValidationResult(false, currentValue, new Error(errorMessageProvider.getMessage('string.enum')));
    });

    return this;
  }

  uppercase() {
    this.addValidator((value) => {
      if (!value) {
        return new ValidationResult(true, null);
      }

      return new ValidationResult(true, value.toUpperCase());
    });

    return this;
  }

  lowercase() {
    this.addValidator((value) => {
      if (!value) {
        return new ValidationResult(true, null);
      }

      return new ValidationResult(true, value.toLowerCase());
    });

    return this;
  }
}

module.exports = StringType;
