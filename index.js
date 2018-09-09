/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
const APP_STATUS_ID = 'fixup-dog';
const FAILURE = 'failure';
const SUCCESS = 'success';

// Descriptions can be 140 characters max:
const successDescription = 'No fixup commits! Ready to merge.';
const failureDescription = 'Fixup commits detected! Squash them before merging.';

const getHeadSha = context => context.payload.pull_request.head.sha;

const getCurrentStatus = async (context) => {
  const { data: currentStatuses } = await context.github.repos.getStatuses(
    context.repo({
      ref: getHeadSha(context),
    }),
  );
  const fixupDogStatus = currentStatuses.find(status => status.context === APP_STATUS_ID);

  return fixupDogStatus ? fixupDogStatus.state : null;
};

const traversePagination = async ({ request, predicate }) => {
  let page = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { data, incomplete_results: incompleteResults } = await request({
      page,
    });

    if (predicate(data)) {
      return true;
    }

    if (!incompleteResults) {
      return false;
    }

    page += 1;
  }
};

const isFixupCommit = commit => /^fixup!/.test(commit.commit.message);

const hasFixupCommit = context => traversePagination({
  request: paginationData => context.github.repos.getCommits(
    context.repo({
      sha: getHeadSha(context),
      ...paginationData,
    }),
  ),
  predicate: commits => commits.find(isFixupCommit),
});

const getStatus = async (context) => {
  const fixupCommit = await hasFixupCommit(context);
  return fixupCommit ? FAILURE : SUCCESS;
};

module.exports = (app) => {
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    context.log.child({
      name: 'fixup-dog',
      event: context.event.event,
      action: context.payload.action,
    });

    const currentStatus = await getCurrentStatus(context);
    context.log.info('currentStatus', currentStatus);

    const newStatus = await getStatus(context);
    context.log.info('newStatus', newStatus);

    if (currentStatus === newStatus) {
      return;
    }

    await context.github.repos.createStatus(
      context.repo({
        sha: getHeadSha(context),
        state: newStatus,
        description: newStatus === SUCCESS ? successDescription : failureDescription,
        context: APP_STATUS_ID,
      }),
    );
  });
};
