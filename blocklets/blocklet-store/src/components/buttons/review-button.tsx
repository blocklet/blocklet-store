import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import ExternalLink from '@iconify-icons/tabler/external-link';
import X from '@iconify-icons/tabler/x';
import { Icon } from '@iconify/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  ButtonProps,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useRequest } from 'ahooks';
import { Suspense, useMemo, useRef, useState } from 'react';
import { joinURL, withQuery } from 'ufo';
import { DISCUSS_KIT_DID, EReviewType, EVersionStatus } from '../../constants';
import { lazyApi } from '../../libs/api';
import { getCurrentBlockletStatus } from '../../libs/utils';
import { IBlocklet, IBlockletButton, IVersion } from '../../type';
import ReviewStatus from '../blocklet/review-status';
import { CheckButton } from '../check-group';
import SafeButton from '../safe-button';
import useUser from '../../hooks/user';
import { Comments } from '../comments';

const getDiscussPageLink = (id: string) => {
  const baseUrl = window.blocklet?.appUrl || new URL(window.location.href).origin;
  const discussKitPath =
    window.blocklet?.componentMountPoints?.find((item) => item.did === DISCUSS_KIT_DID)?.mountPoint || 'discuss-kit';
  const discussPageLink = joinURL(baseUrl, discussKitPath, 'discussions', id);

  return discussPageLink;
};

export default function ReviewButton({ ref, blocklet, onSuccess, ...rest }: IBlockletButton) {
  const { t } = useLocaleContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const submitFn = useRef(async () => {});
  const submitType = useRef<EVersionStatus.APPROVED | EVersionStatus.REJECTED | null>(null);

  const { needReview } = getCurrentBlockletStatus(blocklet);

  const { hasAdmin, hasOwner } = useUser();
  const isAdmin = hasAdmin || hasOwner;

  const specifiedVersion = blocklet.specifiedVersion!;

  const showApproveButtons = isAdmin && needReview && specifiedVersion.status === EVersionStatus.IN_REVIEW;

  const text = showApproveButtons ? t('button.replyReview') : t('blocklet.reviewCommentTitle');

  return (
    <>
      <SafeButton {...rest} ref={ref} onClick={() => setOpenDrawer(true)}>
        {text}
      </SafeButton>
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: { xs: '100vw', md: 800 },
          }}>
          <Box
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
            <Typography variant="h6">
              {blocklet.meta.title}(v{specifiedVersion.version}) - {t('blocklet.reviewCommentTitle')}
            </Typography>
            <ReviewStatus status={specifiedVersion.status} version={specifiedVersion.version} />
            <Box
              sx={{
                flex: 1,
              }}
            />
            <IconButton onClick={() => setOpenDrawer(false)}>
              <Icon icon={X} />
            </IconButton>
          </Box>
          <Box
            sx={{
              px: 2,
              pb: 2,
              flex: 1,
              overflow: 'auto',
            }}>
            <Suspense fallback={<CircularProgress />}>
              <Comments
                target={{ id: specifiedVersion.id }}
                displayReaction={false}
                autoLoadComments
                showTopbar={false}
                order="asc"
                sendComment={({ content }) =>
                  lazyApi.post(`/api/blocklets/${blocklet.did}/comment/${specifiedVersion.version}`, {
                    content,
                  })
                }
                commentInputPosition="bottom"
                renderInnerFooter={({ content, submit, loading }) => {
                  const disabled = loading || !content;
                  return (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        p: 1,
                      }}>
                      {showApproveButtons && (
                        <>
                          <SafeButton
                            disabled={disabled}
                            color="error"
                            onClick={() => {
                              submitType.current = EVersionStatus.REJECTED;
                              submitFn.current = submit;
                              setOpenRejectDialog(true);
                            }}>
                            {t('button.rejectReview')}
                          </SafeButton>
                          <SafeButton
                            disabled={disabled}
                            color="success"
                            onClick={() => {
                              submitType.current = EVersionStatus.APPROVED;
                              submitFn.current = submit;
                              setOpenApproveDialog(true);
                            }}>
                            {t('button.approveReview')}
                          </SafeButton>
                        </>
                      )}
                      <SafeButton
                        disabled={disabled}
                        onClick={async () => {
                          submitType.current = null;
                          await submit();
                        }}>
                        {t('button.commentReview')}
                      </SafeButton>
                    </Box>
                  );
                }}
              />
              <VersionHistory blocklet={blocklet} version={specifiedVersion.version} />
            </Suspense>
          </Box>
        </Box>
        <ApproveDialog
          blocklet={blocklet}
          openApproveDialog={openApproveDialog}
          setOpenApproveDialog={setOpenApproveDialog}
          submitFn={submitFn.current}
          onSuccess={onSuccess}
        />
        <RejectDialog
          blocklet={blocklet}
          openRejectDialog={openRejectDialog}
          setOpenRejectDialog={setOpenRejectDialog}
          submitFn={submitFn.current}
          onSuccess={onSuccess}
        />
      </Drawer>
    </>
  );
}

