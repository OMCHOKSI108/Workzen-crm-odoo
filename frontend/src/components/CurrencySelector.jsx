import React, { useState, useEffect } from 'react';

export default function CurrencySelector() {
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
  ];

  useEffect(() => {
    fetchCurrentCurrency();
  }, []);

  const fetchCurrentCurrency = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/settings/currency', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentCurrency(data.currency);
      } else {
        console.error('Failed to fetch currency:', data.message);
      }
    } catch (error) {
      console.error('Error fetching currency:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = async (newCurrency) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/settings/currency', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currency: newCurrency })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentCurrency(newCurrency);
        // Show success notification
        alert(`Currency updated to ${newCurrency} successfully!`);
      } else {
        alert(`Failed to update currency: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      alert('Error updating currency. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          color: '#714B67'
        }}>
          <div style={{ marginRight: '0.5rem' }}>💰</div>
          Loading currency settings...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 1rem',
        color: '#714B67',
        fontSize: '1.25rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        💰 Currency Settings
      </h3>
      
      <p style={{
        margin: '0 0 1.5rem',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        Select the default currency for displaying salaries, expenses, and financial reports.
      </p>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {currencies.map((currency) => (
          <label
            key={currency.code}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '6px',
              border: currentCurrency === currency.code 
                ? '2px solid #714B67' 
                : '2px solid #e5e7eb',
              backgroundColor: currentCurrency === currency.code 
                ? '#f8f6fa' 
                : 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: saving ? 0.7 : 1
            }}
            onClick={() => !saving && currentCurrency !== currency.code && updateCurrency(currency.code)}
          >
            <input
              type="radio"
              name="currency"
              value={currency.code}
              checked={currentCurrency === currency.code}
              onChange={() => {}}
              disabled={saving}
              style={{
                marginRight: '0.75rem',
                accentColor: '#714B67'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <span style={{
                fontSize: '1.5rem',
                marginRight: '0.75rem',
                width: '2rem',
                textAlign: 'center'
              }}>
                {currency.symbol}
              </span>
              <div>
                <div style={{
                  fontWeight: '600',
                  color: currentCurrency === currency.code ? '#714B67' : '#374151'
                }}>
                  {currency.code}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {currency.name}
                </div>
              </div>
            </div>
            {currentCurrency === currency.code && (
              <div style={{
                color: '#059669',
                fontSize: '1.25rem'
              }}>
                ✓
              </div>
            )}
          </label>
        ))}
      </div>

      {saving && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          border: '1px solid #fde68a',
          color: '#f59e0b',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            border: '2px solid #f59e0b',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Updating currency settings...
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        border: '1px solid #bae6fd'
      }}>
        <h4 style={{ 
          margin: '0 0 0.5rem', 
          color: '#0369a1', 
          fontSize: '0.875rem', 
          fontWeight: '600' 
        }}>
          📋 Currency Impact:
        </h4>
        <ul style={{
          margin: 0,
          paddingLeft: '1.25rem',
          fontSize: '0.875rem',
          color: '#374151',
          lineHeight: '1.6'
        }}>
          <li>All salary displays will show amounts in {currentCurrency}</li>
          <li>PDF payslips will use {currencies.find(c => c.code === currentCurrency)?.symbol} symbol</li>
          <li>Reports and dashboards will reflect this currency</li>
          <li>Existing data remains unchanged, only display format updates</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}