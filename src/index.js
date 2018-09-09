const { APP_STATUS_ID } = require('./constants');
const { getHeadSha } = require('./utils');
const { getNewStatus } = require('./getNewStatus');
const { getCurrentStatus } = require('./getCurrentStatus');
const { getStatusMessage } = require('./getStatusMessage');

module.exports = (app) => {
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    context.log.child({
      name: 'fixup-dog',
      event: context.event.event,
      action: context.payload.action,
    });

    const currentStatus = await getCurrentStatus(context);
    context.log.info('currentStatus', currentStatus);

    const newStatus = await getNewStatus(context);
    context.log.info('newStatus', newStatus);

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