function VersionHistory({ blocklet, version }: { blocklet: IBlocklet; version: string }) {
  const { did } = blocklet;

  const { data = [], loading } = useRequest<IVersion[], []>(
    async () => {
      const { data: versionData = [] } = await lazyApi.get(
        withQuery(joinURL('api', 'blocklets', did, 'versions'), { version })
      );
      return versionData.reverse().slice(1, 20);
    },
    { cacheKey: `${did}-version-history-${version}`, staleTime: 1000 * 60 * 5 }
  );

  return (
    <Box
      sx={{
        mt: 2,
      }}>
      {loading
        ? null
        : data.map((item, index) => <VersionHistoryItem key={item.id} item={item} isFirst={index === 0} />)}
    </Box>
  );
}

function VersionHistoryItem({ item, isFirst }: { item: IVersion; isFirst: boolean }) {
  const { status, version } = item;

  const [open, setOpen] = useState(isFirst);
  const { t } = useLocaleContext();

  const hasLoaded = useRef(false);
  if (!hasLoaded.current && open) {
    hasLoaded.current = true;
  }

  return (
    <Accordion key={item.id} disableGutters expanded={open} onChange={(_, newExpanded) => setOpen(newExpanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          variant="body1"
          sx={{
            mr: 1,
          }}>
          {version}
        </Typography>
        {status === EVersionStatus.PUBLISHED ? (
          <Chip
            variant="outlined"
            label={t('blocklet.published')}
            size="small"
            sx={{ color: '#9138AD', borderColor: '#9138AD', opacity: 0.2 }}
          />
        ) : (
          <ReviewStatus variant="outlined" status={status} version={version} />
        )}
      </AccordionSummary>
      <AccordionDetails>
        {hasLoaded.current ? (
          <Suspense key={item.id} fallback={<CircularProgress />}>
            <Comments
              target={{ id: item.id }}
              autoLoadComments
              flatView
              disabledSend
              displayReaction={false}
              showTopbar={false}
              interactive={false}
              order="desc"
              renderComments={({ comments, renderComment }) => {
                if (comments.length === 0) {
                  return <Typography>{t('blocklet.noReview')}</Typography>;
                }
                return (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                      }}>
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDiscussPageLink(item.id), '_blank');
                        }}
                        sx={{ right: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.hint',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}>
                          {t('button.viewInDiscuss')}
                          <Icon icon={ExternalLink} />
                        </Typography>
                      </Button>
                    </Box>
                    {comments.map((comment) => (
                      <Box key={comment.id}>{renderComment(comment, {})}</Box>
                    ))}
                  </>
                );
              }}
            />
          </Suspense>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
}

function ApproveDialog({
  ...props
}: ButtonProps & {
  blocklet: IBlocklet;
  openApproveDialog: boolean;
  setOpenApproveDialog: (open: boolean) => void;
  submitFn: () => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
}) {
  const { blocklet, openApproveDialog, setOpenApproveDialog, submitFn, onSuccess } = props;
  const { t, locale } = useLocaleContext();
  const [category, setCategory] = useState<{ label: string; value: string } | null>(
    blocklet.meta.category?.id
      ? {
          label: blocklet.meta.category.locales[locale] || blocklet.meta.category.locales.en,
          value: blocklet.meta.category.id,
        }
      : null
  );
  const [reviewType, setReviewType] = useState(blocklet.reviewType || EReviewType.EACH);

  const { data: categories } = useRequest(() => lazyApi.get('/api/blocklets/categories').then((res) => res.data), {
    cacheKey: 'categories',
    cacheTime: 1000 * 60 * 5,
  });

  const options = useMemo(() => {
    return (
      categories
        ?.filter((item) => item.locales.en !== 'All')
        .map((item) => ({
          label: item.locales[locale] || item.locales.en,
          value: item.id,
        })) || []
    );
  }, [categories, locale]);

  return (
    <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
      <DialogTitle>{t('button.approveReview')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ cursor: 'default', mb: 1, fontWeight: 500 }}>Blocklet {t('common.category')}</Typography>
        <Autocomplete
          size="small"
          options={options}
          sx={{ width: 400 }}
          value={category}
          clearIcon={null}
          onChange={(_, value) => setCategory(value)}
          renderInput={(params) => <TextField {...params} placeholder={t('common.pleaseSelect')} />}
        />
        <Typography sx={{ cursor: 'default', mt: 2, mb: 0.5, fontWeight: 500 }}>
          Blocklet {t('blocklet.reviewType')}
        </Typography>
        <CheckButton
          fontSize={15}
          isRadio
          sx={{ display: 'block', width: 'fit-content' }}
          label={t('blocklet.reviewFirstVersion')}
          checked={reviewType === EReviewType.FIRST}
          onChange={() => setReviewType(EReviewType.FIRST)}
        />
        <CheckButton
          fontSize={15}
          isRadio
          sx={{ display: 'block', width: 'fit-content' }}
          label={t('blocklet.reviewEveryVersion')}
          checked={reviewType === EReviewType.EACH}
          onChange={() => setReviewType(EReviewType.EACH)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <SafeButton variant="outlined" onClick={() => setOpenApproveDialog(false)} autoFocus>
          {t('common.cancel')}
        </SafeButton>
        <SafeButton
          color="success"
          disabled={!category}
          onClick={async () => {
            try {
              await lazyApi.put(`/api/console/blocklets/${blocklet.did}/review`, {
                version: blocklet.specifiedVersion!.version,
                action: EVersionStatus.APPROVED,
                category: category!.value,
                reviewType,
              });
              await submitFn();
              setOpenApproveDialog(false);
            } catch (err: any) {
              const { error } = err.response?.data ?? { error: err };
              Toast.error(error);
            } finally {
              onSuccess?.();
            }
          }}>
          {t('button.approveReview')}
        </SafeButton>
      </DialogActions>
    </Dialog>
  );
}

function RejectDialog({
  ...props
}: ButtonProps & {
  blocklet: IBlocklet;
  openRejectDialog: boolean;
  setOpenRejectDialog: (open: boolean) => void;
  submitFn: () => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
}) {
  const { t } = useLocaleContext();
  const { blocklet, openRejectDialog, setOpenRejectDialog, submitFn, onSuccess } = props;

  return (
    <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
      <DialogTitle>{t('button.rejectReview')}</DialogTitle>
      <DialogContent>
        <Typography>{t('blocklet.rejectDescription')}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <SafeButton variant="outlined" onClick={() => setOpenRejectDialog(false)} autoFocus>
          {t('common.cancel')}
        </SafeButton>
        <SafeButton
          color="error"
          onClick={async () => {
            try {
              await lazyApi.put(`/api/console/blocklets/${blocklet.did}/review`, {
                version: blocklet.specifiedVersion!.version,
                action: EVersionStatus.REJECTED,
              });
              await submitFn();
              setOpenRejectDialog(false);
            } catch (err: any) {
              const { error } = err.response?.data ?? { error: err };
              Toast.error(error);
            } finally {
              onSuccess?.();
            }
          }}>
          {t('button.rejectReview')}
        </SafeButton>
      </DialogActions>
    </Dialog>
  );
}
