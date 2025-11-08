import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Mock data - replace with API call
    setEmployees([
      { id: 1, employeeId: 'EMP001', firstName: 'John', lastName: 'Doe', department: 'Engineering', jobTitle: 'Developer' },
      { id: 2, employeeId: 'EMP002', firstName: 'Jane', lastName: 'Smith', department: 'HR', jobTitle: 'Manager' },
    ]);
  }, []);

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'department', label: 'Department' },
    { key: 'jobTitle', label: 'Job Title' },
  ];

  const handleRowClick = (employee) => {
    // Navigate to employee profile
    console.log('View employee:', employee);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem'
      }}>Employee Directory</h1>
      <DataTable columns={columns} data={employees} onRowClick={handleRowClick} />
    </div>
  );
};

export default EmployeeList;