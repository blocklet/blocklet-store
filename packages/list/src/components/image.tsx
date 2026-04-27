import Img, { ImgProps } from '@arcblock/ux/lib/Img';
import Skeleton from '@mui/material/Skeleton';

export default function Image({ showSkeleton = false, ...props }: ImgProps & { showSkeleton?: boolean }) {
  return showSkeleton ? (
    <Skeleton variant="rectangular" width={props.width} height={props.height} />
  ) : (
    <Img {...props} />
  );
}
