const { Application } = require('probot');
const fixupDogApp = require('./index');
const { APP_STATUS_ID, FAILURE, SUCCESS } = require('./constants');
const { failureDescription, successDescription } = require('./getStatusMessage');

const pullRequestOpenedPayload = require('../fixtures/pull_request.opened.json');
const pullRequestSyncPayload = require('../fixtures/pull_request.synchronize.json');

describe('fixup-dog app', () => {
  const github = {
    repos: {
      createStatus: jest.fn(),
      getCommits: jest.fn(() => Promise.resolve()),
      getStatuses: jest.fn(() => Promise.resolve()),
    },
  };
  let app;

  beforeEach(() => {
    github.repos.createStatus.mockClear();
    github.repos.getCommits.mockClear();
    github.repos.getStatuses.mockClear();

    app = new Application();
    app.load(fixupDogApp);
    app.auth = () => Promise.resolve(github);
  });

  test('sends success status when PR gets opened and there are no fixup commits', async () => {
    github.repos.getCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: 'First commit',
          },
        },
      ],
      incompleteResults: false,
    });
    github.repos.getStatuses.mockResolvedValue({ data: [] });

    await app.receive({ event: 'pull_request.opened', payload: pullRequestOpenedPayload });

    expect(github.repos.createStatus).toBeCalledWith({
      owner: pullRequestOpenedPayload.pull_request.head.repo.owner.login,
      repo: pullRequestOpenedPayload.pull_request.head.repo.name,
      sha: pullRequestOpenedPayload.pull_request.head.sha,
      state: SUCCESS,
      description: successDescription,
      context: APP_STATUS_ID,
    });
  });

  test('sends failure status when fixup commit gets added to a PR', async () => {
    github.repos.getCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: 'First commit',
          },
        },
        {
          commit: {
            message: 'fixup! First commit',
          },
        },
      ],
      incompleteResults: false,
    });
    github.repos.getStatuses.mockResolvedValue({
      data: [
        {
          context: APP_STATUS_ID,
          state: SUCCESS,
        },
      ],
    });

    await app.receive({
      event: 'pull_request.synchronize',
      payload: pullRequestSyncPayload,
    });

    expect(github.repos.createStatus).toBeCalledWith({
      owner: pullRequestSyncPayload.pull_request.head.repo.owner.login,
      repo: pullRequestSyncPayload.pull_request.head.repo.name,
      sha: pullRequestSyncPayload.pull_request.head.sha,
      state: FAILURE,
      description: failureDescription,
      context: APP_STATUS_ID,
    });
  });

  test('does nothing when fixup commit gets added to failing PR', async () => {
    github.repos.getCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: 'First commit',
          },
        },
        {
          commit: {
            message: 'fixup! First commit',
          },
        },
        {
          commit: {
            message: 'fixup! First commit',
          },
        },
      ],
      incompleteResults: false,
    });
    github.repos.getStatuses.mockResolvedValue({
      data: [
        {
          context: APP_STATUS_ID,
          state: FAILURE,
        },
        {
          context: APP_STATUS_ID,
          state: SUCCESS,
        },
      ],
    });

    await app.receive({
      event: 'pull_request.synchronize',
      payload: pullRequestSyncPayload,
    });

    expect(github.repos.createStatus).not.toBeCalled();
  });

  test('sends success status when fixup commits are removed from failing PR', async () => {
    github.repos.getCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: 'First commit',
          },
        },
      ],
      incompleteResults: false,
    });
    github.repos.getStatuses.mockResolvedValue({
      data: [
        {
          context: APP_STATUS_ID,
          state: FAILURE,
        },
        {
          context: APP_STATUS_ID,
          state: SUCCESS,
        },
      ],
    });

    await app.receive({
      event: 'pull_request.synchronize',
      payload: pullRequestSyncPayload,
    });

    expect(github.repos.createStatus).toBeCalledWith({
      owner: pullRequestSyncPayload.pull_request.head.repo.owner.login,
      repo: pullRequestSyncPayload.pull_request.head.repo.name,
      sha: pullRequestSyncPayload.pull_request.head.sha,
      state: SUCCESS,
      description: successDescription,
      context: APP_STATUS_ID,
    });
  });

  test('does nothing when adding non-fixup commits to non-failing PR', async () => {
    github.repos.getCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: 'First commit',
          },
        },
        {
          commit: {
            message: 'Second commit',
          },
        },
      ],
      incompleteResults: false,
    });
    github.repos.getStatuses.mockResolvedValue({
      data: [
        {
          context: APP_STATUS_ID,
          state: SUCCESS,
        },
        {
          context: APP_STATUS_ID,
          state: FAILURE,
        },
        {
          context: APP_STATUS_ID,
          state: SUCCESS,
        },
      ],
    });

    await app.receive({
      event: 'pull_request.synchronize',
      payload: pullRequestSyncPayload,
    });

    expect(github.repos.createStatus).not.toBeCalled();
  });
});
