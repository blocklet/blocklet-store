import Avatar from '@arcblock/ux/lib/Avatar';
import { useTheme } from '@arcblock/ux/lib/Theme';
import Download from '@iconify-icons/tabler/cloud-download';
import { Icon } from '@iconify/react';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import ImageGallery from 'react-image-gallery';
import { withQuery } from 'ufo';
import { useListContext } from '../../contexts/list';
import useStoreApi from '../../hooks/use-store-api';
import constant from '../../libs/constant';
import { formatImagePath } from '../../libs/utils';
import IconText from './icon-text';

import 'react-image-gallery/styles/css/image-gallery.css';

const ASPECT_RATIO = 16 / 9;

const BANNER_HEIGHT = 292;
const IMAGE_HEIGHT = 189;
const IMAGE_WIDTH = 336;

export default function Banner() {
  const { t, search } = useListContext();
  const { get } = useStoreApi();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const homeBanner = window.blocklet?.preferences?.homeBanner || [];

  const {
    data: blocklets = [],
    error,
    loading,
  } = useRequest<IBlockletMeta[], any>(async () => {
    const data = await get(
      withQuery(constant.blockletsPath, { didList: homeBanner.map((item) => item.did).join(',') })
    );

    return data?.dataList ? homeBanner.map((item) => data.dataList.find((blocklet) => blocklet.did === item.did)) : [];
  });

  if (error) {
    console.error('Get Banner Blocklets error:', error);
  }

  const navIconSx = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 100,
    cursor: 'pointer',
    color: 'text.hint',
  };

  return !error && homeBanner.length > 0 ? (
    <>
      <Typography
        component="h2"
        variant="h2"
        sx={{
          mt: { xs: 2, md: 0 },
          mb: 3,
        }}>
        {t('explore.title')}
      </Typography>
      <Box
        sx={{
          height: { xs: 'auto', md: BANNER_HEIGHT },
          minHeight: BANNER_HEIGHT,
          position: 'relative',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
        {loading ? (
          <Box
            sx={{
              p: 5,
              display: { md: 'flex' },
              gap: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Skeleton variant="rounded" height={IMAGE_HEIGHT} width={IMAGE_WIDTH} />
            <Box
              sx={{
                flex: 1,
                height: '100%',
              }}>
              <Skeleton variant="text" height={50} width={100} />
              <Skeleton variant="text" height={40} width="100%" />
              <Skeleton variant="text" height={40} width={300} />
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  my: 2,
                }}>
                <Skeleton variant="circular" height={20} width={20} />
                <Skeleton variant="text" height={20} width={50} />
              </Box>
              <Skeleton variant="rounded" height={30} width={100} />
            </Box>
          </Box>
        ) : (
          <ImageGallery
            showNav
            autoPlay
            slideDuration={isMobile ? 500 : 1000}
            slideInterval={5000}
            showPlayButton={false}
            showIndex={false}
            showBullets={false}
            showThumbnails={false}
            showFullscreenButton={false}
            renderLeftNav={(onClick) => (
              <Box onClick={onClick} sx={{ display: { xs: 'none', md: 'block' } }}>
                <ChevronLeft sx={{ ...navIconSx, left: 5 }} />
              </Box>
            )}
            renderRightNav={(onClick) => (
              <Box onClick={onClick} sx={{ display: { xs: 'none', md: 'block' } }}>
                <ChevronRight sx={{ ...navIconSx, right: 5 }} />
              </Box>
            )}
            items={homeBanner.map((item, index) => ({
              original: item.did,
              renderItem: () => {
                const blocklet = blocklets[index] || {};
                const src = item.cover || getScreenLink(item.did, blocklet.screenshots?.[0]);
                const imgSrc = formatImagePath(src, theme.breakpoints.values.md * 2);
                return (
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    onClick={() => search.handleSearchSelect(blocklet)}
                    sx={{
                      height: { xs: 'auto', md: BANNER_HEIGHT },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: { xs: 'flex-start', md: 'center' },
                      p: { xs: 2, md: 5 },
                      gap: { xs: 2, md: 5 },
                      cursor: 'pointer',

                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url("${imgSrc}")`,
                        backgroundSize: 'cover',
                        filter: 'blur(50px)',
                        opacity: 0.15,
                        zIndex: 0,
                      },
                    }}>
                    {renderImage(imgSrc)}
                    <Stack
                      sx={{
                        flex: 1,
                        height: '100%',
                        gap: 3,
                      }}>
                      <Box
                        sx={{
                          flex: 1,
                        }}>
                        {renderTitle(item.name || blocklet.title || item.name)}
                        {renderDescription(item.desc || blocklet.description)}
                      </Box>
                      {blocklet.did && renderSummary(blocklet, item.baseNum)}
                      {renderDetailButton(blocklet)}
                    </Stack>
                  </Stack>
                );
              },
            }))}
          />
        )}
      </Box>
    </>
  ) : null;

  function renderImage(url: string) {
    return (
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          width: { xs: '100%', md: IMAGE_WIDTH },
        }}>
        <Image url={url} />
      </Box>
    );
  }

  function renderTitle(title: string) {
    return (
      <Typography
        variant="h2"
        sx={{
          width: '100%',
        }}>
        {title}
      </Typography>
    );
  }

  function renderDescription(description: string) {
    return (
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          textAlign: 'left',
          width: '100%',
          minHeight: 70,
          maxHeight: 71,
          pt: 1,
          display: '-webkit-box',
          lineClamp: 3,
          WebkitLineClamp: 3,
          textWrap: 'wrap',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
        }}>
        {description}
      </Typography>
    );
  }

  function renderSummary(blocklet: IBlockletMeta, baseDownloads = 0) {
    const { did, owner, stats } = blocklet;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: 'text.secondary',
        }}>
        <IconText icon={<Avatar src={owner.avatar} did={did} size={20} variant="circle" />}>{owner.fullName}</IconText>
        <IconText icon={<Icon icon={Download} />} title={`${stats.downloads + baseDownloads}`}>
          {formatDownloadCount(stats.downloads + baseDownloads)}
        </IconText>
      </Box>
    );
  }

  function renderDetailButton(blocklet: IBlockletMeta) {
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => search.handleSearchSelect(blocklet)}
        sx={{
          width: 'fit-content',
          textTransform: 'none',
          borderRadius: 1,
          borderColor: 'grey.300',
          '&:hover': { borderColor: 'divider' },
        }}>
        {t('explore.viewDetail')}
      </Button>
    );
  }
}

const formatDownloadCount = (n: number) => {
  if (Number.isNaN(n)) {
    return 0;
  }
  if (n < 1000) {
    return n;
  }
  if (n < 1000000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  if (n < 1000000000) {
    return `${(n / 1000000).toFixed(1)}m`;
  }
  return `${(n / 1000000000).toFixed(1)}b`;
};

const getScreenLink = (did: string, key: string) => {
  return did && key ? `/assets/${did}/screenshots/${key}` : '';
};

function Image({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading && (
        <Skeleton
          variant="rectangular"
          sx={{
            width: { xs: '100%', md: IMAGE_WIDTH },
            height: { xs: 'auto', md: IMAGE_HEIGHT },
          }}
        />
      )}
      <Box
        component="img"
        src={url}
        alt=""
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        sx={{
          display: loading ? 'none' : 'block',
          width: { xs: '100%', md: IMAGE_WIDTH },
          height: { xs: 'auto', md: IMAGE_HEIGHT },
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          objectFit: 'container',
          cursor: 'pointer',
          aspectRatio: ASPECT_RATIO,
        }}
      />
    </>
  );
}
