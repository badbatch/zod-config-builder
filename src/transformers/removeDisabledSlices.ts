import {
  type AnyRecord,
  NonEmumeralProperties,
  TransformConfigHandlerAction,
  type TransformConfigHandlerSync,
} from '../types.ts';

export const removeDisabledSlices: TransformConfigHandlerSync = <Config extends AnyRecord>(
  clone: Config,
  config: Config,
) => {
  if (NonEmumeralProperties.DISABLED in config) {
    return {
      action: TransformConfigHandlerAction.DELETE_NODE,
    };
  }

  return {
    value: clone,
  };
};
