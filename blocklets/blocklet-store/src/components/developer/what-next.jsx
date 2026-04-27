import CodeBlock from '@arcblock/ux/lib/CodeBlock';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { OpenInNew } from 'mdi-material-ui';
import PropTypes from 'prop-types';

function NoneBlocklet({ name, did }) {
  const { t, locale } = useLocaleContext();
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          fontSize: '16px',
          marginBottom: '16px',
          marginTop: '10px',
        }}>
        <Box>{t('blocklet.createBlockletTipStart')}</Box>
        <Box
          sx={{
            padding: '2px',
            margin: '0 2px',
            color: 'error.main',
            bgcolor: 'grey.100',
          }}>
          @blocklet/cli
        </Box>
        <Box>{t('blocklet.createBlockletTipPart1')}</Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          fontSize: '16px',
          marginTop: '10px',
        }}>
        <Box>{t('common.install')}</Box>
        <Box
          sx={{
            padding: '2px',
            margin: '0 2px',
            color: 'error.main',
            bgcolor: 'grey.100',
          }}>
          @blocklet/cli
        </Box>
      </Box>
      <CodeBlock language="shell">npm install -g @blocklet/cli</CodeBlock>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
        {t('blocklet.createBlockletTipStart')}
        <Box
          sx={{
            padding: '2px',
            margin: '0 2px',
            color: 'error.main',
            bgcolor: 'grey.100',
          }}>
          create-blocklet
        </Box>
        {t('blocklet.createBlockletTipPart2')}
      </Box>
      <CodeBlock language="shell">{`blocklet create ${name} --did=${did}`}</CodeBlock>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 0.5,
        }}>
        <Typography variant="subtitle1" component="span">
          Learn more:
        </Typography>
        <LinkText link={`https://www.arcblock.io/docs/blocklet-developer/${locale}/blocklet-cli`}>
          Blocklet CLI
        </LinkText>
      </Box>
    </>
  );
}
function ExistBlocklet() {
  const { t, locale } = useLocaleContext();
  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('blocklet.uploadTip')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 0.5,
        }}>
        <Typography variant="subtitle1" component="span">
          1.
        </Typography>
        <LinkText link={`https://www.arcblock.io/docs/blocklet-developer/${locale}/bundle-your-blocklet`}>
          Bundle Blocklet
        </LinkText>
        <Typography variant="subtitle1" component="span">
          2.
        </Typography>
        <LinkText link={`https://www.arcblock.io/docs/blocklet-developer/${locale}/publish-your-blocklet-to-the-world`}>
          Upload Blocklet
        </LinkText>
      </Box>
    </>
  );
}

function LinkText({ children, link }) {
  return (
    <Link
      href={link}
      target="_blank"
      underline="hover"
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}>
      <Typography
        variant="subtitle1"
        component="span"
        sx={{
          mr: 1,
        }}>
        {children}
      </Typography>
      <SvgIcon component={OpenInNew} />
    </Link>
  );
}

LinkText.propTypes = {
  children: PropTypes.node.isRequired,
  link: PropTypes.string.isRequired,
};

NoneBlocklet.propTypes = {
  name: PropTypes.string.isRequired,
  did: PropTypes.string.isRequired,
};
export { ExistBlocklet, NoneBlocklet };
