const en = {
  'string.alphanum': 'String must contain only alpha-numeric',
  'string.empty': 'String expected to be empty',
  'string.min': 'Minimum length validation failed',
  'string.max': 'Maximum length validation failed',
  'string.email': 'Email address is not valid',
  'string.phone': 'Phone number is not valid',
  'string.enum.validValues': 'List of valid values is not provided or is empty',
  'string.enum': 'Value is required field and not one of the allowed values',
  required: 'This is required property',
};

class ErrorMessages {
  getMessage(key) {
    return en[key];
  }
}

module.exports = ErrorMessages;
