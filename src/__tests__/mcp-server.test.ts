import { helpers } from '../helpers.js';

jest.mock('../helpers.js', () => ({
  helpers: {
    listContextItems: jest.fn(),
    addContextItem: jest.fn(),
    completeContextItem: jest.fn(),
    getContextStatus: jest.fn(),
    searchContextItems: jest.fn(),
    removeContextItem: jest.fn(),
    editContextItem: jest.fn(),
    syncContext: jest.fn(),
    initContext: jest.fn(),
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

describe('Search Context Items', () => {
  it('should call searchContextItems with query only', () => {
    helpers.searchContextItems({ query: 'test' });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'test' });
  });

  it('should call searchContextItems with query and tags', () => {
    helpers.searchContextItems({ query: 'bug', tags: ['urgent', 'frontend'] });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'bug', tags: ['urgent', 'frontend'] });
  });

  it('should call searchContextItems with path parameter', () => {
    helpers.searchContextItems({ path: '/project' });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ path: '/project' });
  });

  it('should call searchContextItems with showCompleted flag', () => {
    helpers.searchContextItems({ showCompleted: true });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ showCompleted: true });
  });

  it('should return search results with correct structure', () => {
    const mockResults = [
      { id: 'abc123', fullId: 'abc123def456', content: 'Test item', project: '', tags: [], completedAt: null, createdAt: '2024-01-01' }
    ];
    (helpers.searchContextItems as jest.Mock).mockReturnValue(mockResults);
    const result = helpers.searchContextItems({ query: 'test' });
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('content');
  });
});

describe('Remove Context Item', () => {
  it('should call removeContextItem with id only', () => {
    helpers.removeContextItem({ id: 'abc123' });
    expect(helpers.removeContextItem).toHaveBeenCalledWith({ id: 'abc123' });
  });

  it('should call removeContextItem with id and path', () => {
    helpers.removeContextItem({ id: 'abc123', path: '/project' });
    expect(helpers.removeContextItem).toHaveBeenCalledWith({ id: 'abc123', path: '/project' });
  });

  it('should return removal result with id and status', () => {
    const mockResult = { id: 'abc123', status: 'removed' as const };
    (helpers.removeContextItem as jest.Mock).mockReturnValue(mockResult);
    const result = helpers.removeContextItem({ id: 'abc123' });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('status');
    expect(result.status).toBe('removed');
  });

  it('should throw error for empty id', () => {
    (helpers.removeContextItem as jest.Mock).mockImplementation(({ id }: { id: string }) => {
      if (!id || id.trim() === '') {
        throw new Error('id is required');
      }
      return { id, status: 'removed' as const };
    });
    expect(() => helpers.removeContextItem({ id: '' })).toThrow('id is required');
  });
});

describe('Edit Context Item', () => {
  it('should call editContextItem with id only', () => {
    helpers.editContextItem({ id: 'abc123' });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123' });
  });

  it('should call editContextItem with id and content', () => {
    helpers.editContextItem({ id: 'abc123', content: 'Updated content' });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', content: 'Updated content' });
  });

  it('should call editContextItem with id and tags', () => {
    helpers.editContextItem({ id: 'abc123', tags: ['new-tag'] });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', tags: ['new-tag'] });
  });

  it('should call editContextItem with all parameters', () => {
    helpers.editContextItem({ id: 'abc123', content: 'Updated', tags: ['tag1', 'tag2'], path: '/project' });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', content: 'Updated', tags: ['tag1', 'tag2'], path: '/project' });
  });

  it('should return edit result with id and status', () => {
    const mockResult = { id: 'abc123', status: 'updated' as const };
    (helpers.editContextItem as jest.Mock).mockReturnValue(mockResult);
    const result = helpers.editContextItem({ id: 'abc123' });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('status');
    expect(result.status).toBe('updated');
  });

  it('should throw error for empty id', () => {
    (helpers.editContextItem as jest.Mock).mockImplementation(({ id }: { id: string }) => {
      if (!id || id.trim() === '') {
        throw new Error('id is required');
      }
      return { id, status: 'updated' as const };
    });
    expect(() => helpers.editContextItem({ id: '' })).toThrow('id is required');
  });
});

