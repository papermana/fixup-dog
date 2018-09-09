const { getNewStatus } = require('./getNewStatus');
const { FAILURE, SUCCESS } = require('./constants');

jest.mock('./hasFixupCommit', () => ({
  hasFixupCommit: jest.fn(() => Promise.resolve()),
}));

const { hasFixupCommit } = require('./hasFixupCommit');

describe('getNewStatus', () => {
  const context = {};

  test('returns success status if there are no fixup commits', async () => {
    hasFixupCommit.mockResolvedValue(false);

    const result = await getNewStatus(context);

    expect(result).toBe(SUCCESS);
  });

  test('returns failure status if there is a fixup commit', async () => {
    hasFixupCommit.mockResolvedValue(true);

    const result = await getNewStatus(context);

    expect(result).toBe(FAILURE);
  });
});
