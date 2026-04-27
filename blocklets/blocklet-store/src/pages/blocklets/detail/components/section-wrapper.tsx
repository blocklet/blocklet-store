import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { Box, BoxProps, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import TextButton from './text-button';

const MAX_HEIGHT = 400;

export default function SectionWrapper({ children, ...props }: BoxProps) {
  const { t } = useLocaleContext();
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleExpand = () => setIsExpanded((prevState) => !prevState);

  useEffect(() => {
    const el = ref.current;
    const observer = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setIsOverflow(height >= MAX_HEIGHT);
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
    <Box {...props}>
      <Box
        ref={ref}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          maxHeight: isExpanded ? 'none' : MAX_HEIGHT,
        }}>
        {children}
        <Box
          sx={{
            display: isExpanded || !isOverflow ? 'none' : 'block',
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '50%',
            background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), ${theme.palette.background.default})`,
          }}
        />
      </Box>
      {isOverflow && (
        <TextButton
          onClick={toggleExpand}
          sx={{ mt: 2 }}
          typographyProps={{ sx: { display: 'flex', alignItems: 'center' } }}>
          <KeyboardDoubleArrowUpIcon style={{ transform: isExpanded ? 'none' : 'rotate(180deg)' }} />
          {isExpanded ? t('blockletDetail.less') : t('blockletDetail.more')}
        </TextButton>
      )}
    </Box>
  );
}
