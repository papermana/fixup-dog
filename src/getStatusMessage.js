const { SUCCESS } = require('./constants');

// Descriptions can be 140 characters max:
const successDescription = 'No fixup commits! Ready to merge.';
const failureDescription = 'Fixup commits detected! Squash them before merging.';

const getStatusMessage = status => (status === SUCCESS ? successDescription : failureDescription);

module.exports = {
  successDescription,
  failureDescription,
  getStatusMessage,
};
