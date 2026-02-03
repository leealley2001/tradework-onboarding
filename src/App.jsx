import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';

// Use the same Supabase instance as main site
const supabase = createClient(
  'https://pmbukkiatxyoefpmmypg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnVra2lhdHh5b2VmcG1teXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjE4NTQsImV4cCI6MjA4NTYzNzg1NH0.Sd7r_5-JAqtENc7Vg5VHv743HIUvmik4wo1B2O8Iyfs'
);

const ADMIN_PASSWORD = "Tradework2026";
const COMPANY_EMAIL = "leealley2001@gmail.com";

// PDF Generation Functions
const generateContractorAgreementPDF = (contractor, formData, signature) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TRADE WORK TODAY', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(16);
  doc.text('INDEPENDENT CONTRACTOR AGREEMENT', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Intro
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const intro = `This Independent Contractor Agreement ("Agreement") is entered into between TradeWork Today LLC ("Company") and ${contractor.name} ("Contractor") on ${new Date(signature.signed_at).toLocaleDateString()}.`;
  const introLines = doc.splitTextToSize(intro, 170);
  doc.text(introLines, 20, y);
  y += introLines.length * 6 + 10;

  // Sections
  const sections = [
    { title: '1. INDEPENDENT CONTRACTOR STATUS', text: 'Contractor is an independent contractor and not an employee of Company. Contractor is responsible for their own taxes, insurance, and benefits. Contractor has the right to accept or decline any work assignment.' },
    { title: '2. SERVICES', text: `Contractor agrees to perform ${contractor.trade} services as assigned and accepted. All work shall be performed in a professional manner consistent with industry standards.` },
    { title: '3. COMPENSATION', text: 'Contractor shall be compensated at the agreed-upon rate for each job. Payment will be processed weekly.' },
    { title: '4. INSURANCE', text: 'Contractor shall maintain general liability insurance and auto insurance meeting Arizona minimum requirements.' },
    { title: '5. SAFETY', text: 'Contractor agrees to follow all OSHA regulations and safety guidelines. Contractor shall use appropriate PPE and report any incidents immediately.' },
    { title: '6. CONFIDENTIALITY', text: 'Contractor agrees to keep customer information confidential and not solicit Company customers directly.' },
    { title: '7. TERMINATION', text: 'Either party may terminate this Agreement at any time with 7 days written notice.' },
    { title: '8. GOVERNING LAW', text: 'This Agreement is governed by the laws of Arizona.' }
  ];

  sections.forEach(section => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(section.title, 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(section.text, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 8;
  });

  // Signature block
  if (y > 220) { doc.addPage(); y = 20; }
  y += 10;
  doc.setDrawColor(0);
  doc.line(20, y, 190, y);
  y += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ELECTRONIC SIGNATURE', 20, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Contractor Name: ${contractor.name}`, 20, y); y += 6;
  doc.text(`Email: ${contractor.email}`, 20, y); y += 6;
  doc.text(`Trade: ${contractor.trade}`, 20, y); y += 10;

  doc.setFont('times', 'italic');
  doc.setFontSize(18);
  doc.text(signature.signature, 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Electronically signed on: ${new Date(signature.signed_at).toLocaleString()}`, 20, y);
  y += 6;
  doc.text('This electronic signature has the same legal effect as a handwritten signature.', 20, y);

  return doc;
};

const generateW9PDF = (contractor, formData, signature) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 15;
  const rightMargin = pageWidth - 15;
  let y = 12;

  // Form header box (similar to IRS style)
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(leftMargin, y, 25, 18);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('W-9', leftMargin + 12.5, y + 12, { align: 'center' });
  
  // Form title
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('(Rev. October 2018)', leftMargin + 12.5, y + 17, { align: 'center' });
  doc.text('Department of the Treasury', 45, y + 4);
  doc.text('Internal Revenue Service', 45, y + 8);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Request for Taxpayer', 95, y + 5);
  doc.text('Identification Number and Certification', 95, y + 11);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Give Form to the', rightMargin - 30, y + 4);
  doc.text('requester. Do not', rightMargin - 30, y + 8);
  doc.text('send to the IRS.', rightMargin - 30, y + 12);
  
  y += 22;
  doc.setLineWidth(1);
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;

  // Line 1 - Name
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('1', leftMargin + 2, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.text('Name (as shown on your income tax return). Name is required on this line; do not leave this line blank.', leftMargin + 8, y + 3);
  y += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(formData.w9_name || contractor.name, leftMargin + 5, y + 5);
  y += 8;
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y, rightMargin, y);
  y += 3;

  // Line 2 - Business Name
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('2', leftMargin + 2, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.text('Business name/disregarded entity name, if different from above', leftMargin + 8, y + 3);
  y += 5;
  if (formData.w9_business) {
    doc.setFontSize(11);
    doc.text(formData.w9_business, leftMargin + 5, y + 4);
  }
  y += 7;
  doc.line(leftMargin, y, rightMargin, y);
  y += 3;

  // Line 3 - Tax Classification
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('3', leftMargin + 2, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.text('Check appropriate box for federal tax classification of the person whose name is entered on line 1:', leftMargin + 8, y + 3);
  y += 6;

  // Classification checkboxes
  const classifications = [
    { code: 'individual', label: 'Individual/sole proprietor or single-member LLC', x: leftMargin + 5 },
    { code: 'c_corp', label: 'C Corporation', x: leftMargin + 85 },
    { code: 's_corp', label: 'S Corporation', x: leftMargin + 115 },
    { code: 'partnership', label: 'Partnership', x: leftMargin + 145 }
  ];

  classifications.forEach(c => {
    doc.rect(c.x, y - 2.5, 3, 3);
    if (formData.w9_classification === c.code || 
        (formData.w9_classification === 'llc_single' && c.code === 'individual')) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', c.x + 0.5, y + 0.5);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(c.label, c.x + 5, y);
  });
  y += 6;

  // LLC options
  doc.rect(leftMargin + 5, y - 2.5, 3, 3);
  if (formData.w9_classification?.startsWith('llc_')) {
    doc.setFont('helvetica', 'bold');
    doc.text('X', leftMargin + 5.5, y + 0.5);
    doc.setFont('helvetica', 'normal');
  }
  doc.text('Limited liability company. Enter the tax classification (C=C corporation, S=S corporation, P=Partnership)', leftMargin + 10, y);
  y += 5;

  doc.rect(leftMargin + 5, y - 2.5, 3, 3);
  doc.text('Trust/estate', leftMargin + 10, y);
  doc.rect(leftMargin + 45, y - 2.5, 3, 3);
  doc.text('Other (see instructions)', leftMargin + 50, y);
  y += 5;
  doc.line(leftMargin, y, rightMargin, y);
  y += 3;

  // Line 5 & 6 - Address
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('5', leftMargin + 2, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.text('Address (number, street, and apt. or suite no.) See instructions.', leftMargin + 8, y + 3);
  y += 5;
  doc.setFontSize(11);
  doc.text(formData.w9_address || '', leftMargin + 5, y + 4);
  y += 7;
  doc.line(leftMargin, y, rightMargin, y);
  y += 3;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('6', leftMargin + 2, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.text('City, state, and ZIP code', leftMargin + 8, y + 3);
  y += 5;
  doc.setFontSize(11);
  const cityStateZip = `${formData.w9_city || ''}, ${formData.w9_state || ''} ${formData.w9_zip || ''}`;
  doc.text(cityStateZip.trim() !== ',' ? cityStateZip : '', leftMargin + 5, y + 4);
  y += 7;
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;

  // Part I - TIN
  doc.setFillColor(200, 200, 200);
  doc.rect(leftMargin, y, rightMargin - leftMargin, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Part I', leftMargin + 3, y + 5);
  doc.text('Taxpayer Identification Number (TIN)', leftMargin + 25, y + 5);
  y += 10;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Enter your TIN in the appropriate box. The TIN provided must match the name given on line 1 to avoid', leftMargin, y);
  y += 4;
  doc.text('backup withholding.', leftMargin, y);
  y += 6;

  // SSN Box
  doc.setFont('helvetica', 'bold');
  doc.text('Social security number', leftMargin + 100, y);
  y += 5;
  
  // Draw SSN boxes
  const ssnBoxX = leftMargin + 100;
  for (let i = 0; i < 9; i++) {
    doc.rect(ssnBoxX + (i * 8) + (i >= 3 ? 3 : 0) + (i >= 5 ? 3 : 0), y, 7, 8);
  }
  
  // Fill in masked SSN (show last 4 only)
  if (formData.w9_ssn) {
    const lastFour = formData.w9_ssn.slice(-4);
    doc.setFontSize(12);
    // Show X's for first 5 digits
    for (let i = 0; i < 5; i++) {
      doc.text('X', ssnBoxX + (i * 8) + (i >= 3 ? 3 : 0) + 2, y + 6);
    }
    // Show last 4 digits
    for (let i = 0; i < 4; i++) {
      doc.text(lastFour[i], ssnBoxX + ((5 + i) * 8) + 6 + 2, y + 6);
    }
  }
  y += 12;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('or', leftMargin + 95, y);
  y += 5;
  
  doc.text('Employer identification number', leftMargin + 100, y);
  y += 10;

  // Part II - Certification
  doc.setFillColor(200, 200, 200);
  doc.rect(leftMargin, y, rightMargin - leftMargin, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Part II', leftMargin + 3, y + 5);
  doc.text('Certification', leftMargin + 25, y + 5);
  y += 10;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const certText = 'Under penalties of perjury, I certify that:\n\n' +
    '1. The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and\n\n' +
    '2. I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and\n\n' +
    '3. I am a U.S. citizen or other U.S. person (defined below); and\n\n' +
    '4. The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.';
  
  const certLines = doc.splitTextToSize(certText, rightMargin - leftMargin - 5);
  doc.text(certLines, leftMargin, y);
  y += certLines.length * 3.5 + 5;

  // Signature section
  doc.setLineWidth(1);
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Sign', leftMargin + 2, y + 8);
  doc.text('Here', leftMargin + 2, y + 13);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Signature of', leftMargin + 15, y + 4);
  doc.text('U.S. person', leftMargin + 15, y + 9);
  
  // Signature line
  doc.line(leftMargin + 40, y + 12, leftMargin + 120, y + 12);
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.text(signature.signature, leftMargin + 45, y + 10);
  
  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Date', leftMargin + 125, y + 4);
  doc.line(leftMargin + 135, y + 12, rightMargin - 5, y + 12);
  doc.setFontSize(10);
  doc.text(new Date(signature.signed_at).toLocaleDateString(), leftMargin + 140, y + 10);
  
  y += 20;

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('ELECTRONIC SIGNATURE NOTICE: This document was electronically signed on ' + new Date(signature.signed_at).toLocaleString(), leftMargin, y);
  y += 4;
  doc.text('Electronic signatures have the same legal effect as handwritten signatures under the ESIGN Act and UETA.', leftMargin, y);
  y += 4;
  doc.text('Submitted to: TradeWork Today LLC | IP Address: logged', leftMargin, y);

  return doc;
};

const generateBackgroundCheckPDF = (contractor, formData, signature) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TRADE WORK TODAY', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(16);
  doc.text('BACKGROUND CHECK AUTHORIZATION', pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Personal info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('APPLICANT INFORMATION', 20, y);
  y += 10;

  const fields = [
    { label: 'Full Legal Name', value: formData.bg_name || contractor.name },
    { label: 'Date of Birth', value: formData.bg_dob || 'Not provided' },
    { label: 'Other Names Used', value: formData.bg_aliases || 'None' },
    { label: 'Driver License #', value: formData.bg_dl || 'Not provided' },
    { label: 'DL State', value: formData.bg_dl_state || 'Not provided' }
  ];

  doc.setFontSize(10);
  fields.forEach(field => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${field.label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(field.value, 70, y);
    y += 7;
  });

  y += 10;

  // Authorization text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('AUTHORIZATION', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const authText = `I, ${formData.bg_name || contractor.name}, hereby authorize TradeWork Today LLC and its designated agents to conduct a background investigation for employment purposes. This investigation may include: criminal history records (federal, state, and local), driving records and motor vehicle reports, verification of identity and Social Security Number, and sex offender registry search.`;
  const authLines = doc.splitTextToSize(authText, 170);
  doc.text(authLines, 20, y);
  y += authLines.length * 5 + 10;

  const fcraText = 'I understand that a consumer report may be obtained for evaluation purposes in accordance with the Fair Credit Reporting Act. If adverse action is taken based on information in the report, a copy of the report and summary of consumer rights will be provided.';
  const fcraLines = doc.splitTextToSize(fcraText, 170);
  doc.text(fcraLines, 20, y);
  y += fcraLines.length * 5 + 15;

  // Signature
  doc.line(20, y, 190, y);
  y += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ELECTRONIC SIGNATURE', 20, y);
  y += 10;

  doc.setFont('times', 'italic');
  doc.setFontSize(18);
  doc.text(signature.signature, 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Electronically signed on: ${new Date(signature.signed_at).toLocaleString()}`, 20, y);

  return doc;
};

const generateSafetyAgreementPDF = (contractor, formData, signature) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TRADE WORK TODAY', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(16);
  doc.text('SAFETY ACKNOWLEDGMENT', pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Sections
  const sections = [
    { title: 'Personal Protective Equipment (PPE)', text: 'I will wear appropriate PPE including safety glasses, work gloves, steel-toed boots, and other equipment as required by each job.' },
    { title: 'Tool Safety', text: 'I will inspect tools before use, report defects immediately, and use tools only for their intended purpose.' },
    { title: 'Ladder & Fall Protection', text: 'I will follow proper ladder safety, maintain three points of contact, and use fall protection when working at heights.' },
    { title: 'Incident Reporting', text: 'I will immediately report ALL accidents, injuries, near-misses, and property damage to TradeWork Today.' },
    { title: 'Zero Tolerance', text: 'I understand that working under the influence of drugs or alcohol is strictly prohibited and grounds for immediate termination.' },
    { title: 'Right to Refuse', text: 'I have the right to stop work and report any unsafe conditions without retaliation.' }
  ];

  doc.setFontSize(10);
  sections.forEach(section => {
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(section.text, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 8;
  });

  // Emergency contact
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EMERGENCY CONTACT', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${formData.emergency_name || 'Not provided'}`, 20, y); y += 6;
  doc.text(`Phone: ${formData.emergency_phone || 'Not provided'}`, 20, y); y += 6;
  doc.text(`Relationship: ${formData.emergency_relationship || 'Not provided'}`, 20, y);
  y += 15;

  // Signature
  doc.line(20, y, 190, y);
  y += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ELECTRONIC SIGNATURE', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('I have read and understand all safety requirements. I agree to comply with all safety', 20, y); y += 5;
  doc.text('policies and understand that failure to do so may result in termination.', 20, y);
  y += 10;

  doc.setFont('times', 'italic');
  doc.setFontSize(18);
  doc.text(signature.signature, 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Electronically signed on: ${new Date(signature.signed_at).toLocaleString()}`, 20, y);

  return doc;
};

const downloadAllPDFs = (contractor, formData, signatures) => {
  if (signatures.contractor_agreement) {
    const doc = generateContractorAgreementPDF(contractor, formData, signatures.contractor_agreement);
    doc.save(`${contractor.name.replace(/\s+/g, '_')}_Contractor_Agreement.pdf`);
  }
  if (signatures.w9) {
    const doc = generateW9PDF(contractor, formData, signatures.w9);
    doc.save(`${contractor.name.replace(/\s+/g, '_')}_W9.pdf`);
  }
  if (signatures.background_check) {
    const doc = generateBackgroundCheckPDF(contractor, formData, signatures.background_check);
    doc.save(`${contractor.name.replace(/\s+/g, '_')}_Background_Check.pdf`);
  }
  if (signatures.safety) {
    const doc = generateSafetyAgreementPDF(contractor, formData, signatures.safety);
    doc.save(`${contractor.name.replace(/\s+/g, '_')}_Safety_Agreement.pdf`);
  }
};

// Generate Contractor Handbook PDF (company policies)
const generateContractorHandbookPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 30;

  const addHeader = (pageNum) => {
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TRADE WORK TODAY - CONTRACTOR HANDBOOK', margin, 13);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 13, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  };

  const checkNewPage = (needed = 30) => {
    if (y + needed > pageHeight - 30) {
      doc.addPage();
      addHeader(doc.getNumberOfPages());
      y = 35;
    }
  };

  const addSection = (title, content) => {
    checkNewPage(50);
    doc.setFillColor(251, 191, 36);
    doc.rect(margin, y - 5, pageWidth - (margin * 2), 10, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(title, margin + 5, y + 2);
    doc.setTextColor(0, 0, 0);
    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    content.forEach(para => {
      checkNewPage(20);
      const lines = doc.splitTextToSize(para, pageWidth - (margin * 2));
      doc.text(lines, margin, y);
      y += lines.length * 5 + 8;
    });
  };

  const addSubSection = (title, content) => {
    checkNewPage(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    content.forEach(para => {
      checkNewPage(15);
      const lines = doc.splitTextToSize(para, pageWidth - (margin * 2));
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
    });
  };

  // Cover Page
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFillColor(251, 191, 36);
  doc.rect(pageWidth/2 - 30, 60, 60, 60, 'F');
  doc.setFontSize(40);
  doc.setTextColor(26, 26, 26);
  doc.text('⚡', pageWidth/2, 100, { align: 'center' });
  
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('TRADE WORK TODAY', pageWidth/2, 150, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('CONTRACTOR', pageWidth/2, 175, { align: 'center' });
  doc.text('HANDBOOK', pageWidth/2, 190, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text('Policies, Procedures & Guidelines', pageWidth/2, 220, { align: 'center' });
  doc.text('for Independent Contractors', pageWidth/2, 232, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Version 1.0 | ${new Date().toLocaleDateString()}`, pageWidth/2, pageHeight - 30, { align: 'center' });

  // Table of Contents
  doc.addPage();
  addHeader(2);
  y = 40;
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLE OF CONTENTS', margin, y);
  y += 20;
  
  const tocItems = [
    { num: '1', title: 'Welcome & Company Overview', page: 3 },
    { num: '2', title: 'Independent Contractor Relationship', page: 3 },
    { num: '3', title: 'Professional Conduct Standards', page: 4 },
    { num: '4', title: 'Safety Requirements', page: 5 },
    { num: '5', title: 'Communication Policy', page: 6 },
    { num: '6', title: 'Attendance & Availability', page: 7 },
    { num: '7', title: 'Equipment & Tools', page: 7 },
    { num: '8', title: 'Vehicle & Mileage Policy', page: 8 },
    { num: '9', title: 'Quality Standards', page: 9 },
    { num: '10', title: 'Customer Service', page: 9 },
    { num: '11', title: 'Payment & Invoicing', page: 10 },
    { num: '12', title: 'Termination', page: 10 }
  ];
  
  doc.setFontSize(11);
  tocItems.forEach(item => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.num}.`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(item.title, margin + 10, y);
    doc.text(`${item.page}`, pageWidth - margin, y, { align: 'right' });
    y += 10;
  });

  // Content Pages
  doc.addPage();
  addHeader(3);
  y = 35;

  addSection('1. WELCOME & COMPANY OVERVIEW', [
    'Welcome to TradeWork Today! We are a professional handyman and trade services company serving the Phoenix metropolitan area. Our mission is to provide reliable, high-quality services to homeowners and businesses while creating opportunities for skilled tradespeople.',
    'This handbook outlines the policies, procedures, and expectations for all independent contractors working with TradeWork Today. Please read it carefully and keep it for reference.'
  ]);

  addSection('2. INDEPENDENT CONTRACTOR RELATIONSHIP', [
    'As an independent contractor, you are not an employee of TradeWork Today. You maintain control over how you complete your work, set your own schedule (within job requirements), and are responsible for your own taxes, insurance, and business expenses.',
    'Key points of the independent contractor relationship:',
    '• You have the right to accept or decline any job assignment',
    '• You provide your own tools, equipment, and vehicle',
    '• You are responsible for self-employment taxes',
    '• You maintain your own liability insurance',
    '• You may work for other companies simultaneously'
  ]);

  doc.addPage();
  addHeader(4);
  y = 35;

  addSection('3. PROFESSIONAL CONDUCT STANDARDS', [
    'All contractors represent TradeWork Today when on job sites. Professional conduct is essential to our reputation and success.'
  ]);

  addSubSection('Appearance Standards', [
    '• Wear clean, appropriate work clothing',
    '• Display TradeWork Today identification badge when provided',
    '• Maintain good personal hygiene',
    '• No offensive graphics or language on clothing'
  ]);

  addSubSection('Behavioral Standards', [
    '• Treat all customers with respect and courtesy',
    '• No smoking on customer property',
    '• No alcohol or drugs before or during work',
    '• No profanity or inappropriate language',
    '• Keep phone use to job-related matters only',
    '• Clean up work area before leaving'
  ]);

  addSubSection('Prohibited Activities', [
    '• Theft or dishonesty of any kind',
    '• Harassment or discrimination',
    '• Unauthorized use of customer property',
    '• Discussing pricing or soliciting customers directly',
    '• Taking photos of customer homes without permission'
  ]);

  doc.addPage();
  addHeader(5);
  y = 35;

  addSection('4. SAFETY REQUIREMENTS', [
    'Safety is our top priority. All contractors must follow OSHA guidelines and TradeWork Today safety policies.'
  ]);

  addSubSection('Personal Protective Equipment (PPE)', [
    '• Safety glasses for all cutting, drilling, or overhead work',
    '• Work gloves when handling materials',
    '• Steel-toed boots on construction sites',
    '• Hard hat when required by job conditions',
    '• Hearing protection when using loud equipment',
    '• Dust masks for dusty conditions'
  ]);

  addSubSection('Ladder Safety', [
    '• Inspect ladder before each use',
    '• Maintain 3 points of contact at all times',
    '• Never stand on top two rungs',
    '• Place on stable, level surface',
    '• Do not exceed weight capacity',
    '• Use proper ladder for the height needed'
  ]);

  addSubSection('Electrical Safety', [
    '• Always turn off power before electrical work',
    '• Use a circuit tester to verify power is off',
    '• Never work on live circuits unless licensed and necessary',
    '• Keep electrical tools away from water',
    '• Report any electrical hazards immediately'
  ]);

  addSubSection('Incident Reporting', [
    'Report ALL incidents immediately to TradeWork Today, including:',
    '• Any injury, no matter how minor',
    '• Property damage',
    '• Near-miss incidents',
    '• Safety hazards discovered on site'
  ]);

  doc.addPage();
  addHeader(6);
  y = 35;

  addSection('5. COMMUNICATION POLICY', [
    'Clear, professional communication is essential for successful job completion and customer satisfaction.'
  ]);

  addSubSection('Response Times', [
    '• Respond to dispatch messages within 15 minutes during work hours',
    '• Confirm job acceptance/decline within 1 hour',
    '• Notify dispatch immediately of any delays',
    '• Update job status at key milestones'
  ]);

  addSubSection('Customer Communication', [
    '• Introduce yourself professionally upon arrival',
    '• Explain the work to be done before starting',
    '• Keep customer informed of progress',
    '• Discuss any additional issues discovered',
    '• Review completed work with customer',
    '• Thank the customer before leaving'
  ]);

  addSubSection('Emergency Contact', [
    'For emergencies, contact TradeWork Today immediately at the dispatch number provided. After-hours emergencies should be reported via the emergency line.'
  ]);

  doc.addPage();
  addHeader(7);
  y = 35;

  addSection('6. ATTENDANCE & AVAILABILITY', [
    'Reliable attendance is crucial to our customers and business operations.'
  ]);

  addSubSection('Job Acceptance', [
    '• Only accept jobs you can complete on time',
    '• Arrive at scheduled time or within 15-minute window',
    '• If running late, notify dispatch AND customer immediately',
    '• Provide realistic time estimates for job completion'
  ]);

  addSubSection('Cancellations', [
    '• Cancellations must be made at least 24 hours in advance when possible',
    '• Emergency cancellations should be reported immediately',
    '• Repeated no-shows or last-minute cancellations may result in termination',
    '• If sick, do not go to job sites - notify dispatch to reschedule'
  ]);

  addSection('7. EQUIPMENT & TOOLS', [
    'Contractors are expected to provide their own tools and equipment for their trade.'
  ]);

  addSubSection('Required Tools', [
    '• Basic hand tools appropriate for your trade',
    '• Power tools in good working condition',
    '• Safety equipment (PPE)',
    '• Reliable transportation',
    '• Smartphone for communication and job tracking'
  ]);

  addSubSection('Tool Maintenance', [
    '• Inspect tools before each use',
    '• Keep tools clean and in good repair',
    '• Replace worn or damaged equipment',
    '• Do not use customer tools without permission'
  ]);

  doc.addPage();
  addHeader(8);
  y = 35;

  addSection('8. VEHICLE & MILEAGE POLICY', [
    'Your vehicle is essential to performing your work. Maintain it properly and drive safely.'
  ]);

  addSubSection('Vehicle Requirements', [
    '• Valid driver\'s license (must be kept current)',
    '• Current vehicle registration',
    '• Auto insurance meeting Arizona minimum requirements',
    '• Vehicle in safe, working condition',
    '• Clean interior and exterior (you\'re representing us)'
  ]);

  addSubSection('Driving Standards', [
    '• Obey all traffic laws',
    '• No phone use while driving (hands-free only)',
    '• No speeding or reckless driving',
    '• Park legally and considerately at job sites',
    '• Report any accidents or traffic violations'
  ]);

  addSubSection('Mileage', [
    'Mileage between job sites may be reimbursable depending on the arrangement for specific jobs. Mileage to/from your home is generally not reimbursable. Keep accurate records of mileage for your own tax purposes.'
  ]);

  doc.addPage();
  addHeader(9);
  y = 35;

  addSection('9. QUALITY STANDARDS', [
    'TradeWork Today is built on quality workmanship. All work must meet professional standards.'
  ]);

  addSubSection('Workmanship', [
    '• Complete all work to professional standards',
    '• Follow manufacturer instructions and building codes',
    '• Take pride in your work - treat every job like your own home',
    '• If unsure about something, ask before proceeding',
    '• Never cut corners on safety or quality'
  ]);

  addSubSection('Warranty', [
    '• TradeWork Today warranties workmanship for 30 days',
    '• Warranty callbacks must be addressed within 48 hours',
    '• Document all work with photos as requested'
  ]);

  addSection('10. CUSTOMER SERVICE', [
    'Excellent customer service is what sets us apart.'
  ]);

  addSubSection('Key Principles', [
    '• Listen to the customer\'s needs',
    '• Explain work clearly in non-technical terms',
    '• Be honest about what can and cannot be done',
    '• Respect the customer\'s home and property',
    '• Leave the work area cleaner than you found it',
    '• Follow up to ensure satisfaction'
  ]);

  doc.addPage();
  addHeader(10);
  y = 35;

  addSection('11. PAYMENT & INVOICING', [
    'Payment for completed work is processed according to our standard procedures.'
  ]);

  addSubSection('Payment Schedule', [
    '• Payments are processed weekly (every Friday)',
    '• Work must be marked complete in the system',
    '• Customer must confirm job completion',
    '• Disputes delay payment until resolved'
  ]);

  addSubSection('Rate Information', [
    '• Rates are agreed upon before job acceptance',
    '• Additional work requires customer approval AND dispatch notification',
    '• Do not collect payment directly from customers',
    '• All payments go through TradeWork Today'
  ]);

  addSection('12. TERMINATION', [
    'The contractor relationship may be terminated by either party at any time with notice.'
  ]);

  addSubSection('Grounds for Immediate Termination', [
    '• Safety violations',
    '• Customer complaints of theft or dishonesty',
    '• Working under the influence',
    '• Harassment or discrimination',
    '• Repeated no-shows or cancellations',
    '• Misrepresentation of qualifications',
    '• Direct solicitation of TradeWork Today customers'
  ]);

  addSubSection('Voluntary Separation', [
    '• Provide at least 7 days notice when possible',
    '• Complete any accepted jobs or arrange handoff',
    '• Return any company property or materials',
    '• Submit final hours/invoices for payment'
  ]);

  // Final Page
  doc.addPage();
  addHeader(doc.getNumberOfPages());
  y = 60;

  doc.setFillColor(251, 191, 36);
  doc.rect(margin, y, pageWidth - (margin * 2), 80, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text('ACKNOWLEDGMENT', pageWidth/2, y + 20, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const ackText = 'By completing the online onboarding process, you acknowledge that you have received, read, and understood this Contractor Handbook. You agree to comply with all policies and procedures outlined herein.';
  const ackLines = doc.splitTextToSize(ackText, pageWidth - (margin * 2) - 20);
  doc.text(ackLines, pageWidth/2, y + 40, { align: 'center', maxWidth: pageWidth - (margin * 2) - 20 });

  y += 110;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('CONTACT INFORMATION', margin, y);
  y += 15;
  
  doc.setFontSize(10);
  doc.text('Email: leealley2001@gmail.com', margin, y);
  y += 8;
  doc.text('Website: tradeworktoday.com', margin, y);
  y += 8;
  doc.text('Onboarding Portal: onboarding.tradeworktoday.com', margin, y);
  
  y += 30;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('© ' + new Date().getFullYear() + ' TradeWork Today LLC. All rights reserved.', pageWidth/2, y, { align: 'center' });
  doc.text('This handbook is for informational purposes and does not constitute an employment contract.', pageWidth/2, y + 8, { align: 'center' });

  return doc;
};

// Onboarding steps configuration
const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', icon: '👋' },
  { id: 'contractor_agreement', title: 'Contractor Agreement', icon: '📋' },
  { id: 'w9', title: 'W-9 Tax Form', icon: '📄' },
  { id: 'background_check', title: 'Background Check', icon: '🔍' },
  { id: 'contractor_details', title: 'Your Details', icon: '👤' },
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

    // Parse JSON strings if needed
    const parsedFormData = typeof data.form_data === 'string' ? JSON.parse(data.form_data) : (data.form_data || {});
    const parsedSignatures = typeof data.signatures === 'string' ? JSON.parse(data.signatures) : (data.signatures || {});
    const parsedUploads = typeof data.uploads === 'string' ? JSON.parse(data.uploads) : (data.uploads || {});

    setContractor(data);
    setCurrentStep(data.current_step || 0);
    setFormData(parsedFormData);
    setSignatures(parsedSignatures);
    setUploads(parsedUploads);
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
            "22. CERTIFICATIONS": (formData.certifications || []).join(', ') || 'None selected',
            "23. Other Certs": formData.other_certifications || 'None',
            "24. Vehicle": `${formData.vehicle_year || ''} ${formData.vehicle_make || ''} ${formData.vehicle_model || ''} (${formData.vehicle_color || ''})`,
            "25. License Plate": formData.vehicle_plate || 'Not provided',
            "26. TOOLS OWNED": (formData.tools || []).join(', ') || 'None selected',
            "27. Other Tools": formData.other_tools || 'None',
            "28. Work Radius": formData.work_radius ? `${formData.work_radius} miles` : 'Not specified',
            "29. Availability": formData.availability || 'Not specified',
            "30. Desired Rate": formData.hourly_rate ? `$${formData.hourly_rate}/hr` : 'Not specified',
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
    
    // Parse JSON strings if needed
    const parsed = (data || []).map(c => ({
      ...c,
      form_data: typeof c.form_data === 'string' ? JSON.parse(c.form_data) : (c.form_data || {}),
      signatures: typeof c.signatures === 'string' ? JSON.parse(c.signatures) : (c.signatures || {}),
      uploads: typeof c.uploads === 'string' ? JSON.parse(c.uploads) : (c.uploads || {})
    }));
    
    setAllContractors(parsed);
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

  // Admin: Delete contractor
  const deleteContractor = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      const { error } = await supabase
        .from('onboarding')
        .delete()
        .eq('id', id);
      
      if (!error) {
        loadAllContractors();
        setSelectedContractor(null);
      }
    }
  };

  // Admin: Resend invite email
  const resendInvite = async (contractor) => {
    try {
      await fetch(`https://formsubmit.co/ajax/${contractor.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Reminder: Complete Your TradeWork Today Onboarding`,
          message: `Hi ${contractor.name},\n\nThis is a friendly reminder to complete your onboarding with TradeWork Today.\n\nGo to: onboarding.tradeworktoday.com\n\nYour access code is: ${contractor.access_code}\n\nThis takes about 10-15 minutes. Please complete it as soon as possible so we can get you working!\n\nQuestions? Reply to this email.\n\n- TradeWork Today Team`,
          _template: "box"
        }),
      });
      alert(`Reminder sent to ${contractor.email}`);
    } catch (e) {
      alert('Failed to send reminder');
    }
  };

  // Admin: Reset contractor progress (let them start over)
  const resetProgress = async (id, name) => {
    if (window.confirm(`Reset ${name}'s onboarding progress? They will need to start over from the beginning.`)) {
      const { error } = await supabase
        .from('onboarding')
        .update({
          current_step: 0,
          status: 'pending',
          form_data: {},
          signatures: {},
          uploads: {},
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (!error) {
        loadAllContractors();
        setSelectedContractor(null);
      }
    }
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
            <h1 className="admin-title">Onboarding Admin v2.0</h1>
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

          {/* Resources Section */}
          <div className="admin-card">
            <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              📚 Company Resources
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  const doc = generateContractorHandbookPDF();
                  doc.save('TradeWork_Today_Contractor_Handbook.pdf');
                }}
                style={{ padding: '12px 20px', background: '#3b82f6', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                📖 Download Contractor Handbook (PDF)
              </button>
              <button 
                onClick={() => {
                  const doc = new jsPDF();
                  doc.setFontSize(20);
                  doc.setFont('helvetica', 'bold');
                  doc.text('TradeWork Today', 105, 30, { align: 'center' });
                  doc.setFontSize(16);
                  doc.text('1099 Contractor Onboarding Checklist', 105, 45, { align: 'center' });
                  doc.setFontSize(11);
                  doc.setFont('helvetica', 'normal');
                  let y = 70;
                  const items = [
                    { label: 'Initial Contact', items: ['Phone screening completed', 'Trade skills verified', 'Availability discussed'] },
                    { label: 'Online Onboarding Portal', items: ['Access code sent', 'Contractor agreement signed', 'W-9 completed', 'Background check authorized', 'Contractor details submitted', "Driver's license uploaded", 'Auto insurance uploaded', 'Safety agreement signed'] },
                    { label: 'Admin Review', items: ['Documents reviewed', 'Background check cleared', 'Insurance verified', 'License verified'] },
                    { label: 'Orientation', items: ['Handbook reviewed', 'Safety training completed', 'Communication tools set up', 'First job assigned'] }
                  ];
                  items.forEach(section => {
                    doc.setFont('helvetica', 'bold');
                    doc.text(section.label, 20, y);
                    y += 8;
                    doc.setFont('helvetica', 'normal');
                    section.items.forEach(item => {
                      doc.rect(25, y - 4, 4, 4);
                      doc.text(item, 35, y);
                      y += 7;
                    });
                    y += 5;
                  });
                  doc.setFontSize(9);
                  doc.text('Contractor Name: _______________________  Date: __________', 20, 250);
                  doc.text('Admin Signature: _______________________  Date: __________', 20, 265);
                  doc.save('1099_Onboarding_Checklist.pdf');
                }}
                style={{ padding: '12px 20px', background: '#059669', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                ✅ Download Onboarding Checklist (PDF)
              </button>
              <button 
                onClick={() => {
                  const doc = new jsPDF();
                  doc.setFontSize(20);
                  doc.setFont('helvetica', 'bold');
                  doc.text('TradeWork Today', 105, 25, { align: 'center' });
                  doc.setFontSize(14);
                  doc.text('SAFETY QUICK REFERENCE CARD', 105, 38, { align: 'center' });
                  doc.setLineWidth(0.5);
                  doc.line(20, 45, 190, 45);
                  let y = 55;
                  const sections = [
                    { title: '🚨 EMERGENCY CONTACTS', items: ['911 - Police/Fire/Medical', 'Poison Control: 1-800-222-1222', 'TradeWork Today: (see dispatch info)'] },
                    { title: '🦺 REQUIRED PPE', items: ['Safety glasses - cutting, drilling, overhead work', 'Work gloves - handling materials', 'Steel-toed boots - construction sites', 'Dust mask - dusty conditions', 'Hearing protection - loud equipment'] },
                    { title: '🪜 LADDER SAFETY', items: ['Inspect before each use', '3 points of contact always', 'Never top two rungs', 'Stable, level surface', 'Face ladder when climbing'] },
                    { title: '⚡ ELECTRICAL SAFETY', items: ['Turn off power before work', 'Test circuits before touching', 'Never work on live circuits', 'Keep away from water'] },
                    { title: '📝 INCIDENT REPORTING', items: ['Report ALL injuries immediately', 'Report property damage', 'Report near-misses', 'Document with photos'] }
                  ];
                  doc.setFontSize(10);
                  sections.forEach(section => {
                    doc.setFont('helvetica', 'bold');
                    doc.text(section.title, 20, y);
                    y += 6;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    section.items.forEach(item => {
                      doc.text('• ' + item, 25, y);
                      y += 5;
                    });
                    y += 4;
                    doc.setFontSize(10);
                  });
                  doc.setFontSize(8);
                  doc.setTextColor(100, 100, 100);
                  doc.text('Keep this card in your vehicle. Safety first!', 105, 280, { align: 'center' });
                  doc.save('Safety_Quick_Reference.pdf');
                }}
                style={{ padding: '12px 20px', background: '#dc2626', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🦺 Download Safety Quick Reference (PDF)
              </button>
            </div>
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
              These resources can be printed and shared with contractors. The handbook is also referenced during the online onboarding process.
            </p>
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
                        style={{ padding: '6px 10px', background: '#fbbf24', border: 'none', color: '#1a1a1a', fontFamily: "'Oswald', sans-serif", fontSize: '10px', cursor: 'pointer', textTransform: 'uppercase', marginRight: '4px' }}
                      >
                        View
                      </button>
                      {c.status !== 'completed' && (
                        <button 
                          onClick={() => resendInvite(c)}
                          style={{ padding: '6px 10px', background: '#3b82f6', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '10px', cursor: 'pointer', textTransform: 'uppercase', marginRight: '4px' }}
                        >
                          Resend
                        </button>
                      )}
                      <button 
                        onClick={() => deleteContractor(c.id, c.name)}
                        style={{ padding: '6px 10px', background: '#dc2626', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '10px', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        Delete
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedContractor.status !== 'completed' && (
                    <>
                      <button 
                        onClick={() => resendInvite(selectedContractor)}
                        style={{ padding: '10px 16px', background: '#3b82f6', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        📧 Resend Invite
                      </button>
                      <button 
                        onClick={() => resetProgress(selectedContractor.id, selectedContractor.name)}
                        style={{ padding: '10px 16px', background: '#f59e0b', border: 'none', color: '#1a1a1a', fontFamily: "'Oswald', sans-serif", fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        🔄 Reset Progress
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => deleteContractor(selectedContractor.id, selectedContractor.name)}
                    style={{ padding: '10px 16px', background: '#dc2626', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    🗑️ Delete
                  </button>
                  <button 
                    onClick={() => setSelectedContractor(null)}
                    style={{ padding: '10px 16px', background: '#333', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✕ Close
                  </button>
                </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', fontSize: '16px', textTransform: 'uppercase' }}>
                    ✍️ Signed Documents
                  </h3>
                  {selectedContractor.signatures && Object.keys(selectedContractor.signatures).length > 0 && (
                    <button
                      onClick={() => downloadAllPDFs(selectedContractor, selectedContractor.form_data || {}, selectedContractor.signatures)}
                      style={{ padding: '8px 16px', background: '#059669', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                      📥 Download All PDFs
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selectedContractor.signatures && Object.keys(selectedContractor.signatures).length > 0 ? (
                    Object.entries(selectedContractor.signatures).map(([key, sig]) => (
                      <div key={key} style={{ background: '#222', padding: '12px', borderLeft: '3px solid #059669' }}>
                        <div style={{ color: '#059669', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                          ✓ {key.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '20px' }}>{sig.signature}</div>
                        <div style={{ color: '#666', fontSize: '11px', marginTop: '4px', marginBottom: '8px' }}>
                          {new Date(sig.signed_at).toLocaleString()}
                        </div>
                        <button
                          onClick={() => {
                            let doc;
                            if (key === 'contractor_agreement') {
                              doc = generateContractorAgreementPDF(selectedContractor, selectedContractor.form_data || {}, sig);
                            } else if (key === 'w9') {
                              doc = generateW9PDF(selectedContractor, selectedContractor.form_data || {}, sig);
                            } else if (key === 'background_check') {
                              doc = generateBackgroundCheckPDF(selectedContractor, selectedContractor.form_data || {}, sig);
                            } else if (key === 'safety') {
                              doc = generateSafetyAgreementPDF(selectedContractor, selectedContractor.form_data || {}, sig);
                            }
                            if (doc) doc.save(`${selectedContractor.name.replace(/\s+/g, '_')}_${key}.pdf`);
                          }}
                          style={{ padding: '6px 12px', background: '#3b82f6', border: 'none', color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: '10px', cursor: 'pointer', textTransform: 'uppercase' }}
                        >
                          📄 Download PDF
                        </button>
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

      case 'contractor_details':
        return (
          <div>
            <p style={{ marginBottom: '20px' }}>
              Tell us more about your qualifications and equipment. This helps us match you with the right jobs.
            </p>

            <div className="form-group">
              <label className="form-label">Certifications & Licenses</label>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Check all that apply:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['OSHA 10', 'OSHA 30', 'EPA 608', 'EPA 609', 'Journeyman License', 'Master License', 'Electrical License', 'Plumbing License', 'HVAC Certified', 'CPR/First Aid', 'Forklift Certified', 'Scissor Lift Certified', 'Confined Space', 'Fall Protection'].map(cert => (
                  <div key={cert} className="checkbox-item" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      id={`cert-${cert}`}
                      checked={formData.certifications?.includes(cert) || false}
                      onChange={(e) => {
                        const certs = formData.certifications || [];
                        if (e.target.checked) {
                          setFormData({...formData, certifications: [...certs, cert]});
                        } else {
                          setFormData({...formData, certifications: certs.filter(c => c !== cert)});
                        }
                      }}
                    />
                    <label htmlFor={`cert-${cert}`}>{cert}</label>
                  </div>
                ))}
              </div>
              <input 
                className="form-field" 
                placeholder="Other certifications (comma separated)" 
                value={formData.other_certifications || ''} 
                onChange={e => setFormData({...formData, other_certifications: e.target.value})}
                style={{ marginTop: '12px' }}
              />
            </div>

            <div style={{ marginTop: '24px', marginBottom: '24px', borderTop: '2px solid #eee', paddingTop: '24px' }}>
              <label className="form-label">Vehicle Information</label>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>You'll use your own vehicle to travel to job sites.</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Vehicle Year</label>
                  <input className="form-field" placeholder="e.g. 2019" value={formData.vehicle_year || ''} onChange={e => setFormData({...formData, vehicle_year: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Make</label>
                  <input className="form-field" placeholder="e.g. Ford" value={formData.vehicle_make || ''} onChange={e => setFormData({...formData, vehicle_make: e.target.value})} />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Model</label>
                  <input className="form-field" placeholder="e.g. F-150" value={formData.vehicle_model || ''} onChange={e => setFormData({...formData, vehicle_model: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Color</label>
                  <input className="form-field" placeholder="e.g. White" value={formData.vehicle_color || ''} onChange={e => setFormData({...formData, vehicle_color: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>License Plate</label>
                <input className="form-field" placeholder="e.g. ABC1234" value={formData.vehicle_plate || ''} onChange={e => setFormData({...formData, vehicle_plate: e.target.value})} style={{ maxWidth: '200px' }} />
              </div>
            </div>

            <div style={{ borderTop: '2px solid #eee', paddingTop: '24px' }}>
              <label className="form-label">Tools & Equipment</label>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>What tools do you own and can bring to job sites?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {['Basic Hand Tools', 'Power Drill', 'Circular Saw', 'Reciprocating Saw', 'Multimeter', 'Pipe Wrenches', 'Ladders (6ft+)', 'Extension Ladders', 'Tool Belt', 'Safety Equipment', 'Work Vehicle/Truck', 'Trailer'].map(tool => (
                  <div key={tool} className="checkbox-item" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      id={`tool-${tool}`}
                      checked={formData.tools?.includes(tool) || false}
                      onChange={(e) => {
                        const tools = formData.tools || [];
                        if (e.target.checked) {
                          setFormData({...formData, tools: [...tools, tool]});
                        } else {
                          setFormData({...formData, tools: tools.filter(t => t !== tool)});
                        }
                      }}
                    />
                    <label htmlFor={`tool-${tool}`}>{tool}</label>
                  </div>
                ))}
              </div>
              <textarea 
                className="form-field" 
                placeholder="List any other specialized tools or equipment you own..."
                value={formData.other_tools || ''} 
                onChange={e => setFormData({...formData, other_tools: e.target.value})}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginTop: '24px', borderTop: '2px solid #eee', paddingTop: '24px' }}>
              <label className="form-label">Work Preferences</label>
              <div className="form-row" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Preferred Work Radius (miles from home)</label>
                  <select className="form-field" value={formData.work_radius || ''} onChange={e => setFormData({...formData, work_radius: e.target.value})}>
                    <option value="">Select</option>
                    <option value="10">Up to 10 miles</option>
                    <option value="25">Up to 25 miles</option>
                    <option value="50">Up to 50 miles</option>
                    <option value="any">Anywhere in Phoenix Metro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px' }}>Availability</label>
                  <select className="form-field" value={formData.availability || ''} onChange={e => setFormData({...formData, availability: e.target.value})}>
                    <option value="">Select</option>
                    <option value="full-time">Full-time (40+ hrs/week)</option>
                    <option value="part-time">Part-time (20-30 hrs/week)</option>
                    <option value="weekends">Weekends only</option>
                    <option value="flexible">Flexible/On-call</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Desired Hourly Rate</label>
                <input className="form-field" type="number" placeholder="e.g. 35" value={formData.hourly_rate || ''} onChange={e => setFormData({...formData, hourly_rate: e.target.value})} style={{ maxWidth: '150px' }} />
                <span style={{ marginLeft: '8px', color: '#666' }}>$ / hour</span>
              </div>
            </div>
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
      case 'contractor_details': return formData.vehicle_year && formData.vehicle_make && formData.vehicle_model && formData.availability;
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
