import { createContext, useContext } from 'react';
import propTypes from 'prop-types';

import { useSessionContext } from './session';

const DeveloperContext = createContext({});
const { Provider, Consumer } = DeveloperContext;

function DeveloperProvider({ children }) {
  const { session } = useSessionContext();
  const isDeveloper = session.user?.passports.some((x) => x.role === 'developer');

  return <Provider value={{ developer: session.user, isDeveloper }}>{children}</Provider>;
}

function useDeveloperContext() {
  const result = useContext(DeveloperContext);
  return result;
}

DeveloperProvider.propTypes = {
  children: propTypes.any.isRequired,
};

export { DeveloperContext, DeveloperProvider, Consumer as DeveloperConsumer, useDeveloperContext };
