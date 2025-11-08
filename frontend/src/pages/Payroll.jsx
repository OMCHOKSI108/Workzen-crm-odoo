import React, {useState} from 'react';
import PrimaryButton from '../components/PrimaryButton';

export default function Payroll(){
  const [month,setMonth]=useState('11'); const [year,setYear]=useState('2025');
  const [result,setResult]=useState(null);

  function simulate(){
    // API stub
    setResult({gross:65000, deductions:7400, net:57600});
  }

  return (
    <div className="app-container">
      <h1 style={{textAlign:'center'}}>Payroll Simulator</h1>
      <div className="card" style={{marginTop:18}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <select className="input" value={month} onChange={e=>setMonth(e.target.value)}><option value="11">Nov</option></select>
          <input className="input" value={year} onChange={e=>setYear(e.target.value)} />
          <PrimaryButton onClick={simulate}>Simulate</PrimaryButton>
        </div>
      </div>

      {result && (
        <div className="card" style={{marginTop:18}}>
          <h3>Simulation Result</h3>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div>Gross: {result.gross}</div>
            <div>Deductions: {result.deductions}</div>
            <div>Net: {result.net}</div>
          </div>
        </div>
      )}
    </div>
  );
}