import { createContext, useContext, useMemo, useState } from 'react';

const AsideContext = createContext({
  open: false,
  toggleOpen: (_open?: boolean) => {},
});

export function AsideProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = (isOpen?: boolean) => {
    setOpen(isOpen ?? !isOpen);
  };

  const value = useMemo(() => ({ open, toggleOpen }), [open]);

  return <AsideContext.Provider value={value}>{children}</AsideContext.Provider>;
}

export function useAsideContext() {
  return useContext(AsideContext);
}
