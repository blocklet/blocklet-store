import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Circle from '@iconify-icons/tabler/circle';
import CircleCheckFilled from '@iconify-icons/tabler/circle-check-filled';
import Square from '@iconify-icons/tabler/square';
import SquareCheckFilled from '@iconify-icons/tabler/square-check-filled';
import { Icon } from '@iconify/react';
import { useTheme } from '@arcblock/ux/lib/Theme';
import { Box, BoxProps, Checkbox, FormControlLabel, FormControlLabelProps, Typography } from '@mui/material';

export function CheckGroup({
  title,
  items,
  values,
  onChange,
  isCheckboxGroup = false,
  supportCancel = true,
  showAllLabel = true,
  ...props
}: {
  title: string;
  items: { label: string; value: string }[];
  values: string[];
  onChange: (value: string[]) => void;
  isCheckboxGroup?: boolean;
  supportCancel?: boolean;
  showAllLabel?: boolean;
} & BoxProps) {
  const { t } = useLocaleContext();

  return (
    <Box
      {...props}
      sx={[
        {
          display: 'flex',
          rowGap: 1.5,
          columnGap: 2,
          flexWrap: 'wrap',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}>
      <Typography
        variant="body1"
        sx={{
          width: '100%',
          display: 'flex',
          fontWeight: 500,
          alignItems: 'center',
        }}>
        {title}
        {!values.length && showAllLabel && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.hint',
              ml: 1,
            }}>
            [{t('common.all')}]
          </Typography>
        )}
      </Typography>
      {items.map(({ label, value }) => (
        <CheckButton
          checked={values.includes(value)}
          onChange={() => {
            if (values.includes(value)) {
              if (supportCancel) {
                onChange(values.filter((v) => v !== value));
              }
            } else if (isCheckboxGroup) {
              if (values.length + 1 === items.length) {
                onChange([]);
              } else {
                onChange([...values, value]);
              }
            } else {
              onChange([value]);
            }
          }}
          label={label}
          isRadio={!isCheckboxGroup}
        />
      ))}
    </Box>
  );
}

export function CheckButton({
  checked,
  onChange,
  label,
  isRadio = false,
  fontSize = 14,
  ...props
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isRadio?: boolean;
  fontSize?: number;
} & Omit<FormControlLabelProps, 'control' | 'onChange' | 'checked'>) {
  const theme = useTheme();

  return (
    <FormControlLabel
      {...props}
      sx={[
        {
          m: 0,
          p: 0,
          '& .MuiFormControlLabel-label': { userSelect: 'none', fontSize, fontWeight: 400, color: 'text.primary' },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
      control={
        <Checkbox
          checked={checked}
          // @ts-ignore $FixMe BlockletTheme 扩展的类型还是没有自动 Augment，后续在 ux3 中改进
          icon={<Icon style={{ padding: 0, color: theme.palette.text.hint }} icon={isRadio ? Circle : Square} />}
          checkedIcon={
            <Icon
              style={{ padding: 0, color: theme.palette.primary.main }}
              icon={isRadio ? CircleCheckFilled : SquareCheckFilled}
            />
          }
          size="large"
          sx={{ p: 0, mr: 0.5 }}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={label}
    />
  );
}
