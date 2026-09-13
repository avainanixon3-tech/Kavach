import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Send, 
  CheckCheck, 
  Phone, 
  MoreVertical, 
  Building2,
  Paperclip,
  FileText,
  X,
  ShieldAlert,
  KeyRound,
  Loader2,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  FileCheck,
  Download,
  Shield,
  Lock,
  ArrowLeft,
  Sparkles,
  UserCheck
} from 'lucide-react';

// Mock database of authorized Employee IDs
const AUTHORIZED_EMPLOYEES = {
  '987654': { name: 'Officer Vikram Singh', designation: 'Senior Loan Officer', branch: 'HDFC Mumbai' },
  '123456': { name: 'Ananya Sharma', designation: 'Credit Analyst', branch: 'HDFC Bengaluru' },
  '778899': { name: 'Rahul Verma', designation: 'Branch Manager', branch: 'HDFC Delhi' }
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    type: 'text',
    sender: 'agent',
    senderName: 'Officer Vikram (Bank Agent)',
    text: 'Hello! I am Officer Vikram from HDFC Loan Verification Desk. How can I assist you today?',
    time: '11:40 AM',
  },
  {
    id: 2,
    type: 'text',
    sender: 'user',
    senderName: 'You (Customer)',
    text: 'Hi Officer Vikram, I am applying for the home loan and need to submit my KYC documents.',
    time: '11:42 AM',
  },
  {
    id: 3,
    type: 'text',
    sender: 'agent',
    senderName: 'Officer Vikram (Bank Agent)',
    text: 'Please attach your Aadhaar card or Bank Statement here for verification.',
    time: '11:43 AM',
  }
];

