import { createReader } from './__testUtils__/configReader.ts';

describe('createConfigReader', () => {
  describe('when that value is a string', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader.read('countryCode');
      expect(value).toBe('GB');
    });
  });

  describe('when that value is a number', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader.read('timeouts.apollo');
      expect(value).toBe(10_000);
    });
  });

  describe('when that value is a boolean', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader.read('enabled');
      expect(value).toBe(true);
    });
  });

  describe('when that value is null', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      const value = reader.read('countryName');
      expect(value).toBeNull();
    });
  });

  describe('when that value is undefined', () => {
    it('should return the correct value', () => {
      const reader = createReader();
      // Required for testing
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const value = reader.read('name');
      expect(value).toBeUndefined();
    });
  });

  describe('when that value is an array', () => {
    describe('when the array is of primitives', () => {
      it('should return the correct value', () => {
        const reader = createReader();
        const value = reader.read('languageCodes');
        expect(value).toEqual(['en']);
      });
    });

    describe('when the array is of objects', () => {
      it('should throw the expected error', () => {
        const reader = createReader();

        expect(() => reader.read('pages.contactDetails.sections')).toThrow(
          'Path resolved to an object or an array of objects, but `read` can only resolve to a primitive value or an array of primitives. Use the `scope` method instead',
        );
      });
    });
  });

  describe('when that value is an object', () => {
    it('should throw the expected error', () => {
      const reader = createReader();

      // @ts-expect-error Required to test error
      expect(() => reader.read('timeouts')).toThrow(
        'Path resolved to an object or an array of objects, but `read` can only resolve to a primitive value or an array of primitives. Use the `scope` method instead.',
      );
    });
  });

  describe('when vars options are passed in', () => {
    const vars = {
      name: 'Simon',
      profession: 'pieman',
    };

    describe('when a user accesses a property that is not a string', () => {
      it('should throw the expected error', () => {
        const reader = createReader();

        expect(() => reader.read('timeouts.apollo', vars)).toThrow(
          'Config reader received variables to use in string template, but the path did not resolve to a string.',
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
    describe('when the value is an object', () => {
      it('should return the correct value', () => {
        const reader = createReader();
        const scopedReader = reader.scope('pages.contactDetails');
        const value = scopedReader.read('name');
        expect(value).toBe('contactDetails');
      });
    });

    describe('when the value is an array of objects', () => {
      it('should return the correct value', () => {
        const reader = createReader();
        const scopedReader = reader.scope('pages.contactDetails.sections');
        const subScopedReader = scopedReader.scope('0');
        const value = subScopedReader.read('name');
        expect(value).toBe('header');
      });
    });

    describe('when the value is an array of primitives', () => {
      it('should throw the expected error', () => {
        const reader = createReader();

        expect(() => reader.scope('languageCodes')).toThrow(
          'Path resolved to a primitive or an array of primitive, but `scope` can only resolve to an object or an array of object. Use the `read` method instead.',
        );
      });
    });

    describe('when the value is a primitive', () => {
      it('should throw the expected error', () => {
        const reader = createReader();

        // @ts-expect-error Required to test error
        expect(() => reader.scope('timeouts.apollo')).toThrow(
          'Path resolved to a primitive or an array of primitive, but `scope` can only resolve to an object or an array of object. Use the `read` method instead.',
        );
      });
    });
  });
});