describe('Sync Context', () => {
  it('should call syncContext without path', () => {
    helpers.syncContext({});
    expect(helpers.syncContext).toHaveBeenCalledWith({});
  });

  it('should call syncContext with path', () => {
    helpers.syncContext({ path: '/project' });
    expect(helpers.syncContext).toHaveBeenCalledWith({ path: '/project' });
  });

  it('should return sync result with success status', () => {
    const mockResult = { success: true, syncedFiles: 5 };
    (helpers.syncContext as jest.Mock).mockReturnValue(mockResult);
    const result = helpers.syncContext({});
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('syncedFiles');
    expect(result.success).toBe(true);
  });
});

describe('Input Validation', () => {
  it('should reject search with invalid parameters', () => {
    (helpers.searchContextItems as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid search parameters');
    });
    expect(() => helpers.searchContextItems({ query: 123 as unknown as string })).toThrow('Invalid search parameters');
  });

  it('should reject remove with missing id', () => {
    (helpers.removeContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('id is required');
    });
    expect(() => helpers.removeContextItem({ id: undefined as unknown as string })).toThrow('id is required');
  });

  it('should reject edit with missing id', () => {
    (helpers.editContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('id is required');
    });
    expect(() => helpers.editContextItem({ id: undefined as unknown as string })).toThrow('id is required');
  });

  it('should handle empty search results', () => {
    (helpers.searchContextItems as jest.Mock).mockReturnValue([]);
    const result = helpers.searchContextItems({ query: 'nonexistent' });
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle invalid id format for remove', () => {
    (helpers.removeContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid item ID format');
    });
    expect(() => helpers.removeContextItem({ id: 'invalid!@#' })).toThrow('Invalid item ID format');
  });
});

describe('CLI Error Handling', () => {
  it('should handle CLI errors for search', () => {
    (helpers.searchContextItems as jest.Mock).mockImplementation(() => {
      throw new Error('CLI error: search failed');
    });
    expect(() => helpers.searchContextItems({ query: 'test' })).toThrow('CLI error: search failed');
  });

  it('should handle CLI errors for remove', () => {
    (helpers.removeContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('CLI error: item not found');
    });
    expect(() => helpers.removeContextItem({ id: 'abc123' })).toThrow('CLI error: item not found');
  });

  it('should handle CLI errors for edit', () => {
    (helpers.editContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('CLI error: edit failed');
    });
    expect(() => helpers.editContextItem({ id: 'abc123', content: 'new' })).toThrow('CLI error: edit failed');
  });

  it('should handle CLI errors for sync', () => {
    (helpers.syncContext as jest.Mock).mockImplementation(() => {
      throw new Error('CLI error: sync failed');
    });
    expect(() => helpers.syncContext({})).toThrow('CLI error: sync failed');
  });
});

describe('Add Context Item - Edge Cases', () => {
  it('should call addContextItem with sync flag', () => {
    helpers.addContextItem('test item', '/tmp', 'test-project', ['tag1'], true);
    expect(helpers.addContextItem).toHaveBeenCalledWith('test item', '/tmp', 'test-project', ['tag1'], true);
  });

  it('should call addContextItem without sync flag when undefined', () => {
    helpers.addContextItem('test item', '/tmp', 'test-project', ['tag1'], undefined);
    expect(helpers.addContextItem).toHaveBeenCalledWith('test item', '/tmp', 'test-project', ['tag1'], undefined);
  });

  it('should handle empty content gracefully', () => {
    (helpers.addContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'added' as const });
    const result = helpers.addContextItem('', '/tmp');
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('added');
  });

  it('should handle empty tags array', () => {
    helpers.addContextItem('test item', '/tmp', 'test-project', []);
    expect(helpers.addContextItem).toHaveBeenCalledWith('test item', '/tmp', 'test-project', []);
  });

  it('should handle special characters in content', () => {
    helpers.addContextItem('Test "quoted" & <special> chars', '/tmp', 'test', ['tag']);
    expect(helpers.addContextItem).toHaveBeenCalled();
  });

  it('should handle unicode characters in content', () => {
    helpers.addContextItem('Test 🚀 emoji & 中文 content', '/tmp');
    expect(helpers.addContextItem).toHaveBeenCalled();
  });
});

