import Img, { ImgProps } from '@arcblock/ux/lib/Img';
import { joinURL } from 'ufo';
import { getUrlPrefix } from '../libs/util';

function PlayIcon(props: Omit<ImgProps, 'src'>) {
  const { prefix } = getUrlPrefix();
  const logoUrl = joinURL(prefix, '/images/play-icon.svg');
  return <Img alt="launch" width={48} height={48} {...props} src={logoUrl} />;
}

export default PlayIcon;
