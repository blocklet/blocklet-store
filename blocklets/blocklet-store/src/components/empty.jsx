import { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

function Empty({ children = '' }) {
  const { t } = useContext(LocaleContext);

  return <StyledEmpty>{children || t('common.empty')}</StyledEmpty>;
}

Empty.propTypes = {
  children: PropTypes.any,
};

const StyledEmpty = styled.div`
  display: inline-block;
  width: 100%;
  text-align: center;
  padding: 30px 20px;
`;

export default Empty;