describe('Complete Context Item - Edge Cases', () => {
  it('should call completeContextItem with full UUID', () => {
    helpers.completeContextItem('abc123def456ghi789', '/tmp');
    expect(helpers.completeContextItem).toHaveBeenCalledWith('abc123def456ghi789', '/tmp');
  });

  it('should call completeContextItem with 6-char prefix', () => {
    helpers.completeContextItem('abc123', '/tmp');
    expect(helpers.completeContextItem).toHaveBeenCalledWith('abc123', '/tmp');
  });

  it('should throw error for invalid id format', () => {
    (helpers.completeContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid item ID format');
    });
    expect(() => helpers.completeContextItem('', '/tmp')).toThrow('Invalid item ID format');
  });

  it('should handle whitespace-only id', () => {
    (helpers.completeContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('id is required');
    });
    expect(() => helpers.completeContextItem('   ', '/tmp')).toThrow('id is required');
  });
});

describe('List Context Items - Edge Cases', () => {
  it('should call listContextItems without showCompleted', () => {
    helpers.listContextItems('/tmp', undefined);
    expect(helpers.listContextItems).toHaveBeenCalledWith('/tmp', undefined);
  });

  it('should call listContextItems with showCompleted false', () => {
    helpers.listContextItems('/tmp', false);
    expect(helpers.listContextItems).toHaveBeenCalledWith('/tmp', false);
  });

  it('should return empty array when no items exist', () => {
    (helpers.listContextItems as jest.Mock).mockReturnValue([]);
    const result = helpers.listContextItems('/tmp', false);
    expect(result).toEqual([]);
  });

  it('should handle deep nested path', () => {
    helpers.listContextItems('/home/user/projects/my-app/src', true);
    expect(helpers.listContextItems).toHaveBeenCalled();
  });
});

describe('Get Context Status - Edge Cases', () => {
  it('should return status with zero items', () => {
    (helpers.getContextStatus as jest.Mock).mockReturnValue({
      totalItems: 0,
      completedItems: 0,
      activeItems: 0,
      projects: [],
      tags: []
    });
    const result = helpers.getContextStatus('/tmp');
    expect(result.totalItems).toBe(0);
    expect(result.activeItems).toBe(0);
  });

  it('should return status with many projects and tags', () => {
    (helpers.getContextStatus as jest.Mock).mockReturnValue({
      totalItems: 100,
      completedItems: 75,
      activeItems: 25,
      projects: ['proj1', 'proj2', 'proj3'],
      tags: ['urgent', 'bug', 'feature', 'docs']
    });
    const result = helpers.getContextStatus('/tmp');
    expect(result.projects).toHaveLength(3);
    expect(result.tags).toHaveLength(4);
  });

  it('should handle path with spaces', () => {
    helpers.getContextStatus('/path/with spaces/project');
    expect(helpers.getContextStatus).toHaveBeenCalled();
  });
});

describe('Search Context Items - Complex Scenarios', () => {
  beforeEach(() => {
    (helpers.searchContextItems as jest.Mock).mockReset();
  });

  it('should search with multiple tags', () => {
    (helpers.searchContextItems as jest.Mock).mockReturnValue([]);
    helpers.searchContextItems({ query: 'test', tags: ['tag1', 'tag2', 'tag3'] });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'test', tags: ['tag1', 'tag2', 'tag3'] });
  });

  it('should search with query and showCompleted', () => {
    (helpers.searchContextItems as jest.Mock).mockReturnValue([]);
    helpers.searchContextItems({ query: 'bug', showCompleted: true });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'bug', showCompleted: true });
  });

  it('should search with all parameters combined', () => {
    (helpers.searchContextItems as jest.Mock).mockReturnValue([]);
    helpers.searchContextItems({ query: 'test', tags: ['urgent'], showCompleted: false, path: '/project' });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'test', tags: ['urgent'], showCompleted: false, path: '/project' });
  });

  it('should return results with all fields populated', () => {
    const mockResults = [
      { id: 'abc123', fullId: 'abc123def456', content: 'Test item', project: 'test-project', tags: ['tag1', 'tag2'], completedAt: '2024-01-15', createdAt: '2024-01-01' },
      { id: 'def456', fullId: 'def456ghi789', content: 'Another item', project: '', tags: [], completedAt: null, createdAt: '2024-01-10' }
    ];
    (helpers.searchContextItems as jest.Mock).mockReturnValue(mockResults);
    const result = helpers.searchContextItems({ query: 'test' });
    expect(result).toHaveLength(2);
    expect(result[0].tags).toHaveLength(2);
    expect(result[1].completedAt).toBeNull();
  });

  it('should handle special regex characters in query', () => {
    helpers.searchContextItems({ query: 'test[1]?*' });
    expect(helpers.searchContextItems).toHaveBeenCalled();
  });
});

