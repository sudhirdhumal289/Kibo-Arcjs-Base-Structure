module.exports = function ValidationResult(isValid, propertyValue, error) {
  this.isValid = isValid;
  this.propertyName = null;
  this.propertyValue = propertyValue;
  this.error = error ? error.message : null;
};
