const { traversePagination } = require('./utils');

describe('traversePagination', () => {
  test('calls request with page param to get data', async () => {
    const request = jest.fn(() => Promise.resolve({
      incomplete_results: false,
      data: [],
    }));

    await traversePagination({ request, predicate: () => false });

    expect(request).toHaveBeenCalled();
    expect(request).toHaveBeenCalledWith({
      page: 1,
    });
  });

  test('returns true if predicate returns true for data', async () => {
    const data = {};
    const request = jest.fn(() => Promise.resolve({
      incomplete_results: true,
      data,
    }));
    const predicate = jest.fn(() => true);

    const result = await traversePagination({ request, predicate });

    expect(result).toBe(true);
    expect(predicate).toHaveBeenCalledWith(data);
  });

  test('keeps calling request with incremental page values until predicate returns true', async () => {
    const request = jest.fn(() => Promise.resolve({
      incomplete_results: true,
      data: [],
    }));
    const predicate = jest
      .fn()
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => true);

    await traversePagination({ request, predicate });

    expect(request).toHaveBeenCalledTimes(3);
    expect(request.mock.calls[0]).toMatchObject([
      {
        page: 1,
      },
    ]);
    expect(request.mock.calls[1]).toMatchObject([
      {
        page: 2,
      },
    ]);
    expect(request.mock.calls[2]).toMatchObject([
      {
        page: 3,
      },
    ]);
  });

  test('returns false if request returns incomplete_results === false', async () => {
    const request = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve({
        incomplete_results: true,
        data: [],
      }))
      .mockImplementationOnce(() => Promise.resolve({
        incomplete_results: false,
        data: [],
      }));

    const result = await traversePagination({ request, predicate: () => false });

    expect(request).toHaveBeenCalledTimes(2);
    expect(result).toBe(false);
  });
});