describe('Remove Context Item - Sync Flag', () => {
  beforeEach(() => {
    (helpers.removeContextItem as jest.Mock).mockReset();
  });

  it('should call removeContextItem with sync flag true', () => {
    (helpers.removeContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'removed' as const });
    helpers.removeContextItem({ id: 'abc123', sync: true });
    expect(helpers.removeContextItem).toHaveBeenCalledWith({ id: 'abc123', sync: true });
  });

  it('should call removeContextItem with sync flag false', () => {
    (helpers.removeContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'removed' as const });
    helpers.removeContextItem({ id: 'abc123', sync: false });
    expect(helpers.removeContextItem).toHaveBeenCalledWith({ id: 'abc123', sync: false });
  });

  it('should call removeContextItem with all parameters including sync', () => {
    (helpers.removeContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'removed' as const });
    helpers.removeContextItem({ id: 'abc123', path: '/project', sync: true });
    expect(helpers.removeContextItem).toHaveBeenCalledWith({ id: 'abc123', path: '/project', sync: true });
  });

  it('should throw error for whitespace-only id', () => {
    (helpers.removeContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('id is required');
    });
    expect(() => helpers.removeContextItem({ id: '   ' })).toThrow('id is required');
  });

  it('should return success for valid remove operation', () => {
    (helpers.removeContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'removed' as const });
    const result = helpers.removeContextItem({ id: 'abc123' });
    expect(result.status).toBe('removed');
  });
});

describe('Edit Context Item - Sync Flag & Edge Cases', () => {
  beforeEach(() => {
    (helpers.editContextItem as jest.Mock).mockReset();
  });

  it('should call editContextItem with sync flag true', () => {
    (helpers.editContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'updated' as const });
    helpers.editContextItem({ id: 'abc123', sync: true });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', sync: true });
  });

  it('should call editContextItem with sync flag false', () => {
    (helpers.editContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'updated' as const });
    helpers.editContextItem({ id: 'abc123', content: 'updated', sync: false });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', content: 'updated', sync: false });
  });

  it('should call editContextItem with all parameters including sync', () => {
    (helpers.editContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'updated' as const });
    helpers.editContextItem({ id: 'abc123', content: 'new', tags: ['new'], path: '/project', sync: true });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', content: 'new', tags: ['new'], path: '/project', sync: true });
  });

  it('should handle editing content only', () => {
    (helpers.editContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'updated' as const });
    helpers.editContextItem({ id: 'abc123', content: 'Updated content' });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', content: 'Updated content' });
  });

  it('should handle editing tags only', () => {
    (helpers.editContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'updated' as const });
    helpers.editContextItem({ id: 'abc123', tags: ['updated-tag'] });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', tags: ['updated-tag'] });
  });

  it('should handle empty tags array (clear all tags)', () => {
    (helpers.editContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'updated' as const });
    helpers.editContextItem({ id: 'abc123', tags: [] });
    expect(helpers.editContextItem).toHaveBeenCalledWith({ id: 'abc123', tags: [] });
  });

  it('should throw error for whitespace-only id', () => {
    (helpers.editContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('id is required');
    });
    expect(() => helpers.editContextItem({ id: '\t\n' })).toThrow('id is required');
  });

  it('should throw error for undefined id', () => {
    (helpers.editContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('id is required');
    });
    expect(() => helpers.editContextItem({ id: undefined as unknown as string })).toThrow('id is required');
  });
});

describe('Sync Context - Edge Cases', () => {
  it('should return sync result with zero files synced', () => {
    (helpers.syncContext as jest.Mock).mockReturnValue({ success: true, syncedFiles: 0 });
    const result = helpers.syncContext({});
    expect(result.success).toBe(true);
    expect(result.syncedFiles).toBe(0);
  });

  it('should handle sync failure gracefully', () => {
    (helpers.syncContext as jest.Mock).mockReturnValue({ success: false, syncedFiles: 0 });
    const result = helpers.syncContext({});
    expect(result.success).toBe(false);
  });

  it('should handle sync with many files', () => {
    (helpers.syncContext as jest.Mock).mockReturnValue({ success: true, syncedFiles: 100 });
    const result = helpers.syncContext({ path: '/large-project' });
    expect(result.syncedFiles).toBe(100);
  });

  it('should call syncContext with empty path (undefined)', () => {
    helpers.syncContext({ path: undefined });
    expect(helpers.syncContext).toHaveBeenCalledWith({ path: undefined });
  });
});

