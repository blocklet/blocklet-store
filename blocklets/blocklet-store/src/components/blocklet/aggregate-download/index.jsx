import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useRequest, useReactive, useSize } from 'ahooks';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import sparkline from './sparkline';
import api from '../../../libs/api';
import { formatNumber, formatToDate } from '../../../libs/util';

function AggregateDownload({ did }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dom, setDom] = useState(null);
  const size = useSize(dom) || {};
  const tooltipState = useReactive({ style: { top: 0, left: 0 }, hidden: true, textContent: '' });
  const {
    data: downloads = [],
    error,
    loading,
  } = useRequest(async () => {
    const { data } = await api.get(`/api/blocklets/${did}/downloads/monthly`);
    return data;
  });

  const sparklineOptions = {
    onmousemove(event, dataPoint) {
      const date = formatToDate(dataPoint.date);
      const left = '80px';
      tooltipState.textContent = `${date}: ${formatNumber(dataPoint.value)}`;
      tooltipState.style.top = '-30px';
      tooltipState.style.left = left;
      tooltipState.hidden = false;
    },

    onmouseout() {
      tooltipState.hidden = true;
    },
  };
  const counts = useMemo(() => {
    const tmp = downloads.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0);
    return formatNumber(tmp);
  }, [downloads]);

  useEffect(() => {
    if (svgRef.current) {
      sparkline(svgRef.current, downloads, sparklineOptions);
    }
    if (!loading) {
      // see: https://github.com/alibaba/hooks/issues/838
      setDom(document.querySelector('.custom-sparkline'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, size]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}>
        <CircularProgress style={{ width: '32px', height: '32px' }} />
      </Box>
    );
  }
  if (error) return null;
  return (
    <StyledContainer>
      <div title={counts} className="download-count" data-cy="blocklet-download-count">
        {counts}
      </div>
      <div className="custom-sparkline">
        <svg ref={svgRef} className="sparkline" width={size.width || 100} height={30} strokeWidth="2" />
        <span className="tooltip" ref={tooltipRef} hidden={tooltipState.hidden} style={{ ...tooltipState.style }}>
          {tooltipState.textContent}
        </span>
      </div>
    </StyledContainer>
  );
}

AggregateDownload.propTypes = {
  did: PropTypes.string.isRequired,
};

const StyledContainer = styled.div`
  & {
    display: flex;
    width: 100%;
    align-items: center;
    border-bottom: 2px solid ${(props) => props.theme.palette.primary.main}1A;
  }
  .download-count {
    height: 30px;
    flex: 1;
    font-weight: ${(props) => props.theme.typography.fontWeightLight};
    color: ${(props) => props.theme.palette.grey[700]};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .custom-sparkline {
    flex: 2;
    display: flex;
    position: relative;
    *[hidden] {
      display: none;
    }
  }
  .sparkline {
    stroke: ${(props) => props.theme.palette.primary.main};
    fill: ${(props) => props.theme.palette.primary.main}1A;
  }
  .tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 2px 5px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 9999;
  }
  .sparkline--cursor {
    stroke: orange;
  }

  .sparkline--spot {
    fill: red;
    stroke: red;
  }
`;

export default AggregateDownload;
