import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ReactNode } from 'react';

function getValidNode(node: ReactNode, result: ReactNode) {
  return node === undefined ? result : node;
}

export default function Media({
  xs = undefined,
  sm = undefined,
  md = undefined,
  lg = undefined,
  xl = undefined,
  exact = false,
}: {
  xs?: ReactNode;
  sm?: ReactNode;
  md?: ReactNode;
  lg?: ReactNode;
  xl?: ReactNode;
  exact?: boolean;
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));

  if (exact) {
    if (isXs) return xs || null;
    if (isSm) return sm || null;
    if (isMd) return md || null;
    if (isLg) return lg || null;
    return xl || null;
  }

  let result: ReactNode = xs;
  if (isXs) return result;

  result = getValidNode(sm, result);
  if (isSm) return result;

  result = getValidNode(md, result);
  if (isMd) return result;

  result = getValidNode(lg, result);
  if (isLg) return result;

  return getValidNode(xl, result);
}