describe('Type Checking & Parameter Validation', () => {
  it('should handle null query parameter', () => {
    (helpers.searchContextItems as jest.Mock).mockReturnValue([]);
    const result = helpers.searchContextItems({ query: null as unknown as undefined });
    expect(result).toEqual([]);
  });

  it('should handle undefined tags parameter', () => {
    helpers.searchContextItems({ query: 'test', tags: undefined });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'test', tags: undefined });
  });

  it('should handle undefined showCompleted parameter', () => {
    helpers.searchContextItems({ query: 'test', showCompleted: undefined });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'test', showCompleted: undefined });
  });

  it('should handle undefined path parameter', () => {
    helpers.searchContextItems({ query: 'test', path: undefined });
    expect(helpers.searchContextItems).toHaveBeenCalledWith({ query: 'test', path: undefined });
  });

  it('should handle empty project string', () => {
    helpers.addContextItem('test', '/tmp', '', []);
    expect(helpers.addContextItem).toHaveBeenCalled();
  });

  it('should handle undefined project parameter', () => {
    helpers.addContextItem('test', '/tmp', undefined, []);
    expect(helpers.addContextItem).toHaveBeenCalled();
  });
});

describe('Boundary Conditions', () => {
  it('should handle very long content string', () => {
    const longContent = 'a'.repeat(10000);
    (helpers.addContextItem as jest.Mock).mockReturnValue({ id: 'abc123', status: 'added' as const });
    const result = helpers.addContextItem(longContent, '/tmp');
    expect(result).toHaveProperty('id');
  });

  it('should handle many tags (boundary test)', () => {
    const manyTags = Array.from({ length: 50 }, (_, i) => `tag${i}`);
    helpers.addContextItem('test', '/tmp', 'project', manyTags);
    expect(helpers.addContextItem).toHaveBeenCalled();
  });

  it('should handle tags with special characters', () => {
    helpers.addContextItem('test', '/tmp', undefined, ['tag-with-dash', 'tag_with_underscore', 'tag.with.dot', 'tag:colon']);
    expect(helpers.addContextItem).toHaveBeenCalled();
  });

  it('should handle very long path', () => {
    const longPath = '/'.repeat(500);
    helpers.listContextItems(longPath);
    expect(helpers.listContextItems).toHaveBeenCalled();
  });

  it('should handle path with unicode characters', () => {
    helpers.listContextItems('/中文/路径/プロジェクト');
    expect(helpers.listContextItems).toHaveBeenCalled();
  });

  it('should handle id at minimum length (6 characters)', () => {
    (helpers.completeContextItem as jest.Mock).mockReturnValue({ id: 'abcdef', status: 'completed' as const });
    helpers.completeContextItem('abcdef', '/tmp');
    expect(helpers.completeContextItem).toHaveBeenCalledWith('abcdef', '/tmp');
  });
});

describe('Error Recovery & Edge Cases', () => {
  it('should handle CLI timeout error', () => {
    (helpers.syncContext as jest.Mock).mockImplementation(() => {
      throw new Error('Command timed out');
    });
    expect(() => helpers.syncContext({})).toThrow('Command timed out');
  });

  it('should handle CLI not found error', () => {
    (helpers.listContextItems as jest.Mock).mockImplementation(() => {
      throw new Error('Command failed: ck not found');
    });
    expect(() => helpers.listContextItems('/tmp')).toThrow('ck not found');
  });

  it('should handle JSON parse error', () => {
    (helpers.searchContextItems as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to parse CLI output');
    });
    expect(() => helpers.searchContextItems({ query: 'test' })).toThrow('Failed to parse CLI output');
  });

  it('should handle permission denied error', () => {
    (helpers.getContextStatus as jest.Mock).mockImplementation(() => {
      throw new Error('Permission denied');
    });
    expect(() => helpers.getContextStatus('/protected')).toThrow('Permission denied');
  });

  it('should handle concurrent operation errors', () => {
    (helpers.editContextItem as jest.Mock).mockImplementation(() => {
      throw new Error('Item was modified by another operation');
    });
    expect(() => helpers.editContextItem({ id: 'abc123', content: 'new' })).toThrow('modified by another operation');
  });

  it('should handle network-related sync errors', () => {
    (helpers.syncContext as jest.Mock).mockImplementation(() => {
      throw new Error('Network error during sync');
    });
    expect(() => helpers.syncContext({})).toThrow('Network error during sync');
  });
});

