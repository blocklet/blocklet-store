import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import styled from '@emotion/styled';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Semver from 'semver';

import Button from '@arcblock/ux/lib/Button';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { joinURL, withQuery } from 'ufo';

import { lazyApi } from '../../../libs/api';
import ShowTime from '../../show-time';
import CustomHtml from './custom-html';

function BlockletVersionList() {
  const { did, version } = useParams();
  const { t } = useLocaleContext();
  const [extend, setExtend] = useState(false);

  async function getBlockletVersion() {
    const { data: versionData } = await lazyApi.get(
      withQuery(joinURL('api', 'blocklets', did, 'versions'), { version })
    );
    return versionData;
  }

  const { data = [], loading } = useRequest(getBlockletVersion);

  const sortedData = useMemo(() => {
    if (data.length >= 20) {
      setExtend(true);
    }
    if (data.length > 0) {
      const sortedVersions = data.sort((a, b) => Semver.compare(b.version, a.version));
      return sortedVersions;
    }
    return [];
  }, [data]);

  const finalData = useMemo(() => {
    if (!extend) {
      return sortedData;
    }
    return sortedData.slice(0, 20);
  }, [sortedData, extend]);

  const loadMore = () => {
    setExtend(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Div>
      <Timeline>
        {finalData.map((item) => (
          <TimelineItem key={item.version}>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography gutterBottom color="textSecondary">
                <ShowTime date={item.createdAt} />
              </Typography>
              <Paper elevation={0}>
                <Typography variant="h6" component="h2">
                  {item.version}
                </Typography>
                <CustomHtml html={item.changeLog} />
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
        {extend ? (
          <div className="load-more">
            <Button onClick={loadMore}> {t('blockletDetail.loadMoreVersion')}</Button>
          </div>
        ) : (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
            </TimelineSeparator>
          </TimelineItem>
        )}
      </Timeline>
    </Div>
  );
}

BlockletVersionList.propTypes = {};
export default BlockletVersionList;

const Div = styled.div`
  .MuiTimelineContent-root {
    flex: 3;
    overflow-x: auto;
  }
  .MuiTimelineItem-missingOppositeContent:before {
    flex: 1;
    display: none;
  }
  .MuiPaper-root {
    padding: 6px 0px;
    overflow-x: auto;
  }
  .load-more {
    margin: 2px 0;
  }
`;
