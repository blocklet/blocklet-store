import { Image } from '@blocklet/list';
import { joinURL } from 'ufo';
import { getUrlPrefix } from '../../libs/util';

function LaunchLogo({ ...props }) {
  const { prefix } = getUrlPrefix();
  // FIXME: @zhanghan 这个静态资源如果替换了也会存在缓存问题？
  const logoUrl = joinURL(prefix, '/images/blocklet-launcher.svg');
  return <Image src={logoUrl} alt="launch" width={24} height={24} {...props} />;
}

export default LaunchLogo;
