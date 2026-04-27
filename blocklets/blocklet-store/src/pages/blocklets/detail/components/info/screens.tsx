import { getEmbedUrl, getVideoCoverUrl } from '@blocklet/images/lib/video';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, IconButton, Skeleton } from '@mui/material';
import { useMemo, useState } from 'react';
import ImageGallery from 'react-image-gallery';
import { joinURL, withQuery } from 'ufo';
import PlayIcon from '../../../../../components/play-icon';
import { formatScreenshotPath } from '../../../../../libs/util';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '../../constant';
import HorizontalContainer from '../horizontal-container';
import { IBlocklet } from '../../../../../type';
import { getCurrentBlockletStatus } from '../../../../../libs/utils';

import 'react-image-gallery/styles/css/image-gallery.css';

const ASPECT_RATIO = 16 / 9;

export default function Screens({ blocklet }: { blocklet: IBlocklet }) {
  const { meta } = blocklet;
  const prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { useDraftSrc, useReviewSrc } = getCurrentBlockletStatus(blocklet);

  const photos = useMemo(
    () =>
      (meta.videos || [])
        .map((x) => ({
          thumbnail: getVideoCoverUrl(x),
          original: getEmbedUrl(x),
        }))
        .concat(
          (meta.screenshots || []).map((x) => ({
            thumbnail: prefix + formatScreenshotPath({ did: meta.did, asset: x, size: 600, useDraftSrc, useReviewSrc }),
            original: prefix + formatScreenshotPath({ did: meta.did, asset: x, size: 1920, useDraftSrc, useReviewSrc }),
          }))
        ),
    [meta.did, prefix, meta.screenshots, meta.videos, useDraftSrc, useReviewSrc]
  );

  return (
    <HorizontalContainer offset={IMAGE_WIDTH}>
      {photos.map((photo, index) => (
        <Box
          key={photo.original}
          sx={{
            position: 'relative',
            minWidth: { xs: '100%', md: IMAGE_WIDTH },
          }}>
          <Box
            component="img"
            alt="screenshot"
            src={photo.thumbnail}
            onFocus={(e) => {
              // @ts-ignore
              e.target.src = withQuery(joinURL(prefix, 'images/blocklet.png'), { v: window.blocklet?.version });
            }}
            onClick={() => {
              setOpen(true);
              setSelectedIndex(index);
            }}
            sx={{
              width: { xs: '100%', md: IMAGE_WIDTH },
              height: { xs: 'auto', sm: IMAGE_HEIGHT },
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              objectFit: 'cover',
              cursor: 'pointer',
              aspectRatio: ASPECT_RATIO,
            }}
          />
          {isVideoUrl(photo.original) && (
            <PlayIcon
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
                setSelectedIndex(index);
              }}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
              }}
            />
          )}
        </Box>
      ))}
      <Dialog
        fullScreen
        open={open}
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            justifyContent: 'center',
          },
        }}
        onClose={handleClose}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
            color: 'white',
          }}>
          <CloseIcon sx={{ width: 40, height: 40 }} />
        </IconButton>
        <ImageGallery
          lazyLoad
          showNav
          startIndex={selectedIndex}
          showPlayButton={false}
          showFullscreenButton={false}
          showBullets
          items={photos.map((x, index) => ({
            original: x.original,
            renderItem: () => (
              <ImageItem key={x.original} src={x.original} onClick={handleClose} autoPlay={selectedIndex === index} />
            ),
          }))}
        />
      </Dialog>
    </HorizontalContainer>
  );

  function handleClose() {
    setOpen(false);
    setSelectedIndex(0);
  }
}

function ImageItem({ src, onClick, autoPlay }: { src: string; onClick: () => void; autoPlay: boolean }) {
  const [loading, setLoading] = useState(true);
  if (src.includes('youtube.com') || src.includes('vimeo.com')) {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100vh',
          position: 'relative',
        }}>
        <iframe
          src={`${src}${autoPlay ? '?autoplay=1' : ''}`}
          width="90%"
          height="90%"
          title="video"
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </Box>
    );
  }
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
        position: 'relative',
      }}>
      {loading && <Skeleton variant="rounded" width="80vw" height="80vh" />}
      <Box
        component="img"
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        sx={{
          display: loading ? 'none' : 'block',
          width: 'auto',
          height: 'auto',
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
      />
    </Box>
  );
}

function isVideoUrl(url) {
  return url.includes('youtube.com') || url.includes('vimeo.com');
}
