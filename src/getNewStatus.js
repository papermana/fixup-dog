const { FAILURE, SUCCESS } = require('./constants');
const { hasFixupCommit } = require('./hasFixupCommit');

const getNewStatus = async (context) => {
  const fixupCommit = await hasFixupCommit(context);
  return fixupCommit ? FAILURE : SUCCESS;
};

module.exports = {
  getNewStatus,
};
