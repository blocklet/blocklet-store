import Button from '@arcblock/ux/lib/Button';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSessionContext } from '../../../../../contexts/session';
import { IBlockletMeta } from '../../../../../type';
import { Comments } from '../../../../../components/comments';

const placeholderSx = {
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  color: 'text.hint',
};
export default function BlockletComment({ meta }: { meta: IBlockletMeta }) {
  const { t } = useLocaleContext();
  const { session } = useSessionContext();

  const ref = useRef<HTMLDivElement>(null);
  const [hasComments, setHasComments] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const observer = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setHasComments(height >= (session.user ? 270 : 120));
    });

    if (el) {
      observer.observe(el);
    }
    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, [session.user]);

  return (
    <>
      {session.user ? null : (
        <Typography sx={placeholderSx}>
          {hasComments ? t('blockletDetail.loginToWriteReview') : t('blockletDetail.noComments')}
          <Button variant="outlined" size="small" onClick={() => session.login()}>
            {t('blockletDetail.login')}
          </Button>
        </Typography>
      )}
      <Box ref={ref}>
        <Comments
          flatView
          displayReaction={false}
          target={{
            id: meta.did,
            title: meta.title,
            desc: meta.description,
          }}
        />
      </Box>
      {!session.user || hasComments ? null : (
        <Typography sx={placeholderSx}>{t('blockletDetail.noComments')}</Typography>
      )}
    </>
  );
}
