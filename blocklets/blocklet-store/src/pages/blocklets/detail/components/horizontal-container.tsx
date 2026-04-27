import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Box, { BoxProps } from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useScroll } from 'ahooks';
import { useEffect, useRef, useState } from 'react';

const navIconSx = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 100,
  cursor: 'pointer',
  color: 'text.hint',
  width: 32,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
};

const screenWrapperSx = {
  overflowX: 'auto',
  overflowY: 'visible',
  py: 0.5,
  px: '2px',
  scrollSnapType: 'x mandatory',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '&::-moz-scrollbar': {
    display: 'none',
  },
  '&::-ms-scrollbar': {
    display: 'none',
  },
  '&::-o-scrollbar': {
    display: 'none',
  },
};

export default function HorizontalContainer({ children, offset = 0, ...props }: { offset?: number } & BoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const position = useScroll(ref);

  const hasPrev = position && position.left > 0;
  const hasNext = ref.current && position && position.left < ref.current.scrollWidth - ref.current.clientWidth - 2;

  const [, forceUpdate] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const observer = new ResizeObserver(() => {
      forceUpdate((pre) => !pre);
    });

    if (el) {
      observer.observe(el);
    }
    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, []);

  const offsetWidth = ref.current?.clientWidth || offset;

  return (
    <Box
      {...props}
      sx={[
        {
          position: 'relative',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}>
      <IconButton
        className="prev-btn"
        onClick={() => smoothScroll(-offsetWidth)}
        sx={{ display: { xs: 'none', md: hasPrev ? 'flex' : 'none' }, ...navIconSx, left: -30 }}>
        <ChevronLeft />
      </IconButton>
      <Box
        ref={ref}
        sx={[
          {
            display: 'flex',
            flexDirection: 'row',
            gap: 3,
          },
          ...(Array.isArray(screenWrapperSx) ? screenWrapperSx : [screenWrapperSx]),
        ]}>
        {children}
      </Box>
      <IconButton
        className="next-btn"
        onClick={() => smoothScroll(offsetWidth)}
        sx={{ display: { xs: 'none', md: hasNext ? 'flex' : 'none' }, ...navIconSx, right: -30 }}>
        <ChevronRight />
      </IconButton>
    </Box>
  );

  function smoothScroll(width: number) {
    ref.current?.scrollTo({ left: ref.current.scrollLeft + (width || ref.current.clientWidth), behavior: 'smooth' });
  }
}
