import React from 'react';

export default function PrimaryButton({ children, onClick, variant='primary', className='' }) {
  const base = 'btn ' + (variant==='primary' ? 'btn-primary' : variant==='danger' ? 'btn-danger' : 'btn-ghost');
  return <button className={`${base} ${className}`} onClick={onClick}>{children}</button>;
}