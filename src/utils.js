const getHeadSha = context => context.payload.pull_request.head.sha;

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

module.exports = {
  getHeadSha,
  traversePagination,
};
