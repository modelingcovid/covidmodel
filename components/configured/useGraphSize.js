import {useMemo, useRef} from 'react';
import {useContentRect} from '../util';

export function useGraphSize(defaultSize = {width: 896, height: 360}) {
  const ref = useRef(null);
  const {width} = useContentRect(ref, defaultSize);

  return useMemo(() => {
    const large = width > 600 ? 360 : 256;
    const regular = width > 600 ? 256 : 224;
    const small = 208;
    return {
      ref,
      width,
      height: {
        large,
        regular,
        small,
      },
    };
  }, [width]);
}