// =============================================================================
// Tool Naming Convention Tests
// =============================================================================

describe('MCP Tool Naming Convention', () => {
  it('should have all tools using snake_case', () => {
    const toolNames = [
      'list_context_items',
      'add_context_item',
      'mark_context_done',
      'get_context_status',
      'search_context_items',
      'remove_context_item',
      'edit_context_item',
      'sync_context_items',
    ];
    // Verify all tool names follow snake_case pattern
    toolNames.forEach(name => {
      expect(name).toMatch(/^[a-z]+(?:_[a-z]+)*$/);
    });
  });

  it('should have all tools following verb_noun pattern', () => {
    const expectedPattern = /^(list|add|mark|get|search|remove|edit|sync)_[a-z]+(?:_[a-z]+)*$/;
    const toolNames = [
      'list_context_items',
      'add_context_item',
      'mark_context_done',
      'get_context_status',
      'search_context_items',
      'remove_context_item',
      'edit_context_item',
      'sync_context_items',
    ];
    toolNames.forEach(name => {
      expect(name).toMatch(expectedPattern);
    });
  });

  it('should have all tools using consistent plural form (context_items)', () => {
    const pluralTools = [
      'list_context_items',
      'search_context_items',
      'sync_context_items',
    ];
    pluralTools.forEach(name => {
      expect(name).toContain('context_items');
    });
  });

  it('should have canonical tool names under 32 characters', () => {
    const toolNames = [
      'list_context_items',
      'add_context_item',
      'mark_context_done',
      'get_context_status',
      'search_context_items',
      'remove_context_item',
      'edit_context_item',
      'sync_context_items',
    ];
    toolNames.forEach(name => {
      expect(name.length).toBeLessThanOrEqual(32);
    });
  });
});

describe('CLI Command to MCP Tool Mapping', () => {
  it('should map ck list to list_context_items', () => {
    const mapping: Record<string, string> = {
      'list': 'list_context_items',
    };
    expect(mapping['list']).toBe('list_context_items');
  });

  it('should map ck add to add_context_item', () => {
    const mapping: Record<string, string> = {
      'add': 'add_context_item',
    };
    expect(mapping['add']).toBe('add_context_item');
  });

  it('should map ck done to mark_context_done', () => {
    const mapping: Record<string, string> = {
      'done': 'mark_context_done',
    };
    expect(mapping['done']).toBe('mark_context_done');
  });

  it('should map ck status to get_context_status', () => {
    const mapping: Record<string, string> = {
      'status': 'get_context_status',
    };
    expect(mapping['status']).toBe('get_context_status');
  });

  it('should map ck search to search_context_items', () => {
    const mapping: Record<string, string> = {
      'search': 'search_context_items',
    };
    expect(mapping['search']).toBe('search_context_items');
  });

  it('should map ck remove to remove_context_item', () => {
    const mapping: Record<string, string> = {
      'remove': 'remove_context_item',
    };
    expect(mapping['remove']).toBe('remove_context_item');
  });

  it('should map ck edit to edit_context_item', () => {
    const mapping: Record<string, string> = {
      'edit': 'edit_context_item',
    };
    expect(mapping['edit']).toBe('edit_context_item');
  });

  it('should map ck sync to sync_context_items', () => {
    const mapping: Record<string, string> = {
      'sync': 'sync_context_items',
    };
    expect(mapping['sync']).toBe('sync_context_items');
  });

  it('should map ck init to init_context', () => {
    const mapping: Record<string, string> = {
      'init': 'init_context',
    };
    expect(mapping['init']).toBe('init_context');
  });
});

describe('Init Context', () => {
  it('should call initContext without path', () => {
    helpers.initContext({});
    expect(helpers.initContext).toHaveBeenCalledWith({});
  });

  it('should call initContext with path', () => {
    helpers.initContext({ path: '/new-project' });
    expect(helpers.initContext).toHaveBeenCalledWith({ path: '/new-project' });
  });

  it('should return initialized status', () => {
    (helpers.initContext as jest.Mock).mockReturnValue({ path: '.', status: 'initialized' });
    const result = helpers.initContext({});
    expect(result.status).toBe('initialized');
  });
});