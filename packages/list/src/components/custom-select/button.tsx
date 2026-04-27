import MuiButton, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface IButtonProps extends ButtonProps {
  loading?: boolean | null;
}

function Button({ loading = false, disabled, ...rest }: IButtonProps) {
  return (
    <MuiButton
      disableElevation
      disabled={disabled || loading === true}
      {...rest}
      sx={[{ borderRadius: '4px' }, ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx])]}
      startIcon={loading && <CircularProgress size="1em" />}
    />
  );
}

export default Button;
