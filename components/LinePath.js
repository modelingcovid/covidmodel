import {motion} from 'framer-motion';
import {curveBasis} from '@vx/curve';
import {LinePath as VxLinePath} from '@vx/shape';

const spring = {
  type: 'spring',
  damping: 35,
  stiffness: 400,
};

export const LinePath = ({
  curve = curveBasis,
  data,
  fill,
  x,
  y,
  initial = {},
  animate = {},
  transition = spring,
  ...remaining
}) => (
  <VxLinePath curve={curve} x={x} y={y}>
    {({path}) => {
      const d = path(data) || '';
      return (
        <motion.path
          {...remaining}
          initial={{...initial, d}}
          animate={{...animate, d}}
          transition={transition}
          fill={fill || 'transparent'}
        />
      );
    }}
  </VxLinePath>
);
