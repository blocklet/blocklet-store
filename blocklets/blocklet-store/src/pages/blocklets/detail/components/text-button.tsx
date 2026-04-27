import Button, { ButtonProps } from '@mui/material/Button';
import Typography, { TypographyProps } from '@mui/material/Typography';

export default function TextButton({
  children,
  typographyProps = {},
  ...props
}: ButtonProps & { typographyProps?: TypographyProps }) {
  return (
    <Button variant="text" size="small" {...props}>
      <Typography variant="body1" {...typographyProps} sx={{ color: 'primary.main', ...typographyProps?.sx }}>
        {children}
      </Typography>
    </Button>
  );
}
