const { getHeadSha, traversePagination } = require('./utils');

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

module.exports = {
  isFixupCommit,
  hasFixupCommit,
};
