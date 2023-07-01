import { createReader } from './__testUtils__/configReader.ts';

describe('createConfigReader', () => {
  describe('when a user accesses a known property', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader('countryCode');
      expect(value).toBe('GB');
    });
  });

  describe('when a user accesses a known nested property', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader('pages.contactDetails.name');
      expect(value).toBe('contactDetails');
    });
  });

  describe('when the reader is scoped', () => {
    describe('when a user accesses a known property', () => {
      it('should return the correct value', () => {
        const reader = createReader();
        const scopedReader = reader.scope('pages.contactDetails');
        const value = scopedReader('name');
        expect(value).toBe('contactDetails');
      });
    });
  });

  describe('when the reader is scoped multiple times', () => {
    describe('when a user accesses a known property', () => {
      it('should return the correct value', () => {
        const reader = createReader();
        const scopedReader = reader.scope('pages.contactDetails').scope('sections.1.sections').scope('0');
        const value = scopedReader('name');
        expect(value).toBe('main');
      });
    });
  });
});
