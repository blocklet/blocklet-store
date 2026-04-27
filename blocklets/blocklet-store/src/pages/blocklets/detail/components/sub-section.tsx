import { Box, BoxProps, Button, Typography } from '@mui/material';
import SectionWrapper from './section-wrapper';

export default function SubSection({
  title,
  description = '',
  onEdit = undefined,
  editText = '',
  children,
  titleBottom = 2,
  count = 3,
  collapsible = false,
  ...props
}: {
  title: React.ReactNode;
  description?: string;
  onEdit?: () => void;
  editText?: string;
  titleBottom?: number;
  children: React.ReactNode;
  collapsible?: boolean;
  count?: number;
} & Omit<BoxProps, 'title'>) {
  return (
    <Box
      {...props}
      sx={[
        {
          borderTop: 1,
          borderColor: 'divider',
          py: 3,
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: description ? 0.5 : titleBottom,
        }}>
        {typeof title === 'string' ? <Typography variant="h3">{title}</Typography> : title}
        {count >= 3 && onEdit && (
          <Button variant="text" size="small" onClick={onEdit} sx={{ color: 'primary.main' }}>
            <Typography variant="body1">{editText}</Typography>
          </Button>
        )}
      </Box>
      {description && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: 13,
            mb: titleBottom,
          }}>
          {description}
        </Typography>
      )}
      {collapsible ? <SectionWrapper>{children}</SectionWrapper> : children}
    </Box>
  );
}
