const { APP_STATUS_ID } = require('./constants');
const { getHeadSha } = require('./utils');
const { getNewStatus } = require('./getNewStatus');
const { getCurrentStatus } = require('./getCurrentStatus');
const { getStatusMessage } = require('./getStatusMessage');

module.exports = (app) => {
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    const currentStatus = await getCurrentStatus(context);
    const newStatus = await getNewStatus(context);

    if (currentStatus === newStatus) {
      return;
    }

    await context.github.repos.createStatus(
      context.repo({
        sha: getHeadSha(context),
        state: newStatus,
        description: getStatusMessage(newStatus),
        context: APP_STATUS_ID,
      }),
    );
  });
};
