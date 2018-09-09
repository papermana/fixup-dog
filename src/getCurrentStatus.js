const { APP_STATUS_ID } = require('./constants');
const { getHeadSha } = require('./utils');

const getCurrentStatus = async (context) => {
  const { data: currentStatuses } = await context.github.repos.getStatuses(
    context.repo({
      ref: getHeadSha(context),
    }),
  );
  // Statuses are returned in reverse chronological order.
  const fixupDogStatus = currentStatuses.find(status => status.context === APP_STATUS_ID);

  return fixupDogStatus ? fixupDogStatus.state : null;
};

module.exports = {
  getCurrentStatus,
};
