import { createReader } from './__testUtils__/configReader.ts';

describe('createConfigReader', () => {
  describe('when a user accesses a known property', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader.read('countryCode');
      expect(value).toBe('GB');
    });
  });

  describe('when a user accesses a known nested property', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader.read('pages.contactDetails.name');
      expect(value).toBe('contactDetails');
    });
  });

  describe('when vars options are passed in', () => {
    const vars = {
      name: 'Simon',
      profession: 'pieman',
    };

    describe('when a user accesses a property that is not a string', () => {
      it('should throw the correct error', () => {
        const reader = createReader();

        // @ts-expect-error path does not resovle to a string
        expect(() => reader.read('pages.contactDetails', vars)).toThrow(
          new Error(
            'config reader received variables to use in string template, but the path did not resolve to a string.',
          ),
        );
      });
    });

    describe('when a user accesses a property that is a string', () => {
      it('should return the correct string value with template placeholders populated', () => {
        const reader = createReader();
        const value = reader.read('templateString', vars);
        expect(value).toBe('Simple Simon met a pieman going to the fair');
      });
    });
  });

  describe('when the reader is scoped', () => {
    describe('when a user accesses a known property', () => {
      it('should return the correct value', () => {
        const reader = createReader();
        const scopedReader = reader.scope('pages.contactDetails');
        const value = scopedReader.read('name');
        expect(value).toBe('contactDetails');
      });
    });
  });

  describe('when the reader is scoped multiple times', () => {
    describe('when a user accesses a known property', () => {
      it('should return the correct value', () => {
        const reader = createReader();
        const scopedReader = reader.scope('pages.contactDetails').scope('sections.1.sections').scope('0');
        const value = scopedReader.read('name');
        expect(value).toBe('main');
      });
    });
  });
});
