import React from 'react';

export default function FormField({ label, children }) {
  return (
    <div className="form-field">
      {label && <label style={{fontSize:13,color:'#6b7280',marginBottom:6}}>{label}</label>}
      {children}
    </div>
  );
}