import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { useTheme } from '@mui/material';
import MarkdownPreview from '@uiw/react-markdown-preview';
import DOMPurify from 'dompurify';
import SectionWrapper from '../section-wrapper';

export default function Readme({ readme }: { readme: { en: string; zh: string } }) {
  const { locale } = useLocaleContext();
  const theme = useTheme();

  return (
    <SectionWrapper
      py={2}
      sx={{
        '&& .wmde-markdown h1': { ...theme.typography.h3, border: 'none' },
        '&& .wmde-markdown h2': { ...theme.typography.h3, border: 'none' },
      }}>
      <MarkdownPreview
        source={DOMPurify.sanitize(readme[locale] || readme.en)}
        wrapperElement={{
          'data-color-mode': theme.palette.mode,
        }}
      />
    </SectionWrapper>
  );
}
