import { type AnyRecord, type TransformConfigHandlerSync } from '../types.ts';

export const removeDisabledSlices: TransformConfigHandlerSync = <Config extends AnyRecord>(
  clone: Config,
  config: Config,
) => {
  if ('__disabled' in config) {
    return {
      action: 'DELETE_NODE',
    };
  }

  return {
    value: clone,
  };
};
