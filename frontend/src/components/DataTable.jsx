const DataTable = ({ columns, data, onRowClick }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        minWidth: '100%',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderCollapse: 'collapse'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '0.5rem 1rem',
                borderBottom: '1px solid #d1d5db',
                textAlign: 'left'
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              style={{
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onClick={() => onRowClick && onRowClick(row)}
              onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid #d1d5db'
                }}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;