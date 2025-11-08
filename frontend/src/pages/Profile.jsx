import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/http';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState({
    // Personal Info
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    bloodGroup: '',
    
    // Work Info
    company: '',
    department: '',
    jobTitle: '',
    manager: '',
    dateOfJoining: '',
    employmentType: '',
    workLocation: '',
    
    // Address
    currentAddress: '',
    permanentAddress: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    
    // Salary Info (visible to admin/payroll only)
    wageType: 'Monthly',
    basicSalary: 0,
    hra: 0,
    standardAllowance: 0,
    totalSalary: 0,
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    
    // About
    about: '',
    
    // Skills
    skills: [],
    
    // Certifications
    certifications: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const employeeData = response.data.employee;
      
      setUserData({
        name: `${employeeData.firstName} ${employeeData.lastName}`,
        employeeId: employeeData.employeeId,
        email: employeeData.email,
        phone: employeeData.phone || '',
        dateOfBirth: employeeData.dateOfBirth || '',
        gender: employeeData.gender || '',
        maritalStatus: employeeData.maritalStatus || '',
        bloodGroup: employeeData.bloodGroup || '',
        
        company: 'WorkZen India Pvt Ltd',
        department: employeeData.department || '',
        jobTitle: employeeData.jobTitle || '',
        manager: employeeData.manager || '',
        dateOfJoining: employeeData.dateOfJoining || '',
        employmentType: employeeData.employmentType || 'Permanent',
        workLocation: employeeData.workLocation || '',
        
        currentAddress: employeeData.currentAddress || '',
        permanentAddress: employeeData.permanentAddress || '',
        
        emergencyContactName: employeeData.emergencyContactName || '',
        emergencyContactRelation: employeeData.emergencyContactRelation || '',
        emergencyContactPhone: employeeData.emergencyContactPhone || '',
        
        wageType: 'Monthly',
        basicSalary: employeeData.salary?.basic || 0,
        hra: employeeData.salary?.hra || 0,
        standardAllowance: employeeData.salary?.standardAllowance || 0,
        totalSalary: employeeData.salary?.totalCTC || 0,
        
        bankName: employeeData.bankName || '',
        accountNumber: employeeData.accountNumber || '',
        ifscCode: employeeData.ifscCode || '',
        panNumber: employeeData.panNumber || '',
        
        about: employeeData.about || 'No bio added yet.',
        skills: employeeData.skills || [],
        certifications: employeeData.certifications || [],
      });
      
      if (employeeData.avatar) {
        setAvatarPreview(employeeData.avatar);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/employees/${user.employeeId}/profile`, {
        phone: userData.phone,
        avatar: avatarPreview,
        about: userData.about,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        maritalStatus: userData.maritalStatus,
        bloodGroup: userData.bloodGroup,
        workLocation: userData.workLocation,
        currentAddress: userData.currentAddress,
        permanentAddress: userData.permanentAddress,
        emergencyContactName: userData.emergencyContactName,
        emergencyContactRelation: userData.emergencyContactRelation,
        emergencyContactPhone: userData.emergencyContactPhone,
        bankName: userData.bankName,
        accountNumber: userData.accountNumber,
        ifscCode: userData.ifscCode,
        panNumber: userData.panNumber,
      });
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    const skillName = prompt('Enter skill name:');
    const skillLevel = prompt('Enter skill level (Beginner/Intermediate/Advanced/Expert):');
    if (skillName && skillLevel) {
      setUserData({
        ...userData,
        skills: [...userData.skills, { id: Date.now(), name: skillName, level: skillLevel }],
      });
    }
  };

  const handleAddCertification = () => {
    const certName = prompt('Enter certification name:');
    const issuer = prompt('Enter issuer:');
    const year = prompt('Enter year:');
    if (certName && issuer && year) {
      setUserData({
        ...userData,
        certifications: [
          ...userData.certifications,
          { id: Date.now(), name: certName, issuer, year },
        ],
      });
    }
  };

  const InfoRow = ({ label, value, editable = false, name, type = 'text' }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'block', marginBottom: '0.25rem' }}>
        {label}
      </label>
      {isEditing && editable ? (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={(e) => setUserData({ ...userData, [name]: e.target.value })}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--gray-300)',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        />
      ) : (
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-900)' }}>
          {value || '-'}
        </div>
      )}
    </div>
  );

  return (
    <div className="content-wrap">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 600 }}>My Profile</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
          Loading profile...
        </div>
      ) : (
        <>
          {/* Avatar Section */}
          <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 700,
              backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              margin: '0 auto',
            }}
          >
            {!avatarPreview && userData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <label
            htmlFor="avatar-upload"
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              backgroundColor: 'white',
              border: '2px solid var(--gray-300)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            ✏️
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
        <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>{userData.name}</h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{userData.jobTitle}</p>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{userData.employeeId}</p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid var(--gray-200)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['resume', 'privateInfo', 'salaryInfo', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === tab ? 'var(--primary-color)' : 'var(--gray-600)',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                fontSize: '0.875rem',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'privateInfo' ? 'Private Info' : tab === 'salaryInfo' ? 'Salary Info' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Edit/Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={saving}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>About</h3>
            {isEditing ? (
              <textarea
                value={userData.about}
                onChange={(e) => setUserData({ ...userData, about: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
            ) : (
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--gray-700)' }}>
                {userData.about}
              </p>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Skills</h3>
              <button
                onClick={handleAddSkill}
                style={{
                  padding: '0.375rem 1rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                + Add Skill
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {userData.skills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#246BFF20',
                    color: 'var(--primary-color)',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {skill.name} • {skill.level}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Certifications</h3>
              <button
                onClick={handleAddCertification}
                style={{
                  padding: '0.375rem 1rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                + Add Certification
              </button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {userData.certifications.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {cert.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                    {cert.issuer} • {cert.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Private Info Tab */}
      {activeTab === 'privateInfo' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <InfoRow label="Full Name" value={userData.name} editable name="name" />
            <InfoRow label="Employee ID" value={userData.employeeId} />
            <InfoRow label="Email" value={userData.email} editable name="email" type="email" />
            <InfoRow label="Phone" value={userData.phone} editable name="phone" type="tel" />
            <InfoRow label="Date of Birth" value={userData.dateOfBirth} editable name="dateOfBirth" type="date" />
            <InfoRow label="Gender" value={userData.gender} editable name="gender" />
            <InfoRow label="Marital Status" value={userData.maritalStatus} editable name="maritalStatus" />
            <InfoRow label="Blood Group" value={userData.bloodGroup} editable name="bloodGroup" />
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1.5rem' }}>
            Work Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <InfoRow label="Company" value={userData.company} />
            <InfoRow label="Department" value={userData.department} />
            <InfoRow label="Job Title" value={userData.jobTitle} />
            <InfoRow label="Manager" value={userData.manager} />
            <InfoRow label="Date of Joining" value={userData.dateOfJoining} />
            <InfoRow label="Employment Type" value={userData.employmentType} />
            <InfoRow label="Work Location" value={userData.workLocation} editable name="workLocation" />
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1.5rem' }}>
            Address
          </h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <InfoRow label="Current Address" value={userData.currentAddress} editable name="currentAddress" />
            <InfoRow label="Permanent Address" value={userData.permanentAddress} editable name="permanentAddress" />
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1.5rem' }}>
            Emergency Contact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <InfoRow label="Contact Name" value={userData.emergencyContactName} editable name="emergencyContactName" />
            <InfoRow label="Relationship" value={userData.emergencyContactRelation} editable name="emergencyContactRelation" />
            <InfoRow label="Phone Number" value={userData.emergencyContactPhone} editable name="emergencyContactPhone" type="tel" />
          </div>
        </div>
      )}

      {/* Salary Info Tab */}
      {activeTab === 'salaryInfo' && (
        <div className="card">
          {user?.role === 'admin' || user?.role === 'payroll' ? (
            <>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                Salary Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <InfoRow label="Wage Type" value={userData.wageType} />
                <InfoRow label="Basic Salary" value={`₹${userData.basicSalary.toLocaleString('en-IN')}`} />
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                Salary Components
              </h3>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Basic (50%)</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>₹{userData.basicSalary.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>HRA (50% of Basic)</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>₹{userData.hra.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Standard Allowance (16.67%)</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>₹{userData.standardAllowance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total Salary</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                    ₹{userData.totalSalary.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1.5rem' }}>
                Bank Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <InfoRow label="Bank Name" value={userData.bankName} editable name="bankName" />
                <InfoRow label="Account Number" value={userData.accountNumber} editable name="accountNumber" />
                <InfoRow label="IFSC Code" value={userData.ifscCode} editable name="ifscCode" />
                <InfoRow label="PAN Number" value={userData.panNumber} editable name="panNumber" />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
              <p>You don't have permission to view salary information.</p>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Security Settings
          </h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                Change Password
              </label>
              <button
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Reset Password
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                Last password change: Never
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Password reset link will be sent to your registered email address.
              </p>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
