import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Charts = ({ data, title }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '0.25rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '1rem'
      }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;