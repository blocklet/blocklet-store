import Box from '@mui/material/Box';
import { useEffect, useRef, useState } from 'react';
import { blockletRender } from '../../blocklet-render';
import { BLOCKLET_CARD_WIDTH, SCROLL_OFFSET } from '../constant';
import HorizontalContainer from './horizontal-container';
import { IBlockletMeta } from '../../../../type';

export default function BlockletList({ blocklets }: { blocklets: IBlockletMeta[] }) {
  const ref = useRef<HTMLDivElement>(null);
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

  return (
    <HorizontalContainer offset={SCROLL_OFFSET}>
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          width: { xs: '100%', md: 'fit-content' },
        }}>
        {blocklets.map((blocklet) => (
          <Box
            key={blocklet.did}
            sx={{
              width: { md: BLOCKLET_CARD_WIDTH },
            }}>
            {blockletRender({ blocklet, autocompleteSetters: {} })}
          </Box>
        ))}
      </Box>
    </HorizontalContainer>
  );
}
