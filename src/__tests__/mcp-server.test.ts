import { helpers } from '../helpers.js';

jest.mock('../helpers.js', () => ({
  helpers: {
    listContextItems: jest.fn(),
    addContextItem: jest.fn(),
    completeContextItem: jest.fn(),
    getContextStatus: jest.fn(),
  }
}));

describe('ContextKeeper Helpers', () => {
  it('should call listContextItems with correct arguments', () => {
    helpers.listContextItems('/tmp', true);
    expect(helpers.listContextItems).toHaveBeenCalledWith('/tmp', true);
  });

  it('should call addContextItem with correct arguments', () => {
    helpers.addContextItem('test item', '/tmp', 'test-project', ['tag1']);
    expect(helpers.addContextItem).toHaveBeenCalledWith('test item', '/tmp', 'test-project', ['tag1']);
  });

  it('should call completeContextItem with correct arguments', () => {
    helpers.completeContextItem('abc123', '/tmp');
    expect(helpers.completeContextItem).toHaveBeenCalledWith('abc123', '/tmp');
  });

  it('should call getContextStatus with correct arguments', () => {
    helpers.getContextStatus('/tmp');
    expect(helpers.getContextStatus).toHaveBeenCalledWith('/tmp');
  });
});
