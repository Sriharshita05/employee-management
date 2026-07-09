import { EmployeeContext, useEmployeeState } from '../hooks/useEmployees';

function EmployeeProvider({ children }) {
  const value = useEmployeeState();
  return (
    <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>
  );
}

export default EmployeeProvider;
