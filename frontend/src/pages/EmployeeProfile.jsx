const EmployeeProfile = () => {
  // Mock data - replace with API call based on ID
  const employee = {
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    jobTitle: 'Senior Developer',
    salary: { basic: 60000, hra: 12000, allowances: 6000 },
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem'
      }}>Employee Profile</h1>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem'
        }}>
          <div>
            <label style={{ fontWeight: '600' }}>Employee ID:</label>
            <p>{employee.employeeId}</p>
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Name:</label>
            <p>{employee.firstName} {employee.lastName}</p>
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Email:</label>
            <p>{employee.email}</p>
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Department:</label>
            <p>{employee.department}</p>
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Job Title:</label>
            <p>{employee.jobTitle}</p>
          </div>
          <div>
            <label style={{ fontWeight: '600' }}>Basic Salary:</label>
            <p>${employee.salary.basic}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;