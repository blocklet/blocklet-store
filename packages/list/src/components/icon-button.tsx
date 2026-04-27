import Button, { ButtonProps } from '@mui/material/Button';

export default function IconButton({
  children,
  onClick,
  size = 32,
  ...props
}: Omit<ButtonProps, 'size'> & { size?: number }) {
  return (
    <Button
      {...props}
      onClick={onClick}
      variant="outlined"
      sx={[
        {
          minWidth: size,
          height: size,
          p: 0,
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'divider',
          },
          borderRadius: 2,
          color: 'text.secondary',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}>
      {children}
    </Button>
  );
}
