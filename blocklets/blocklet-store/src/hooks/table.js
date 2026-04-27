const useTableState = (pageState, innerPageState, persistence = true) => {
  const persistenceList = ['pageSize', 'innerHideColumns', 'sortDirection', 'sortBy'];
  const obj = new Proxy(
    {},
    {
      get: (target, property) => {
        if (persistenceList.includes(property) && persistence) {
          return pageState[property];
        }
        return innerPageState[property];
      },
      set: (target, property, value) => {
        if (persistenceList.includes(property) && persistence) {
          pageState[property] = value;
        } else {
          innerPageState[property] = value;
        }
        return true;
      },
    }
  );
  return obj;
};

export default useTableState;
