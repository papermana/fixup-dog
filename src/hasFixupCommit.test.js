const { isFixupCommit, hasFixupCommit } = require('./hasFixupCommit');

describe('isFixupCommit', () => {
  test("returns true for commits starting with 'fixup!'", () => {
    expect(
      isFixupCommit({
        commit: {
          message: 'fixup! some commit message',
        },
      }),
    ).toBe(true);
    expect(
      isFixupCommit({
        commit: {
          message: 'some commit message',
        },
      }),
    ).toBe(false);
  });
});

describe('hasFixupCommit', () => {
  const context = {
    github: {
      repos: {
        getCommits: jest.fn(() => Promise.resolve()),
      },
    },
    payload: {
      pull_request: {
        head: {
          sha: 'sha',
        },
      },
    },
    repo: jest.fn(obj => ({
      owner: 'username',
      repo: 'reponame',
      ...obj,
    })),
  };

  beforeEach(() => {
    context.github.repos.getCommits.mockClear();
    context.repo.mockClear();
  });

  test('returns true if there is a fixup commit in the branch', async () => {
    context.github.repos.getCommits.mockResolvedValue({
      incomplete_results: false,
      data: [
        {
          commit: {
            message: 'foo',
          },
        },
        {
          commit: {
            message: 'bar',
          },
        },
        {
          commit: {
            message: 'fixup! bar',
          },
        },
        {
          commit: {
            message: 'baz',
          },
        },
      ],
    });

    const result = await hasFixupCommit(context);

    expect(result).toBe(true);
  });

  test('returns false if no fixup commits can be found', async () => {
    context.github.repos.getCommits.mockResolvedValue({
      incomplete_results: false,
      data: [
        {
          commit: {
            message: 'foo',
          },
        },
      ],
    });

    const result = await hasFixupCommit(context);

    expect(result).toBe(false);
  });

  test('calls getCommits with all data required by API', async () => {
    context.github.repos.getCommits.mockResolvedValue({
      incomplete_results: false,
      data: [],
    });

    await hasFixupCommit(context);

    expect(context.github.repos.getCommits).toBeCalledWith({
      owner: expect.any(String),
      page: 1,
      repo: expect.any(String),
      sha: expect.any(String),
    });
  });
});
