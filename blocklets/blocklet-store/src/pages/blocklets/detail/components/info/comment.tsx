import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Close from '@mui/icons-material/Close';
import { Box, Dialog, DialogContent, DialogTitle, Typography, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import { useSessionContext } from '../../../../../contexts/session';
import { getUrlPrefix } from '../../../../../libs/util';
import { TABS } from '../../constant';
import TextButton from '../text-button';
import SubSection from '../sub-section';
import { IBlockletMeta } from '../../../../../type';
import { Comments } from '../../../../../components/comments';

export default function Comment({ meta, specificVersion = '' }: { meta: IBlockletMeta; specificVersion?: string }) {
  const { t } = useLocaleContext();
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { prefix } = getUrlPrefix();
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const [hasComments, setHasComments] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const observer = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setHasComments(height >= 120);
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
    <SubSection
      title={t('blocklet.comments')}
      onEdit={() => {
        if (session.user) {
          setOpen(true);
        } else {
          session.login((__unused1, __unused2, result) => handleConnected(result));
        }
      }}
      editText={t('blockletDetail.writeReview')}>
      <Dialog fullWidth fullScreen={isDownMd} open={open}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('blockletDetail.writeReviewFor', { name: meta.title })}
          <Close onClick={() => setOpen(false)} sx={{ cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent sx={{ '& .comment-list': { display: 'none' } }}>
          <Comments
            displayReaction={false}
            autoLoadComments={false}
            showTopbar={false}
            displayConnectButton={false}
            interactive
            onChange={() => setOpen(false)}
            commentInputPosition="top"
            target={{
              id: meta.did,
              title: meta.title,
              desc: meta.description,
              owner: meta.owner.did,
            }}
          />
        </DialogContent>
      </Dialog>
      <Box
        ref={ref}
        sx={{
          '& .comment-list > div': { display: 'none' },
          '& .comment-list > div:first-child': { display: 'block' },
          '& .comment-list > div:nth-child(2)': { display: 'block' },
          '& .comment-list > div:nth-child(3)': { display: 'block' },
        }}>
        <Comments
          flatView
          showTopbar={false}
          displayReaction={false}
          displayConnectButton={false}
          disabledSend
          interactive={false}
          commentInputPosition="none"
          target={{
            id: meta.did,
            title: meta.title,
            desc: meta.description,
            owner: meta.owner.did,
          }}
        />
        {hasComments ? (
          <TextButton
            onClick={() =>
              navigate(withQuery(joinURL(prefix, 'blocklets', meta.did, specificVersion), { tab: TABS.COMMENTS }))
            }
            sx={{ mt: 2 }}>
            {t('blockletDetail.seeAllReviews')}
          </TextButton>
        ) : (
          <Typography sx={{ color: 'text.secondary' }}>{t('blockletDetail.noComments')}</Typography>
        )}
      </Box>
    </SubSection>
  );

  function handleConnected(result: any) {
    if (result?.user?.approved) {
      setOpen(true);
    }
  }
}