export default function App() {
  // Screen state: 'hero' (Landing Page) or 'chat' (Live Chat Interface)
  const [activeView, setActiveView] = useState('hero');

  // Perspective state: 'user' (Customer) or 'agent' (Bank Agent)
  const [currentUser, setCurrentUser] = useState('user');
  
  // Message input state
  const [inputText, setInputText] = useState('');

  // Attachment state
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Verification Input state (for receiver)
  const [employeeIdInputs, setEmployeeIdInputs] = useState({});
  const [verifyingIds, setVerifyingIds] = useState({});

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Chat message history
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeView === 'chat') {
      scrollToBottom();
    }
  }, [messages, showAttachMenu, selectedAttachment, activeView]);

  // Reset Demo to initial clean state
  const handleResetDemo = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText('');
    setSelectedAttachment(null);
    setShowAttachMenu(false);
    setEmployeeIdInputs({});
    setVerifyingIds({});
    setPreviewDoc(null);
  };

  // Sample sensitive documents for simulation
  const sampleDocuments = [
    {
      id: 'doc-aadhaar',
      name: 'Aadhaar_Card_UIDAI.pdf',
      size: '1.8 MB',
      type: 'Government ID',
      maskedNumber: 'XXXX-XXXX-8821',
      holder: 'Kavach Customer (Demo User)'
    },
    {
      id: 'doc-statement',
      name: 'Bank_Statement_6Months.pdf',
      size: '2.4 MB',
      type: 'Bank Statement',
      maskedNumber: 'AC: 5010049281928',
      holder: 'HDFC Savings Account'
    },
    {
      id: 'doc-pan',
      name: 'PAN_Card.pdf',
      size: '950 KB',
      type: 'Tax Document',
      maskedNumber: 'ABCDE1234F',
      holder: 'Income Tax Dept.'
    }
  ];

  const handleSelectDocument = (doc) => {
    setSelectedAttachment(doc);
    setShowAttachMenu(false);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();

    // If an attachment is selected, trigger the Security Hold
    if (selectedAttachment) {
      const securityHoldMessage = {
        id: Date.now(),
        type: 'security_hold',
        sender: currentUser,
        senderName: currentUser === 'user' ? 'You (Customer)' : 'Officer Vikram (Bank Agent)',
        document: selectedAttachment,
        customNote: inputText.trim() || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'HOLD_PENDING_VERIFICATION' // PENDING | VERIFIED | REJECTED
      };

      setMessages((prev) => [...prev, securityHoldMessage]);
      setSelectedAttachment(null);
      setInputText('');
      return;
    }

    // Normal text message
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      type: 'text',
      sender: currentUser,
      senderName: currentUser === 'user' ? 'You (Customer)' : 'Officer Vikram (Bank Agent)',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mock Backend Verification Check
  const handleVerifyEmployeeId = async (msgId) => {
    const inputId = (employeeIdInputs[msgId] || '').trim();
    if (!inputId) return;

    setVerifyingIds((prev) => ({ ...prev, [msgId]: true }));

    setTimeout(() => {
      setVerifyingIds((prev) => ({ ...prev, [msgId]: false }));

      const matchedEmployee = AUTHORIZED_EMPLOYEES[inputId];

      if (matchedEmployee) {
        // Success: Verified & Unlocked
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId
              ? { 
                  ...msg, 
                  status: 'VERIFIED', 
                  verifiedOfficer: matchedEmployee, 
                  attemptedId: inputId,
                  verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              : msg
          )
        );
      } else {
        // Failed: High Risk Block
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId
              ? { 
                  ...msg, 
                  status: 'REJECTED', 
                  attemptedId: inputId,
                  rejectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              : msg
          )
        );
      }
    }, 650);
  };

  // =========================================================================
  // VIEW 1: HERO SECTION / LANDING PAGE
  // =========================================================================
  if (activeView === 'hero') {
    return (
      <div className="landing-page">
        {/* Navigation */}
        <header className="landing-nav">
          <div className="brand-logo">
            <div className="brand-icon-box">
              <Shield size={20} />
            </div>
            <span>Kavach</span>
          </div>

          <div className="nav-status-badge">
            <span className="pulse-dot"></span>
            Enterprise Security Active
          </div>
        </header>

        {/* Hero Section */}
        <main className="hero-container">
          <div className="hero-pill-tag">
            <Sparkles size={14} color="#06b6d4" />
            <span>Next-Generation Zero-Leak Messaging</span>
          </div>

          <h1 className="hero-headline">
            Kavach: The Secure Enterprise <br />
            <span className="headline-gradient">Document Handshake</span>
          </h1>

          <p className="hero-subheadline">
            Stop data leaks at the source with in-chat identity verification. Don't just flag scammers—block the upload.
          </p>

          <div className="cta-button-wrapper">
            <button 
              type="button" 
              className="btn-launch-demo"
              onClick={() => setActiveView('chat')}
            >
              <span>Launch Live Demo</span>
              <ArrowRight size={18} />
            </button>
            <span className="cta-micro-note">
              <Lock size={12} /> Interactive Client-Side Simulation • No Signup Required
            </span>
          </div>

          {/* Value Props Grid */}
          <div className="hero-features-grid">
            <div className="hero-feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
                <ShieldCheck size={18} />
              </div>
              <h4>Zero-Leak Upload Pause</h4>
              <p>Sensitive IDs and statements are held in client quarantine before transmission.</p>
            </div>

            <div className="hero-feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <KeyRound size={18} />
              </div>
              <h4>In-Chat Verification</h4>
              <p>Receivers must supply their verified Employee ID directly inside the active chat stream.</p>
            </div>

            <div className="hero-feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <ShieldAlert size={18} />
              </div>
              <h4>Instant Fraud Quarantine</h4>
              <p>Unrecognized employee IDs trigger a permanent block and erase the transmission stream.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LIVE CHAT INTERFACE
  // =========================================================================
  return (
    <div className="app-viewport">
      {/* Top Controller Bar */}
      <div className="control-bar">
        <button 
          type="button" 
          className="back-to-hero-btn"
          onClick={() => setActiveView('hero')}
          title="Return to Landing Page"
        >
          <ArrowLeft size={13} /> Overview
        </button>

        <div className="perspective-toggle">
          <button 
            type="button"
            className={`perspective-btn ${currentUser === 'user' ? 'active' : ''}`}
            onClick={() => setCurrentUser('user')}
          >
            👤 User
          </button>
          <button 
            type="button"
            className={`perspective-btn ${currentUser === 'agent' ? 'active agent' : ''}`}
            onClick={() => setCurrentUser('agent')}
          >
            🏦 Bank Agent
          </button>
        </div>

        <button 
          type="button" 
          className="reset-demo-btn" 
          onClick={handleResetDemo}
          title="Reset conversation"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Mobile Device Frame */}
      <div className="mobile-device">
        {/* Clean Header */}
        <header className="phone-header">
          <div className="header-left">
            <div className="avatar-wrapper">
              <div className="avatar bank">
                <Building2 size={20} />
              </div>
              <div className="online-indicator" />
            </div>
            <div className="chat-details">
              <h2>
                HDFC Loan Desk
                <ShieldCheck size={16} className="verified-icon" />
              </h2>
              <p>
                Officer Vikram • HDFC Bank
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn-header" title="Voice Call">
              <Phone size={15} />
            </button>
            <button className="icon-btn-header" title="Options">
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        {/* Chat History Window */}
        <main className="chat-window">
          <div className="date-divider">Today</div>

          {messages.map((msg) => {
            const isMe = msg.sender === currentUser;

            // 1. Security Hold & Verification Resolution Cards
            if (msg.type === 'security_hold') {
              const currentStatus = msg.status;

              return (
                <div key={msg.id} className="message-row system">
                  {/* PENDING SECURITY HOLD */}
                  {currentStatus === 'HOLD_PENDING_VERIFICATION' && (
                    <div className="security-hold-card">
                      <div className="security-hold-header">
                        <div className="security-hold-title">
                          <ShieldAlert size={18} color="#f59e0b" />
                          <span>Security Verification Required</span>
                        </div>
                        <span className="security-badge-pill">PAUSED</span>
                      </div>

                      <div className="security-hold-body">
                        <div className="file-hold-info">
                          <div className="file-icon-box">
                            <FileText size={18} />
                          </div>
                          <div className="file-text-details">
                            <h4>{msg.document.name}</h4>
                            <p>{msg.document.type} • {msg.document.size}</p>
                          </div>
                        </div>

                        {msg.customNote && (
                          <p style={{ fontSize: '12px', color: '#cbd5e1', padding: '1px 2px' }}>
                            💬 Note: "{msg.customNote}"
                          </p>
                        )}

                        <div className="hold-warning-text">
                          This sensitive document is held securely. The receiver must enter their verified Employee ID to unlock it.
                        </div>

                        {/* Verification Gate Prompt */}
                        <div className="verification-gate-box">
                          <div className="verification-prompt-header">
                            <KeyRound size={15} />
                            <span>Receiver Verification</span>
                          </div>

                          <p className="verification-instruction">
                            🔔 <em>"Secure Document pending. Please enter your 6-digit Employee ID to unlock."</em>
                          </p>

                          {/* Bank Agent View */}
                          {currentUser === 'agent' ? (
                            <div>
                              <div className="verification-input-group">
                                <input
                                  type="text"
                                  className="id-input-field"
                                  maxLength={6}
                                  placeholder="Enter 6-digit ID"
                                  value={employeeIdInputs[msg.id] || ''}
                                  onChange={(e) =>
                                    setEmployeeIdInputs({
                                      ...employeeIdInputs,
                                      [msg.id]: e.target.value.replace(/\D/g, '')
                                    })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleVerifyEmployeeId(msg.id);
                                  }}
                                />
                                <button
                                  type="button"
                                  className="verify-submit-btn"
                                  disabled={
                                    verifyingIds[msg.id] ||
                                    (employeeIdInputs[msg.id] || '').length < 6
                                  }
                                  onClick={() => handleVerifyEmployeeId(msg.id)}
                                >
                                  {verifyingIds[msg.id] ? (
                                    <>
                                      <Loader2 size={14} className="spin" /> Verifying...
                                    </>
                                  ) : (
                                    <>
                                      Unlock <ArrowRight size={13} />
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Quick demo helper chips */}
                              <div className="demo-id-chips">
                                <span>Demo Fast-Fill:</span>
                                <button
                                  type="button"
                                  className="demo-chip"
                                  onClick={() =>
                                    setEmployeeIdInputs({
                                      ...employeeIdInputs,
                                      [msg.id]: '987654'
                                    })
                                  }
                                  title="Valid Employee ID for Officer Vikram"
                                >
                                  987654 (Valid)
                                </button>
                                <button
                                  type="button"
                                  className="demo-chip"
                                  onClick={() =>
                                    setEmployeeIdInputs({
                                      ...employeeIdInputs,
                                      [msg.id]: '111222'
                                    })
                                  }
                                  title="Invalid ID to test rejection"
                                >
                                  111222 (Invalid)
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Customer View */
                            <div className="user-waiting-box">
                              <Clock size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
                              <span>
                                Waiting for <strong>Officer Vikram</strong> to enter verified Employee ID. (Switch to <strong>Bank Agent</strong> view at the top to simulate entering the ID!)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="hold-meta">
                          <span>Sent by {msg.senderName}</span>
                          <span>{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HIGH-CONTRAST GREEN VERIFICATION BLOCK */}
                  {currentStatus === 'VERIFIED' && (
                    <div className="resolution-success-card">
                      <div className="resolution-success-header">
                        <div className="success-badge">
                          <CheckCircle2 size={20} color="#34d399" />
                          <span>Identity Verified</span>
                        </div>
                      </div>

                      {/* File Attachment Card */}
                      <div className="decrypted-file-box">
                        <div className="file-left-side">
                          <div className="file-icon-success">
                            <FileCheck size={20} />
                          </div>
                          <div className="file-meta-success">
                            <h4>{msg.document.name}</h4>
                            <p>{msg.document.type} • {msg.document.size}</p>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          className="preview-file-btn"
                          onClick={() => setPreviewDoc(msg.document)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>

                      {msg.customNote && (
                        <p style={{ fontSize: '12.5px', color: '#e2e8f0', padding: '0 4px' }}>
                          💬 Note: "{msg.customNote}"
                        </p>
                      )}

                      <div className="hold-meta" style={{ color: '#a7f3d0' }}>
                        <span>Verified & Delivered</span>
                        <span>{msg.verifiedAt || msg.time}</span>
                      </div>
                    </div>
                  )}

                  {/* FAILED RESOLUTION (HIGH RISK BLOCK) */}
                  {currentStatus === 'REJECTED' && (
                    <div className="resolution-failure-card">
                      <div className="resolution-failure-header">
                        <div className="failure-badge">
                          <XCircle size={18} color="#fb7185" />
                          <span>Verification Failed - High Risk</span>
                        </div>
                      </div>

                      <div className="failure-warning-box">
                        Employee ID #{msg.attemptedId} was not recognized. Document transfer blocked for safety.
                      </div>

                      <div className="destroyed-file-chip">
                        <ShieldAlert size={15} color="#f43f5e" />
                        <span>{msg.document.name} (Blocked)</span>
                      </div>

                      <div className="hold-meta" style={{ color: '#fda4af' }}>
                        <span>Transfer Blocked</span>
                        <span>{msg.rejectedAt || msg.time}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 2. Standard Text Message
            return (
              <div 
                key={msg.id} 
                className={`message-row ${msg.sender === 'user' ? 'user' : 'agent'}`}
              >
                <span className="message-sender-name">
                  {msg.senderName}
                </span>
                <div className="bubble">
                  <p>{msg.text}</p>
                  <div className="bubble-meta">
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck size={14} color="#38bdf8" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        {/* Attachment Options Dropdown Menu */}
        {showAttachMenu && (
          <div className="attach-menu-dropdown">
            <div className="attach-menu-title">
              <span>Select Document to Attach</span>
              <button 
                type="button" 
                onClick={() => setShowAttachMenu(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="attach-options-grid">
              {sampleDocuments.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className="attach-option-btn"
                  onClick={() => handleSelectDocument(doc)}
                >
                  <div className="attach-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    <FileText size={18} />
                  </div>
                  <div className="attach-option-info">
                    <h5>{doc.name}</h5>
                    <p>{doc.type} • {doc.size}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="document-modal-overlay" onClick={() => setPreviewDoc(null)}>
            <div className="document-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FileCheck size={18} color="#10b981" /> Document Preview
                </h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setPreviewDoc(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="document-mock-sheet">
                <div className="watermark">VERIFIED</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                  <FileCheck size={22} color="#10b981" />
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#f8fafc' }}>{previewDoc.name}</h4>
                    <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>✓ Verified Document</span>
                  </div>
                </div>

                <div className="doc-sheet-row">
                  <span className="label">Category:</span>
                  <span className="val">{previewDoc.type}</span>
                </div>
                <div className="doc-sheet-row">
                  <span className="label">Holder:</span>
                  <span className="val">{previewDoc.holder}</span>
                </div>
                <div className="doc-sheet-row">
                  <span className="label">Document ID:</span>
                  <span className="val">{previewDoc.maskedNumber}</span>
                </div>
              </div>

              <button 
                type="button"
                className="verify-submit-btn"
                style={{ justifyContent: 'center' }}
                onClick={() => {
                  alert(`Downloaded ${previewDoc.name}`);
                  setPreviewDoc(null);
                }}
              >
                <Download size={15} /> Download Document
              </button>
            </div>
          </div>
        )}

        {/* Chat Input Footer */}
        <footer className="chat-footer">
          {selectedAttachment && (
            <div className="attachment-preview-bar">
              <div className="attachment-preview-left">
                <FileText size={15} color="#f59e0b" />
                <span>
                  <strong>{selectedAttachment.name}</strong> ({selectedAttachment.size})
                </span>
              </div>
              <button 
                type="button" 
                className="remove-attach-btn"
                onClick={() => setSelectedAttachment(null)}
                title="Remove attachment"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <form className="input-container" onSubmit={handleSendMessage}>
            <button
              type="button"
              className={`attach-trigger-btn ${showAttachMenu || selectedAttachment ? 'active' : ''}`}
              title="Attach Document"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              className="chat-input"
              placeholder={
                selectedAttachment 
                  ? "Add an optional note with document..." 
                  : `Message as ${currentUser === 'user' ? 'Customer' : 'Bank Agent'}...`
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button 
              type="submit" 
              className="send-btn" 
              disabled={!inputText.trim() && !selectedAttachment}
              title="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
