const { getCurrentStatus } = require('./getCurrentStatus');
const { APP_STATUS_ID, SUCCESS } = require('./constants');

describe('getCurrentStatus', () => {
  const context = {
    github: {
      repos: {
        getStatuses: jest.fn(() => Promise.resolve()),
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
    context.github.repos.getStatuses.mockClear();
    context.repo.mockClear();
  });

  test('makes a call to get statuses with proper params', async () => {
    context.github.repos.getStatuses.mockResolvedValue({
      data: [],
    });

    await getCurrentStatus(context);

    expect(context.github.repos.getStatuses).toHaveBeenCalledTimes(1);
    expect(context.github.repos.getStatuses).toBeCalledWith({
      owner: expect.any(String),
      ref: expect.any(String),
      repo: expect.any(String),
    });
  });

  test("if no status has fixup-dog's context, return null", async () => {
    context.github.repos.getStatuses.mockResolvedValue({
      data: [
        {
          context: 'foo',
        },
        {
          context: 'bar',
        },
      ],
    });

    const result = await getCurrentStatus(context);

    expect(result).toBe(null);
  });

  test("if a status matches fixup-dog's context, return its state", async () => {
    context.github.repos.getStatuses.mockResolvedValue({
      data: [
        {
          context: 'foo',
        },
        {
          context: 'bar',
        },
        {
          context: APP_STATUS_ID,
          state: SUCCESS,
        },
      ],
    });

    const result = await getCurrentStatus(context);

    expect(result).toBe(SUCCESS);
  });
});
