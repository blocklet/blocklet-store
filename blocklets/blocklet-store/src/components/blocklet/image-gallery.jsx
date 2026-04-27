import { css } from '@emotion/react';
import Grid from '@mui/material/Grid';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import ImageGallery from 'react-image-gallery';
import Lightbox from 'react-image-lightbox';
import { useParams } from 'react-router-dom';

import { formatScreenshotPath } from '../../libs/util';

import 'react-image-gallery/styles/css/image-gallery.css';
import 'react-image-lightbox/style.css';

const cssMap = {
  imageGallery: (theme) => css`
    padding: 20px 0;
    margin-bottom: 16px;
    @media (max-width: ${theme.breakpoints.values.sm}px) {
      & {
        padding: 0;
      }
    }
    background-color: ${theme.palette.grey[50]};
    .image-gallery-svg {
      height: 60px !important;
      width: 30px !important;
    }
    .image-gallery-icon {
      color: ${theme.palette.grey[500]};
      filter: inherit;
      &:hover {
        color: ${theme.palette.primary.main};
      }
    }
    .image-gallery-bullets {
      .image-gallery-bullet {
        box-shadow: inherit;
        border: 1px solid ${theme.palette.grey[500]};
        &:hover {
          background-color: ${theme.palette.primary.main};
          border: 1px solid ${theme.palette.primary.main};
        }
        &.active {
          background-color: ${theme.palette.primary.main};
          border: 1px solid ${theme.palette.primary.main};
        }
        &.active:hover {
          background-color: ${theme.palette.primary.main};
        }
      }
    }
    .image-gallery-image {
      cursor: pointer;
    }
  `,
};

function BlockletImageGallery({ screenshots }) {
  const { did } = useParams();
  const lightBoxState = useReactive({ photoIndex: 0, isOpen: false });
  const imageGalleryState = useReactive({ imageGalleryIndex: 0 });
  const { isOpen, photoIndex } = lightBoxState;
  const { imageGalleryIndex } = imageGalleryState;

  const prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';

  const photos = useMemo(
    () =>
      screenshots.map((x) => ({
        thumbnail: prefix + formatScreenshotPath({ did, asset: x, size: 1600 }),
        original: prefix + formatScreenshotPath({ did, asset: x, size: 1600 }),
      })),
    [did, prefix, screenshots]
  );

  const handleClick = () => {
    lightBoxState.isOpen = true;
  };
  const handleSlide = (index) => {
    imageGalleryState.imageGalleryIndex = index;
    lightBoxState.photoIndex = index;
  };

  return (
    <>
      {screenshots.length > 0 && (
        <Grid
          css={cssMap.imageGallery}
          size={{
            xs: 12,
            md: 12,
          }}>
          <ImageGallery
            lazyLoad
            showNav
            showPlayButton={false}
            showFullscreenButton={false}
            showBullets
            onClick={handleClick}
            onSlide={handleSlide}
            items={photos.map((x) => ({
              original: x.thumbnail,
              originalHeight: '400px',
              originalWidth: '640px',
            }))}
          />
        </Grid>
      )}
      {isOpen && (
        <Lightbox
          enableZoom={false}
          mainSrc={photos[photoIndex].original}
          nextSrc={photos[(photoIndex + 1) % photos.length].original}
          prevSrc={photos[(photoIndex + photos.length - 1) % photos.length].original}
          onCloseRequest={() => {
            lightBoxState.isOpen = false;
            lightBoxState.photoIndex = imageGalleryIndex;
          }}
          onMovePrevRequest={() => {
            lightBoxState.photoIndex = (photoIndex + photos.length - 1) % photos.length;
          }}
          onMoveNextRequest={() => {
            lightBoxState.photoIndex = (photoIndex + 1) % photos.length;
          }}
        />
      )}
    </>
  );
}

export default BlockletImageGallery;

BlockletImageGallery.propTypes = {
  screenshots: PropTypes.array.isRequired,
};
