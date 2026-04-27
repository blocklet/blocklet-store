import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import Tooltip from '@mui/material/Tooltip';
import { useUnmountedRef } from 'ahooks';
import copy from 'copy-to-clipboard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import ArrowIcon from './arrow-icon';
import AddComponentInfo from './show-component-price';

function AddComponent({ value }) {
  const [copied, setCopied] = useState(false);
  const unmountRef = useUnmountedRef();
  const { t } = useLocaleContext();

  const onCopy = (e) => {
    e.stopPropagation();
    copy(value);
    setCopied(true);
    // 恢复 copied 状态
    setTimeout(() => {
      if (!unmountRef.current) {
        setCopied(false);
      }
    }, 1500);
  };

  return (
    <Tooltip title={t('blockletDetail.addComponent.copied')} placement="bottom" arrow open={copied}>
      <StyledContainer>
        <ArrowIcon className="add-component__arrow" />
        <span className="code" onClick={onCopy} title={t('blockletDetail.addComponent.tips')}>
          {value}
        </span>
        <StyledCopy title={copied ? '' : t('blockletDetail.addComponent.copy')}>
          {copied ? (
            <CheckIcon fontSize="small" color="primary" />
          ) : (
            <ContentCopyIcon className="add-component__copy" fontSize="small" onClick={onCopy} />
          )}
        </StyledCopy>
      </StyledContainer>
    </Tooltip>
  );
}
const StyledContainer = styled.div`
  & {
    display: flex;
    position: relative;
    color: ${(props) => props.theme.palette.grey[700]};
    margin-top: 5px;
    border: 1px #cccccc solid;
    padding: 10px 24px;
    user-select: none;
  }

  &:hover {
    background-color: #ebfeff;
    .add-component__copy {
      opacity: 0.5;
    }
  }

  .add-component__arrow {
    position: absolute;
    top: 12px;
    left: 8px;
    opacity: 0.5;
    width: 1em;
    height: 1em;
    font-size: 1.25rem;
  }
  .code {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
  }
`;
const StyledCopy = styled.span`
  & {
    width: 1em;
    height: 1em;
    margin-left: 8px;
    position: absolute;
    right: 4px;
    top: 12px;
  }
  .add-component__copy {
    flex: 0 0 auto;
    width: auto;
    height: 1rem;
    opacity: 0;
    color: ${(props) => props.theme.palette.grey[700]};
    transition: opacity 0.2s linear;
    cursor: pointer;
  }
`;
AddComponent.propTypes = {
  value: PropTypes.string.isRequired,
};

export default AddComponent;
export { AddComponentInfo };
