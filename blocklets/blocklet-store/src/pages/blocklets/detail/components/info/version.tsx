import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate, useParams } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import CustomHtml from '../../../../../components/blocklet/version-list/custom-html';
import { formatToDatetime, getUrlPrefix } from '../../../../../libs/util';
import { TABS } from '../../constant';
import SubSection from '../sub-section';
import { IVersion } from '../../../../../type';

export default function Version({
  version = undefined,
  specificVersion = '',
}: {
  version?: IVersion;
  specificVersion?: string;
}) {
  const { t, locale } = useLocaleContext();
  const navigate = useNavigate();
  const { did } = useParams();
  const { prefix } = getUrlPrefix();

  dayjs.locale(locale === 'zh' ? 'zh-cn' : locale);
  dayjs.extend(LocalizedFormat);
  dayjs.extend(relativeTime);

  return (
    <SubSection
      collapsible
      title={t('blockletDetail.whatNew')}
      editText={t('blockletDetail.viewHistory')}
      onEdit={() => navigate(withQuery(joinURL(prefix, 'blocklets', did!, specificVersion), { tab: TABS.VERSION }))}>
      <Typography
        variant="body1"
        title={version?.createdAt ? formatToDatetime(new Date(version.createdAt)) : ''}
        sx={{
          fontWeight: 'fontWeightMedium',
        }}>
        {version ? `Version ${version.version} (${dayjs(version.createdAt).format('MMMM YYYY')})` : '--'}
      </Typography>
      <CustomHtml html={version?.changeLog} />
    </SubSection>
  );
}
