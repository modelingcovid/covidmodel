import {useMemo, useRef} from 'react';
import {useContentRect} from '../util';
import {marginDecorated} from '../graph';

export function useGraphSize(defaultSize = {width: 896, height: 360}) {
  const ref = useRef(null);
  const {width} = useContentRect(ref, defaultSize);

  return useMemo(() => {
    const offset = marginDecorated.top + marginDecorated.bottom;
    const large = width > 600 ? 220 : 128;
    const regular = width > 600 ? 116 : 100;
    const small = 68;

    return {
      ref,
      width,
      height: {
        large: large + offset,
        regular: regular + offset,
        small: small + offset,
      },
    };
  }, [width]);
}
