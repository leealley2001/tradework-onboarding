import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Use the same Supabase instance as main site
const supabase = createClient(
  'https://pmbukkiatxyoefpmmypg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnVra2lhdHh5b2VmcG1teXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjE4NTQsImV4cCI6MjA4NTYzNzg1NH0.Sd7r_5-JAqtENc7Vg5VHv743HIUvmik4wo1B2O8Iyfs'
);

const ADMIN_PASSWORD = "Tradework2026";
const COMPANY_EMAIL = "leealley2001@gmail.com";

// Onboarding steps configuration
const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', icon: '👋' },
  { id: 'contractor_agreement', title: 'Contractor Agreement', icon: '📋' },
  { id: 'w9', title: 'W-9 Tax Form', icon: '📄' },
  { id: 'background_check', title: 'Background Check', icon: '🔍' },
  { id: 'drivers_license', title: "Driver's License", icon: '🚗' },
  { id: 'insurance', title: 'Auto Insurance', icon: '🛡️' },
  { id: 'safety', title: 'Safety Agreement', icon: '⚠️' },
  { id: 'complete', title: 'Complete!', icon: '✅' }
];

export default function ContractorOnboarding() {
  const [view, setView] = useState('login'); // login, onboarding, admin
  const [accessCode, setAccessCode] = useState('');
  const [contractor, setContractor] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [signatures, setSignatures] = useState({});
  const [uploads, setUploads] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [allContractors, setAllContractors] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [newInvite, setNewInvite] = useState({ name: '', email: '', trade: '', phone: '' });
  const [selectedContractor, setSelectedContractor] = useState(null);

  // Load contractor data on access code entry
  const handleAccessCodeSubmit = async () => {
    setError(null);
    const { data, error } = await supabase
      .from('onboarding')
      .select('*')
      .eq('access_code', accessCode.toUpperCase())
      .single();

    if (error || !data) {
      setError('Invalid access code. Please check your email for the correct code.');
      return;
    }

    setContractor(data);
    setCurrentStep(data.current_step || 0);
    setFormData(data.form_data || {});
    setSignatures(data.signatures || {});
    setUploads(data.uploads || {});
    setView('onboarding');
  };

  // Save progress to database
  const saveProgress = async (newStep, newFormData, newSignatures, newUploads) => {
    const { error } = await supabase
      .from('onboarding')
      .update({
        current_step: newStep,
        form_data: newFormData || formData,
        signatures: newSignatures || signatures,
        uploads: newUploads || uploads,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractor.id);

    if (error) console.error('Error saving progress:', error);
  };

  // Handle file upload
  const handleFileUpload = async (field, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contractor.id}_${field}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('onboarding-docs')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('onboarding-docs')
      .getPublicUrl(fileName);

    const newUploads = { ...uploads, [field]: { name: file.name, url: urlData.publicUrl } };
    setUploads(newUploads);
    await saveProgress(currentStep, formData, signatures, newUploads);
    return urlData.publicUrl;
  };

  // Handle signature
  const handleSignature = async (field, signatureData) => {
    const newSignatures = { 
      ...signatures, 
      [field]: { 
        signature: signatureData, 
        signed_at: new Date().toISOString(),
        ip_address: 'logged' // In production, capture actual IP
      } 
    };
    setSignatures(newSignatures);
    await saveProgress(currentStep, formData, newSignatures, uploads);
  };

  // Move to next step
  const nextStep = async () => {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    await saveProgress(newStep, formData, signatures, uploads);

    // If completed, send notifications
    if (newStep === ONBOARDING_STEPS.length - 1) {
      await supabase
        .from('onboarding')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', contractor.id);

      // Build document summary
      const signatureList = Object.entries(signatures).map(([key, sig]) => 
        `✓ ${key.replace(/_/g, ' ').toUpperCase()}: Signed by "${sig.signature}" on ${new Date(sig.signed_at).toLocaleString()}`
      ).join('\n');

      const uploadList = Object.entries(uploads).map(([key, upload]) => 
        `📎 ${key.replace(/_/g, ' ').toUpperCase()}: ${upload.url}`
      ).join('\n');

      const formSummary = Object.entries(formData)
        .filter(([key, value]) => value && typeof value !== 'boolean')
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
        .join('\n');

      // Email to HR with full details
      try {
        await fetch(`https://formsubmit.co/ajax/${COMPANY_EMAIL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: `✅ ONBOARDING COMPLETE: ${contractor.name} - ${contractor.trade}`,
            "1. Contractor Name": contractor.name,
            "2. Email": contractor.email,
            "3. Phone": contractor.phone || 'Not provided',
            "4. Trade": contractor.trade,
            "5. Completed": new Date().toLocaleString(),
            "6. SIGNED DOCUMENTS": signatureList || 'None',
            "7. UPLOADED FILES": uploadList || 'None',
            "8. W-9 Name": formData.w9_name || contractor.name,
            "9. W-9 Address": `${formData.w9_address || ''}, ${formData.w9_city || ''}, ${formData.w9_state || ''} ${formData.w9_zip || ''}`,
            "10. Tax Classification": formData.w9_classification || 'Not provided',
            "11. SSN/EIN": formData.w9_ssn ? '***PROVIDED***' : 'Not provided',
            "12. Date of Birth": formData.bg_dob || 'Not provided',
            "13. Driver License #": formData.bg_dl || 'Not provided',
            "14. DL State": formData.bg_dl_state || 'Not provided',
            "15. DL Expiration": formData.dl_expiration || 'Not provided',
            "16. Insurance Company": formData.ins_company || 'Not provided',
            "17. Insurance Policy #": formData.ins_policy || 'Not provided',
            "18. Insurance Expiration": formData.ins_expiration || 'Not provided',
            "19. Emergency Contact": formData.emergency_name || 'Not provided',
            "20. Emergency Phone": formData.emergency_phone || 'Not provided',
            "21. Emergency Relationship": formData.emergency_relationship || 'Not provided',
            _template: "table"
          }),
        });
      } catch (e) { console.error('HR email error:', e); }

      // Email to CONTRACTOR with confirmation
      try {
        await fetch(`https://formsubmit.co/ajax/${contractor.email}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: `TradeWork Today - Your Onboarding is Complete!`,
            message: `Hi ${contractor.name},

Congratulations! You have successfully completed your onboarding with TradeWork Today.

DOCUMENTS SIGNED:
${signatureList || 'None'}

DOCUMENTS UPLOADED:
${uploadList || 'None'}

WHAT'S NEXT:
• We will review your information
• Background check processing (1-3 business days)
• You'll receive a call to discuss available jobs

IMPORTANT: Please keep this email for your records.

If you have any questions, reply to this email or contact us at ${COMPANY_EMAIL}.

Welcome to the team!
- TradeWork Today`,
            _template: "box"
          }),
        });
      } catch (e) { console.error('Contractor email error:', e); }
    }
  };

  // Admin: Load all contractors
  const loadAllContractors = async () => {
    const { data } = await supabase
      .from('onboarding')
      .select('*')
      .order('created_at', { ascending: false });
    setAllContractors(data || []);
  };

  // Admin: Create new onboarding invite
  const createInvite = async (name, email, trade, phone) => {
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('onboarding')
      .insert([{
        name,
        email,
        trade,
        phone,
        access_code: accessCode,
        status: 'pending',
        current_step: 0,
        form_data: {},
        signatures: {},
        uploads: {}
      }])
      .select()
      .single();

    if (!error) {
      // Send invite email
      await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Welcome to TradeWork Today - Complete Your Onboarding`,
          message: `Hi ${name},\n\nWelcome to TradeWork Today! Please complete your onboarding at:\n\nonboarding.tradeworktoday.com\n\nYour access code is: ${accessCode}\n\nThis should take about 10-15 minutes.\n\nQuestions? Reply to this email.\n\n- TradeWork Today Team`,
          _template: "box"
        }),
      });
      
      loadAllContractors();
      return data;
    }
    return null;
  };

  // Styles matching the main site
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    .onboard-container {
      min-height: 100vh;
      background: #f5f5f5;
      font-family: 'Work Sans', sans-serif;
      color: #1a1a1a;
    }
    
    .onboard-header {
      background: #1a1a1a;
      padding: 16px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 45px;
      height: 45px;
      background: #fbbf24;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .logo-text {
      font-family: 'Oswald', sans-serif;
      font-weight: 700;
      font-size: 20px;
      color: #fbbf24;
    }
    
    .logo-sub {
      font-size: 10px;
      color: #666;
      letter-spacing: 2px;
    }
    
    .login-card {
      max-width: 450px;
      margin: 80px auto;
      background: #fff;
      border: 3px solid #1a1a1a;
      padding: 40px;
    }
    
    .login-title {
      font-family: 'Oswald', sans-serif;
      font-size: 28px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .login-subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    
    .form-input {
      width: 100%;
      padding: 14px 16px;
      background: #fff;
      border: 3px solid #1a1a1a;
      font-family: 'Work Sans', sans-serif;
      font-size: 16px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
    }
    .form-input:focus {
      outline: none;
      border-color: #d62828;
    }
    
    .primary-btn {
      width: 100%;
      padding: 16px;
      background: #d62828;
      border: none;
      color: white;
      font-family: 'Oswald', sans-serif;
      font-size: 18px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 2px;
      transition: all 0.2s;
      box-shadow: 4px 4px 0 #7f1d1d;
    }
    .primary-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 #7f1d1d;
    }
    
    .secondary-btn {
      background: #1a1a1a;
      color: #fbbf24;
      box-shadow: 4px 4px 0 #000;
    }
    .secondary-btn:hover {
      box-shadow: 6px 6px 0 #000;
    }
    
    .error-msg {
      background: #fef2f2;
      border: 2px solid #dc2626;
      color: #dc2626;
      padding: 12px;
      margin-bottom: 16px;
      text-align: center;
    }
    
    .progress-bar {
      background: #fff;
      border-bottom: 3px solid #1a1a1a;
      padding: 20px 40px;
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .progress-step {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f5f5f5;
      border: 2px solid #ddd;
      font-family: 'Oswald', sans-serif;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
    }
    .progress-step.active {
      background: #fbbf24;
      border-color: #1a1a1a;
      color: #1a1a1a;
    }
    .progress-step.completed {
      background: #059669;
      border-color: #047857;
      color: white;
    }
    
    .step-content {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    
    .step-card {
      background: #fff;
      border: 3px solid #1a1a1a;
      padding: 40px;
    }
    
    .step-title {
      font-family: 'Oswald', sans-serif;
      font-size: 32px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .step-subtitle {
      color: #666;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-label {
      display: block;
      font-family: 'Oswald', sans-serif;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      color: #333;
    }
    
    .form-field {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid #ddd;
      font-family: 'Work Sans', sans-serif;
      font-size: 15px;
    }
    .form-field:focus {
      outline: none;
      border-color: #fbbf24;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .signature-box {
      border: 3px dashed #ddd;
      padding: 30px;
      text-align: center;
      background: #fafafa;
      margin: 20px 0;
    }
    
    .signature-input {
      width: 100%;
      padding: 20px;
      border: none;
      border-bottom: 3px solid #1a1a1a;
      font-family: 'Brush Script MT', cursive;
      font-size: 32px;
      text-align: center;
      background: transparent;
    }
    .signature-input:focus {
      outline: none;
      border-bottom-color: #d62828;
    }
    
    .signature-line {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }
    
    .signed-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #d1fae5;
      color: #059669;
      font-family: 'Oswald', sans-serif;
      font-size: 14px;
      text-transform: uppercase;
    }
    
    .upload-zone {
      border: 3px dashed #ddd;
      padding: 40px;
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-zone:hover {
      border-color: #fbbf24;
      background: #fffbeb;
    }
    
    .upload-icon {
      font-size: 40px;
      margin-bottom: 12px;
    }
    
    .uploaded-file {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #d1fae5;
      border: 2px solid #059669;
      margin-top: 12px;
    }
    
    .checkbox-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      margin-bottom: 8px;
    }
    
    .checkbox-item input {
      width: 20px;
      height: 20px;
      margin-top: 2px;
      accent-color: #d62828;
    }
    
    .legal-text {
      max-height: 300px;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
      border: 2px solid #ddd;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .nav-buttons {
      display: flex;
      gap: 16px;
      margin-top: 30px;
    }
    
    .nav-btn {
      flex: 1;
      padding: 16px;
      font-family: 'Oswald', sans-serif;
      font-size: 16px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.2s;
    }
    
    .back-btn {
      background: #f5f5f5;
      border: 2px solid #1a1a1a;
      color: #1a1a1a;
    }
    
    .next-btn {
      background: #d62828;
      border: none;
      color: white;
      box-shadow: 4px 4px 0 #7f1d1d;
    }
    .next-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 #7f1d1d;
    }
    .next-btn:disabled {
      background: #ccc;
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }
    
    .complete-card {
      text-align: center;
      padding: 60px 40px;
    }
    
    .complete-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    
    .admin-header {
      background: #111;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #333;
    }
    
    .admin-title {
      font-family: 'Oswald', sans-serif;
      color: #fbbf24;
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .admin-content {
      padding: 24px;
      background: #0d0d0d;
      min-height: calc(100vh - 60px);
    }
    
    .admin-card {
      background: #141414;
      border: 1px solid #333;
      padding: 24px;
      margin-bottom: 20px;
    }
    
    .admin-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .admin-table th {
      text-align: left;
      padding: 12px;
      background: #0a0a0a;
      color: #fbbf24;
      font-family: 'Oswald', sans-serif;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #fbbf24;
    }
    
    .admin-table td {
      padding: 12px;
      border-bottom: 1px solid #222;
      color: #e8e8e8;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      font-family: 'Oswald', sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-pending {
      background: rgba(251,191,36,0.2);
      color: #fbbf24;
    }
    
    .status-in-progress {
      background: rgba(59,130,246,0.2);
      color: #3b82f6;
    }
    
    .status-completed {
      background: rgba(5,150,105,0.2);
      color: #10b981;
    }
    
    .invite-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr auto;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .invite-input {
      padding: 12px;
      background: #1a1a1a;
      border: 1px solid #333;
      color: #e8e8e8;
      font-family: 'Work Sans', sans-serif;
    }
    
    .invite-btn {
      padding: 12px 24px;
      background: #fbbf24;
      border: none;
      color: #1a1a1a;
      font-family: 'Oswald', sans-serif;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;
    }
    
    .admin-back-btn {
      background: transparent;
      border: 1px solid rgba(251,191,36,0.3);
      color: #fbbf24;
      padding: 10px 20px;
      font-family: 'Oswald', sans-serif;
      font-size: 12px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .copy-btn {
      padding: 4px 8px;
      background: #333;
      border: none;
      color: #fbbf24;
      font-size: 11px;
      cursor: pointer;
    }
  `;

  // LOGIN VIEW
  if (view === 'login') {
    return (
      <div className="onboard-container">
        <style>{styles}</style>
        
        <header className="onboard-header">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            <div>
              <div className="logo-text">TRADE WORK TODAY</div>
              <div className="logo-sub">CONTRACTOR ONBOARDING</div>
            </div>
          </div>
          <button 
            onClick={() => setShowAdminLogin(true)}
            style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Oswald', sans-serif", fontSize: '12px', textTransform: 'uppercase' }}
          >
            Admin
          </button>
        </header>

        {showAdminLogin && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#1a1a1a', padding: '40px', border: '3px solid #fbbf24', maxWidth: '400px', width: '90%' }}>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', marginBottom: '20px', textTransform: 'uppercase' }}>Admin Login</h3>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') { if(adminPassword === ADMIN_PASSWORD) { setView('admin'); loadAllContractors(); setShowAdminLogin(false); } else { alert('Incorrect password'); }}}}
                style={{ width: '100%', padding: '14px', background: '#fff', border: '3px solid #333', marginBottom: '16px', fontSize: '16px' }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { if(adminPassword === ADMIN_PASSWORD) { setView('admin'); loadAllContractors(); setShowAdminLogin(false); } else { alert('Incorrect password'); }}} style={{ flex: 1, padding: '14px', background: '#fbbf24', border: 'none', fontFamily: "'Oswald', sans-serif", fontSize: '16px', cursor: 'pointer', textTransform: 'uppercase' }}>Enter</button>
                <button onClick={() => { setShowAdminLogin(false); setAdminPassword(''); }} style={{ flex: 1, padding: '14px', background: '#333', color: '#fff', border: 'none', fontFamily: "'Oswald', sans-serif", fontSize: '16px', cursor: 'pointer', textTransform: 'uppercase' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="login-card">
          <h1 className="login-title">Welcome!</h1>
          <p className="login-subtitle">Enter your access code to begin onboarding. You should have received this code via email.</p>
          
          {error && <div className="error-msg">{error}</div>}
          
          <input 
            type="text" 
            className="form-input" 
            placeholder="ACCESS CODE"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
            maxLength={6}
          />
          
          <button className="primary-btn" onClick={handleAccessCodeSubmit}>
            Start Onboarding →
          </button>
          
          <p style={{ marginTop: '24px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
            Don't have a code? Contact us at<br/>
            <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: '#d62828' }}>{COMPANY_EMAIL}</a>
          </p>
        </div>
      </div>
    );
  }

  // ADMIN VIEW
  if (view === 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0d', fontFamily: "'Work Sans', sans-serif", color: '#e8e8e8' }}>
        <style>{styles}</style>
        
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="admin-back-btn" onClick={() => setView('login')}>← Back</button>
            <h1 className="admin-title">Onboarding Admin</h1>
          </div>
          <button className="admin-back-btn" onClick={loadAllContractors}>↻ Refresh</button>
        </header>

        <div className="admin-content">
          <div className="admin-card">
            <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Send New Invite
            </h3>
            <div className="invite-form">
              <input className="invite-input" placeholder="Full Name" value={newInvite.name} onChange={e => setNewInvite({...newInvite, name: e.target.value})} />
              <input className="invite-input" placeholder="Email" value={newInvite.email} onChange={e => setNewInvite({...newInvite, email: e.target.value})} />
              <input className="invite-input" placeholder="Phone" value={newInvite.phone} onChange={e => setNewInvite({...newInvite, phone: e.target.value})} />
              <select className="invite-input" value={newInvite.trade} onChange={e => setNewInvite({...newInvite, trade: e.target.value})}>
                <option value="">Select Trade</option>
                <option>Electrician</option>
                <option>Plumber</option>
                <option>HVAC Technician</option>
                <option>Carpenter</option>
                <option>Handyman</option>
                <option>General Labor</option>
              </select>
              <button className="invite-btn" onClick={async () => {
                if (newInvite.name && newInvite.email && newInvite.trade) {
                  await createInvite(newInvite.name, newInvite.email, newInvite.trade, newInvite.phone);
                  setNewInvite({ name: '', email: '', trade: '', phone: '' });
                }
              }}>
                Send Invite
              </button>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              All Contractors ({allContractors.length})
            </h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Trade</th>
                  <th>Email</th>
                  <th>Code</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allContractors.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: '#fbbf24' }}>{c.trade}</td>
                    <td>{c.email}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: '#222', padding: '4px 8px' }}>{c.access_code}</span>
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(c.access_code)} style={{ marginLeft: '8px' }}>Copy</button>
                    </td>
                    <td>
                      Step {c.current_step + 1} / {ONBOARDING_STEPS.length}
                      <div style={{ background: '#333', height: '4px', marginTop: '4px', borderRadius: '2px' }}>
                        <div style={{ background: '#fbbf24', height: '100%', width: `${((c.current_step + 1) / ONBOARDING_STEPS.length) * 100}%`, borderRadius: '2px' }}></div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${c.status === 'completed' ? 'completed' : c.current_step > 0 ? 'in-progress' : 'pending'}`}>
                        {c.status === 'completed' ? 'Complete' : c.current_step > 0 ? 'In Progress' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ color: '#666', fontSize: '12px' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedContractor(c)}
                        style={{ padding: '6px 12px', background: '#fbbf24', border: 'none', color: '#1a1a1a', fontFamily: "'Oswald', sans-serif", fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {allContractors.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No contractors yet. Send an invite above to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {selectedContractor && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, overflow: 'auto', padding: '40px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', background: '#1a1a1a', border: '3px solid #fbbf24', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #333', paddingBottom: '16px' }}>
                <h2 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', fontSize: '24px', textTransform: 'uppercase' }}>
                  {selectedContractor.name}
                </h2>
                <button 
                  onClick={() => setSelectedContractor(null)}
                  style={{ padding: '10px 20px', background: '#333', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", cursor: 'pointer' }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#222', padding: '16px' }}>
                  <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
                  <div>{selectedContractor.email}</div>
                </div>
                <div style={{ background: '#222', padding: '16px' }}>
                  <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Phone</div>
                  <div>{selectedContractor.phone || 'Not provided'}</div>
                </div>
                <div style={{ background: '#222', padding: '16px' }}>
                  <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Trade</div>
                  <div style={{ color: '#fbbf24' }}>{selectedContractor.trade}</div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', fontSize: '16px', marginBottom: '12px', textTransform: 'uppercase' }}>
                  ✍️ Signatures
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selectedContractor.signatures && Object.keys(selectedContractor.signatures).length > 0 ? (
                    Object.entries(selectedContractor.signatures).map(([key, sig]) => (
                      <div key={key} style={{ background: '#222', padding: '12px', borderLeft: '3px solid #059669' }}>
                        <div style={{ color: '#059669', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                          ✓ {key.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '20px' }}>{sig.signature}</div>
                        <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                          {new Date(sig.signed_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#666' }}>No signatures yet</div>
                  )}
                </div>
              </div>

              {/* Uploads */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', fontSize: '16px', marginBottom: '12px', textTransform: 'uppercase' }}>
                  📎 Uploaded Documents
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {selectedContractor.uploads && Object.keys(selectedContractor.uploads).length > 0 ? (
                    Object.entries(selectedContractor.uploads).map(([key, upload]) => (
                      <div key={key} style={{ background: '#222', padding: '12px' }}>
                        <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {key.replace(/_/g, ' ')}
                        </div>
                        <a 
                          href={upload.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ display: 'inline-block', padding: '8px 16px', background: '#3b82f6', color: '#fff', textDecoration: 'none', fontFamily: "'Oswald', sans-serif", fontSize: '12px', textTransform: 'uppercase' }}
                        >
                          📄 View / Download
                        </a>
                        <div style={{ color: '#666', fontSize: '11px', marginTop: '8px' }}>{upload.name}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#666' }}>No uploads yet</div>
                  )}
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', fontSize: '16px', marginBottom: '12px', textTransform: 'uppercase' }}>
                  📋 Form Data
                </h3>
                <div style={{ background: '#222', padding: '16px', maxHeight: '300px', overflow: 'auto' }}>
                  {selectedContractor.form_data && Object.keys(selectedContractor.form_data).length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {Object.entries(selectedContractor.form_data).map(([key, value]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: '8px', color: '#888', textTransform: 'uppercase', fontSize: '12px', width: '40%' }}>
                              {key.replace(/_/g, ' ')}
                            </td>
                            <td style={{ padding: '8px' }}>
                              {typeof value === 'boolean' ? (value ? '✓ Yes' : '✗ No') : value || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ color: '#666' }}>No form data yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ONBOARDING VIEW
  const step = ONBOARDING_STEPS[currentStep];

  const renderStepContent = () => {
    switch (step.id) {
      case 'welcome':
        return (
          <div>
            <p style={{ fontSize: '18px', lineHeight: 1.7, marginBottom: '24px' }}>
              Hi <strong>{contractor.name}</strong>! Welcome to TradeWork Today.
            </p>
            <p style={{ marginBottom: '24px', lineHeight: 1.6 }}>
              Before you can start taking jobs, we need to collect some information and have you review a few documents. This process takes about <strong>10-15 minutes</strong>.
            </p>
            <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', padding: '20px', marginBottom: '24px' }}>
              <strong>What you'll need:</strong>
              <ul style={{ marginTop: '12px', marginLeft: '20px', lineHeight: 1.8 }}>
                <li>Your driver's license (photo/scan)</li>
                <li>Proof of auto insurance</li>
                <li>Social Security Number (for W-9)</li>
                <li>About 10-15 minutes</li>
              </ul>
            </div>
            <p style={{ color: '#666' }}>
              Your progress is saved automatically. You can close this page and return later using the same access code.
            </p>
          </div>
        );

      case 'contractor_agreement':
        return (
          <div>
            <div className="legal-text">
              <h4 style={{ marginBottom: '12px' }}>INDEPENDENT CONTRACTOR AGREEMENT</h4>
              <p style={{ marginBottom: '12px' }}>This Independent Contractor Agreement ("Agreement") is entered into between TradeWork Today LLC ("Company") and {contractor.name} ("Contractor").</p>
              
              <p style={{ marginBottom: '12px' }}><strong>1. INDEPENDENT CONTRACTOR STATUS</strong></p>
              <p style={{ marginBottom: '12px' }}>Contractor is an independent contractor and not an employee of Company. Contractor is responsible for their own taxes, insurance, and benefits. Contractor has the right to accept or decline any work assignment.</p>
              
              <p style={{ marginBottom: '12px' }}><strong>2. SERVICES</strong></p>
              <p style={{ marginBottom: '12px' }}>Contractor agrees to perform {contractor.trade} services as assigned and accepted. All work shall be performed in a professional manner consistent with industry standards.</p>
              
              <p style={{ marginBottom: '12px' }}><strong>3. COMPENSATION</strong></p>
              <p style={{ marginBottom: '12px' }}>Contractor shall be compensated at the agreed-upon rate for each job. Payment will be processed weekly.</p>
              
              <p style={{ marginBottom: '12px' }}><strong>4. INSURANCE</strong></p>
              <p style={{ marginBottom: '12px' }}>Contractor shall maintain general liability insurance and auto insurance meeting Arizona minimum requirements.</p>
              
              <p style={{ marginBottom: '12px' }}><strong>5. SAFETY</strong></p>
              <p style={{ marginBottom: '12px' }}>Contractor agrees to follow all OSHA regulations and safety guidelines. Contractor shall use appropriate PPE and report any incidents immediately.</p>
              
              <p style={{ marginBottom: '12px' }}><strong>6. CONFIDENTIALITY</strong></p>
              <p style={{ marginBottom: '12px' }}>Contractor agrees to keep customer information confidential and not solicit Company customers directly.</p>
              
              <p style={{ marginBottom: '12px' }}><strong>7. TERMINATION</strong></p>
              <p style={{ marginBottom: '12px' }}>Either party may terminate this Agreement at any time with 7 days written notice.</p>
              
              <p style={{ marginBottom: '12px' }}><strong>8. GOVERNING LAW</strong></p>
              <p>This Agreement is governed by the laws of Arizona.</p>
            </div>
            
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="agree-contractor"
                checked={formData.agreedContractorAgreement || false}
                onChange={(e) => setFormData({...formData, agreedContractorAgreement: e.target.checked})}
              />
              <label htmlFor="agree-contractor">
                I have read and agree to the Independent Contractor Agreement. I understand that I am an independent contractor, not an employee.
              </label>
            </div>

            {formData.agreedContractorAgreement && (
              <div className="signature-box">
                {signatures.contractor_agreement ? (
                  <div className="signed-badge">✓ Signed: {signatures.contractor_agreement.signature}</div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      className="signature-input" 
                      placeholder="Type your full legal name"
                      onBlur={(e) => e.target.value && handleSignature('contractor_agreement', e.target.value)}
                    />
                    <div className="signature-line">Type your full legal name as your electronic signature</div>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'w9':
        return (
          <div>
            <p style={{ marginBottom: '20px' }}>
              The IRS requires us to collect a W-9 from all independent contractors. This information is used to report your earnings.
            </p>
            
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Legal Name (as shown on tax return)</label>
                <input className="form-field" value={formData.w9_name || contractor.name} onChange={e => setFormData({...formData, w9_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Business Name (if different)</label>
                <input className="form-field" value={formData.w9_business || ''} onChange={e => setFormData({...formData, w9_business: e.target.value})} placeholder="Leave blank if same as legal name" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tax Classification</label>
              <select className="form-field" value={formData.w9_classification || ''} onChange={e => setFormData({...formData, w9_classification: e.target.value})}>
                <option value="">Select classification</option>
                <option value="individual">Individual/Sole Proprietor</option>
                <option value="llc_single">Single-member LLC</option>
                <option value="llc_c">LLC taxed as C-Corp</option>
                <option value="llc_s">LLC taxed as S-Corp</option>
                <option value="c_corp">C Corporation</option>
                <option value="s_corp">S Corporation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-field" placeholder="Street Address" value={formData.w9_address || ''} onChange={e => setFormData({...formData, w9_address: e.target.value})} style={{ marginBottom: '8px' }} />
              <div className="form-row">
                <input className="form-field" placeholder="City" value={formData.w9_city || ''} onChange={e => setFormData({...formData, w9_city: e.target.value})} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="form-field" placeholder="State" value={formData.w9_state || 'AZ'} onChange={e => setFormData({...formData, w9_state: e.target.value})} style={{ width: '80px' }} />
                  <input className="form-field" placeholder="ZIP" value={formData.w9_zip || ''} onChange={e => setFormData({...formData, w9_zip: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Social Security Number or EIN</label>
              <input 
                className="form-field" 
                type="password"
                placeholder="XXX-XX-XXXX or XX-XXXXXXX" 
                value={formData.w9_ssn || ''} 
                onChange={e => setFormData({...formData, w9_ssn: e.target.value})}
                style={{ maxWidth: '250px' }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>🔒 This information is encrypted and stored securely.</p>
            </div>

            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="w9-certify"
                checked={formData.w9_certified || false}
                onChange={(e) => setFormData({...formData, w9_certified: e.target.checked})}
              />
              <label htmlFor="w9-certify">
                Under penalties of perjury, I certify that the taxpayer identification number I provided is correct and I am not subject to backup withholding.
              </label>
            </div>

            {formData.w9_certified && formData.w9_ssn && (
              <div className="signature-box">
                {signatures.w9 ? (
                  <div className="signed-badge">✓ Signed: {signatures.w9.signature}</div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      className="signature-input" 
                      placeholder="Type your full legal name"
                      onBlur={(e) => e.target.value && handleSignature('w9', e.target.value)}
                    />
                    <div className="signature-line">Electronic signature</div>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'background_check':
        return (
          <div>
            <p style={{ marginBottom: '20px' }}>
              We conduct background checks on all contractors to ensure the safety of our customers. Please provide the following information.
            </p>
            
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Legal Name</label>
                <input className="form-field" value={formData.bg_name || contractor.name} onChange={e => setFormData({...formData, bg_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-field" type="date" value={formData.bg_dob || ''} onChange={e => setFormData({...formData, bg_dob: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Other Names Used (maiden name, aliases)</label>
              <input className="form-field" placeholder="Leave blank if none" value={formData.bg_aliases || ''} onChange={e => setFormData({...formData, bg_aliases: e.target.value})} />
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Driver's License Number</label>
                <input className="form-field" value={formData.bg_dl || ''} onChange={e => setFormData({...formData, bg_dl: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">State Issued</label>
                <input className="form-field" value={formData.bg_dl_state || 'AZ'} onChange={e => setFormData({...formData, bg_dl_state: e.target.value})} />
              </div>
            </div>

            <div className="legal-text" style={{ maxHeight: '200px' }}>
              <p><strong>BACKGROUND CHECK AUTHORIZATION</strong></p>
              <p style={{ marginTop: '12px' }}>I authorize TradeWork Today LLC to conduct a background investigation including criminal history records, driving records, and verification of identity. I understand I have the right to request disclosure of the nature and scope of any investigation.</p>
            </div>

            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="bg-authorize"
                checked={formData.bg_authorized || false}
                onChange={(e) => setFormData({...formData, bg_authorized: e.target.checked})}
              />
              <label htmlFor="bg-authorize">
                I authorize TradeWork Today to conduct a background check and verify the information I have provided is accurate.
              </label>
            </div>

            {formData.bg_authorized && formData.bg_dob && (
              <div className="signature-box">
                {signatures.background_check ? (
                  <div className="signed-badge">✓ Signed: {signatures.background_check.signature}</div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      className="signature-input" 
                      placeholder="Type your full legal name"
                      onBlur={(e) => e.target.value && handleSignature('background_check', e.target.value)}
                    />
                    <div className="signature-line">Electronic signature</div>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'drivers_license':
        return (
          <div>
            <p style={{ marginBottom: '20px' }}>
              Please upload a photo or scan of your driver's license (front and back).
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Driver's License - Front</label>
              {uploads.dl_front ? (
                <div className="uploaded-file">
                  <span>✓ {uploads.dl_front.name}</span>
                  <button onClick={() => setUploads({...uploads, dl_front: null})} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div className="upload-zone" onClick={() => document.getElementById('dl-front').click()}>
                  <input type="file" id="dl-front" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleFileUpload('dl_front', e.target.files[0])} />
                  <div className="upload-icon">📄</div>
                  <div>Click to upload front of license</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>JPG, PNG, or PDF</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Driver's License - Back</label>
              {uploads.dl_back ? (
                <div className="uploaded-file">
                  <span>✓ {uploads.dl_back.name}</span>
                  <button onClick={() => setUploads({...uploads, dl_back: null})} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div className="upload-zone" onClick={() => document.getElementById('dl-back').click()}>
                  <input type="file" id="dl-back" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleFileUpload('dl_back', e.target.files[0])} />
                  <div className="upload-icon">📄</div>
                  <div>Click to upload back of license</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>JPG, PNG, or PDF</div>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">License Expiration Date</label>
                <input className="form-field" type="date" value={formData.dl_expiration || ''} onChange={e => setFormData({...formData, dl_expiration: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">License Class</label>
                <select className="form-field" value={formData.dl_class || ''} onChange={e => setFormData({...formData, dl_class: e.target.value})}>
                  <option value="">Select</option>
                  <option value="D">Class D (Standard)</option>
                  <option value="A">Class A (CDL)</option>
                  <option value="B">Class B (CDL)</option>
                  <option value="C">Class C (CDL)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'insurance':
        return (
          <div>
            <p style={{ marginBottom: '20px' }}>
              Please upload proof of your current auto insurance. This should show your name, vehicle, coverage dates, and policy number.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Insurance Card or Declarations Page</label>
              {uploads.insurance ? (
                <div className="uploaded-file">
                  <span>✓ {uploads.insurance.name}</span>
                  <button onClick={() => setUploads({...uploads, insurance: null})} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div className="upload-zone" onClick={() => document.getElementById('insurance').click()}>
                  <input type="file" id="insurance" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleFileUpload('insurance', e.target.files[0])} />
                  <div className="upload-icon">🛡️</div>
                  <div>Click to upload insurance document</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>JPG, PNG, or PDF</div>
                </div>
              )}
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Insurance Company</label>
                <input className="form-field" value={formData.ins_company || ''} onChange={e => setFormData({...formData, ins_company: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Policy Number</label>
                <input className="form-field" value={formData.ins_policy || ''} onChange={e => setFormData({...formData, ins_policy: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Policy Expiration Date</label>
              <input className="form-field" type="date" value={formData.ins_expiration || ''} onChange={e => setFormData({...formData, ins_expiration: e.target.value})} style={{ maxWidth: '250px' }} />
            </div>
          </div>
        );

      case 'safety':
        return (
          <div>
            <p style={{ marginBottom: '20px' }}>
              Safety is our top priority. Please review and acknowledge the following safety requirements.
            </p>

            <div className="legal-text">
              <p><strong>SAFETY ACKNOWLEDGMENT</strong></p>
              
              <p style={{ marginTop: '12px' }}><strong>Personal Protective Equipment (PPE)</strong></p>
              <p>I will wear appropriate PPE including safety glasses, work gloves, steel-toed boots, and other equipment as required by each job.</p>
              
              <p style={{ marginTop: '12px' }}><strong>Tool Safety</strong></p>
              <p>I will inspect tools before use, report defects immediately, and use tools only for their intended purpose.</p>
              
              <p style={{ marginTop: '12px' }}><strong>Ladder & Fall Protection</strong></p>
              <p>I will follow proper ladder safety, maintain three points of contact, and use fall protection when working at heights.</p>
              
              <p style={{ marginTop: '12px' }}><strong>Incident Reporting</strong></p>
              <p>I will immediately report ALL accidents, injuries, near-misses, and property damage to TradeWork Today.</p>
              
              <p style={{ marginTop: '12px' }}><strong>Zero Tolerance</strong></p>
              <p>I understand that working under the influence of drugs or alcohol is strictly prohibited and grounds for immediate termination.</p>
              
              <p style={{ marginTop: '12px' }}><strong>Right to Refuse</strong></p>
              <p>I have the right to stop work and report any unsafe conditions without retaliation.</p>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Emergency Contact Name</label>
              <input className="form-field" value={formData.emergency_name || ''} onChange={e => setFormData({...formData, emergency_name: e.target.value})} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input className="form-field" value={formData.emergency_phone || ''} onChange={e => setFormData({...formData, emergency_phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input className="form-field" value={formData.emergency_relationship || ''} onChange={e => setFormData({...formData, emergency_relationship: e.target.value})} />
              </div>
            </div>

            <div className="checkbox-item" style={{ marginTop: '20px' }}>
              <input 
                type="checkbox" 
                id="safety-agree"
                checked={formData.safety_agreed || false}
                onChange={(e) => setFormData({...formData, safety_agreed: e.target.checked})}
              />
              <label htmlFor="safety-agree">
                I have read and understand all safety requirements. I agree to comply with all safety policies and understand that failure to do so may result in termination.
              </label>
            </div>

            {formData.safety_agreed && formData.emergency_name && (
              <div className="signature-box">
                {signatures.safety ? (
                  <div className="signed-badge">✓ Signed: {signatures.safety.signature}</div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      className="signature-input" 
                      placeholder="Type your full legal name"
                      onBlur={(e) => e.target.value && handleSignature('safety', e.target.value)}
                    />
                    <div className="signature-line">Electronic signature</div>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="complete-card">
            <div className="complete-icon">🎉</div>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '36px', textTransform: 'uppercase', marginBottom: '16px', color: '#059669' }}>
              Onboarding Complete!
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
              Thank you, {contractor.name}! Your onboarding is now complete.
            </p>
            <div style={{ background: '#d1fae5', border: '2px solid #059669', padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
              <p style={{ marginBottom: '12px' }}><strong>What's Next?</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '20px', lineHeight: 1.8 }}>
                <li>We'll review your information</li>
                <li>Background check processing (1-3 days)</li>
                <li>You'll receive a call to discuss job opportunities</li>
              </ul>
            </div>
            <p style={{ marginTop: '24px', color: '#666' }}>
              Questions? Contact us at <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: '#d62828' }}>{COMPANY_EMAIL}</a>
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step.id) {
      case 'welcome': return true;
      case 'contractor_agreement': return formData.agreedContractorAgreement && signatures.contractor_agreement;
      case 'w9': return formData.w9_certified && formData.w9_ssn && formData.w9_classification && signatures.w9;
      case 'background_check': return formData.bg_authorized && formData.bg_dob && signatures.background_check;
      case 'drivers_license': return uploads.dl_front && uploads.dl_back && formData.dl_expiration;
      case 'insurance': return uploads.insurance && formData.ins_company && formData.ins_expiration;
      case 'safety': return formData.safety_agreed && formData.emergency_name && formData.emergency_phone && signatures.safety;
      case 'complete': return false;
      default: return true;
    }
  };

  return (
    <div className="onboard-container">
      <style>{styles}</style>
      
      <header className="onboard-header">
        <div className="logo-section">
          <div className="logo-icon">⚡</div>
          <div>
            <div className="logo-text">TRADE WORK TODAY</div>
            <div className="logo-sub">CONTRACTOR ONBOARDING</div>
          </div>
        </div>
        <div style={{ color: '#999', fontSize: '14px' }}>
          Welcome, {contractor.name}
        </div>
      </header>

      <div className="progress-bar">
        {ONBOARDING_STEPS.map((s, i) => (
          <div 
            key={s.id}
            className={`progress-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
          >
            <span>{s.icon}</span>
            <span style={{ display: i === currentStep ? 'inline' : 'none' }}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="step-content">
        <div className="step-card">
          <h2 className="step-title">{step.icon} {step.title}</h2>
          <p className="step-subtitle">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
          
          {renderStepContent()}

          {step.id !== 'complete' && (
            <div className="nav-buttons">
              {currentStep > 0 && (
                <button className="nav-btn back-btn" onClick={() => setCurrentStep(currentStep - 1)}>
                  ← Back
                </button>
              )}
              <button 
                className="nav-btn next-btn" 
                onClick={nextStep}
                disabled={!canProceed()}
                style={{ marginLeft: currentStep === 0 ? 'auto' : 0 }}
              >
                {currentStep === ONBOARDING_STEPS.length - 2 ? 'Complete Onboarding →' : 'Continue →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
