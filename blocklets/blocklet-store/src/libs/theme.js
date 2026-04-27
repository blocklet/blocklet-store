/* eslint-disable import/prefer-default-export */
export const themeConfig = {
  palette: {
    storeSecondary: { main: '#EBFEFF', contrastText: '#fff' },
  },
  typography: {
    allVariants: {
      textTransform: 'none',
    },
    h1: {
      fontSize: 32,
      fontWeight: 700,
      lineHeight: 1.375,
    },
    h2: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.3333333,
    },
    h3: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.5,
    },
  },
  components: {
    MuiTable: {
      root: {
        backgroundColor: 'transparent',
      },
    },
    MuiTableCell: {
      root: {
        backgroundColor: 'transparent',
      },
      footer: {
        border: 'none',
      },
    },
    MUIDataTableHeadCell: ({ theme }) => ({
      root: {
        whiteSpace: 'nowrap',
      },
      sortAction: {
        alignItems: 'center',
      },
      fixedHeader: {
        backgroundColor: theme.palette.common.white,
      },
    }),
    MuiMenu: ({ theme }) => ({
      list: {
        backgroundColor: theme.palette.background.default,
      },
    }),
    MuiButton: ({ theme }) => ({
      styleOverrides: {
        root: {
          fontSize: 13,
          fontWeight: 500,
          borderRadius: '8px',
          borderColor: theme.palette.divider,
          textTransform: 'none',
          '&:hover': {
            borderColor: theme.palette.grey[300],
          },
        },
      },
    }),
    MuiDialogActions: {
      root: {
        padding: 12,
      },
    },
  },
};
