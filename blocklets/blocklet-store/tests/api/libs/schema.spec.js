import { describe, beforeEach, expect, it, vi } from 'vitest';
import { checkUrlQuery, SCHEMA } from '../../../api/libs/schema';

describe('Schema Validation', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      query: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    nextFunction = vi.fn();
  });

  describe('checkUrlQuery middleware', () => {
    it('should pass valid query parameters', () => {
      mockReq.query = {
        page: 1,
        pageSize: 20,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };

      const schema = {
        page: SCHEMA.page(),
        pageSize: SCHEMA.pageSize(),
        sortBy: SCHEMA.sortBy(),
        sortDirection: SCHEMA.sortDirection(),
      };

      checkUrlQuery(schema)(mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should strip unknown query parameters', () => {
      mockReq.query = {
        page: 1,
        unknownParam: 'value',
      };

      const schema = {
        page: SCHEMA.page(),
      };

      checkUrlQuery(schema)(mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject invalid parameter values', () => {
      mockReq.query = {
        page: 0, // less than minimum 1
        pageSize: 200, // greater than maximum 100
      };

      const schema = {
        page: SCHEMA.page(),
        pageSize: SCHEMA.pageSize(),
      };

      checkUrlQuery(schema)(mockReq, mockRes, nextFunction);
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.arrayContaining([expect.any(String)]),
        })
      );
    });
  });

  describe('SCHEMA Validations', () => {
    describe('page', () => {
      const validValues = [1, 2, 10, 1500];
      const invalidValues = [0, -1, -2, -3];

      it.each(validValues)('should accept valid page: %s', (value) => {
        const { error } = SCHEMA.page().validate(value);
        expect(error).toBeUndefined();
      });

      it.each(invalidValues)('should reject invalid page: %s', (value) => {
        const { error } = SCHEMA.page().validate(value);
        expect(error.message).toBe('"value" must be greater than or equal to 1');
      });
    });

    describe('pageSize', () => {
      const validValues = [1, 2, 10, 1500];
      const invalidLessThanValues = [0, -1, -2, -3];
      const invalidGreaterThanValues = [1501];

      it.each(validValues)('should accept valid page size: %s', (value) => {
        const { error } = SCHEMA.pageSize().validate(value);
        expect(error).toBeUndefined();
      });

      it.each(invalidLessThanValues)('should reject invalid page size: %s', (value) => {
        const { error } = SCHEMA.pageSize().validate(value);
        expect(error.message).toBe('"value" must be greater than or equal to 1');
      });

      it.each(invalidGreaterThanValues)('should reject invalid page size: %s', (value) => {
        const { error } = SCHEMA.pageSize().validate(value);
        expect(error.message).toBe('"value" must be less than or equal to 1500');
      });
    });

    describe('version', () => {
      const { error: validError } = SCHEMA.version().validate('1.2.3');
      const { error: invalidError } = SCHEMA.version().validate('1.2');

      it('should accept valid version format', () => {
        expect(validError).toBeUndefined();
      });

      it('should reject invalid version format', () => {
        expect(invalidError.message).toBe('"value" must like x.x.x');
      });
    });

    describe('sortBy', () => {
      const validValues = ['createdAt', 'stats.downloads', 'updatedAt', 'lastPublishedAt', 'source'];

      it.each(validValues)('should accept valid sort field: %s', (value) => {
        const { error } = SCHEMA.sortBy().validate(value);
        expect(error).toBeUndefined();
      });

      it('should reject invalid sort field', () => {
        const { error } = SCHEMA.sortBy().validate('invalidField');
        expect(error.message).toBe(
          '"value" must be one of [createdAt, stats.downloads, updatedAt, lastPublishedAt, source]'
        );
      });
    });

    describe('meilisearchSortBy', () => {
      const validValues = ['stats.downloads', 'lastPublishedAt', 'title'];
      it.each(validValues)('should accept valid sort field: %s', (value) => {
        const { error } = SCHEMA.meilisearchSortBy().validate(value);
        expect(error).toBeUndefined();
      });

      const invalidValues = ['createdAt', 'updatedAt', 'source'];
      it.each(invalidValues)('should reject invalid sort field: %s', (value) => {
        const { error } = SCHEMA.meilisearchSortBy().validate(value);
        expect(error.message).toBe('"value" must be one of [stats.downloads, lastPublishedAt, title]');
      });
    });

    describe('keyword', () => {
      it('should accept keyword with valid length', () => {
        const { error: validError } = SCHEMA.keyword().validate('valid keyword');
        expect(validError).toBeUndefined();
      });

      it('should reject keyword exceeding max length', () => {
        const longKeyword = 'a'.repeat(501);
        const { error: invalidError } = SCHEMA.keyword().validate(longKeyword);
        expect(invalidError.message).toBe('"value" length must be less than or equal to 500 characters long');
      });
    });

    describe('did', () => {
      it('should accept valid DID', () => {
        const { error: validError } = SCHEMA.did().validate('z8ia22AX1PovjTi1YQw8ChgsbeVExYsX4dPFt');
        expect(validError).toBeUndefined();
      });

      it('should reject invalid DID', () => {
        const { error: invalidError } = SCHEMA.did().validate('invalid-did');
        expect(invalidError.message).toBe('"value" is not a valid DID');
      });
    });

    describe('locale', () => {
      it('should accept supported languages', () => {
        const { error: zhError } = SCHEMA.locale().validate('zh');
        const { error: enError } = SCHEMA.locale().validate('en');
        expect(zhError).toBeUndefined();
        expect(enError).toBeUndefined();
      });

      it('should reject unsupported languages', () => {
        const { error } = SCHEMA.locale().validate('fr');
        expect(error.message).toBe('"value" must be one of [en, zh]');
      });
    });

    describe('url', () => {
      const validUrls = [
        'https://example.com',
        'https://sub.example.com',
        'https://example.com/path',
        'https://example.com/path?query=value',
        'https://example.com:8080/path',
      ];

      const invalidUrls = [
        ['not-a-url', '"value" is not a valid URL'],
        ['ftp://example.com', '"value" must use either http or https protocol'],
      ];

      it.each(validUrls)('should accept valid url: %s', (url) => {
        const { error } = SCHEMA.url().validate(url);
        expect(error).toBeUndefined();
      });

      it.each(invalidUrls)('should reject %s with error: %s', (value, error) => {
        const result = SCHEMA.url().validate(value);
        expect(result.error.message).toBe(error);
      });

      it('should accept empty string', () => {
        const { error } = SCHEMA.url().validate('');
        expect(error).toBeUndefined();
      });

      it('should handle undefined value', () => {
        const { error } = SCHEMA.url().validate(undefined);
        expect(error).toBeUndefined();
      });
    });
  });
});
