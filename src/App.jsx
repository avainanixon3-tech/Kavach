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
  Sparkles, 
  Zap, 
  Flame, 
  AlertOctagon, 
  Terminal, 
  Search, 
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';

// Mock database of authorized Employee IDs
const AUTHORIZED_EMPLOYEES = {
  '987654': { name: 'Officer Vikram Singh', designation: 'Senior Loan Officer', branch: 'HDFC Mumbai Main', status: 'ACTIVE' },
  '123456': { name: 'Ananya Sharma', designation: 'Credit Analyst', branch: 'HDFC Bengaluru', status: 'ACTIVE' },
  '778899': { name: 'Rahul Verma', designation: 'Branch Manager', branch: 'HDFC Delhi Regional', status: 'ACTIVE' }
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
    text: 'Please attach your Aadhaar card or Bank Statement here. Kavach Sentinel will hold it until I verify.',
    time: '11:43 AM',
  }
];

export default function App() {
  // Navigation section scroll
  const sandboxRef = useRef(null);
  const howItWorksRef = useRef(null);
  const compareRef = useRef(null);
  const validatorRef = useRef(null);

  // Chat Perspective: 'user' (Customer) or 'agent' (Bank Agent)
  const [currentUser, setCurrentUser] = useState('user');
  
  // Message input state
  const [inputText, setInputText] = useState('');

  // Attachment state
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Verification Input state (for receiver in chat)
  const [employeeIdInputs, setEmployeeIdInputs] = useState({});
  const [verifyingIds, setVerifyingIds] = useState({});

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Chat message history
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const messagesEndRef = useRef(null);

  // Standalone ID Sandbox state
  const [sandboxIdInput, setSandboxIdInput] = useState('');
  const [sandboxResult, setSandboxResult] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showAttachMenu, selectedAttachment]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Sample sensitive documents
  const sampleDocuments = [
    {
      id: 'doc-aadhaar',
      name: 'Aadhaar_Card_UIDAI_Secure.pdf',
      size: '1.8 MB',
      type: 'Government ID',
      maskedNumber: 'XXXX-XXXX-8821',
      holder: 'Kavach Customer (Demo User)'
    },
    {
      id: 'doc-statement',
      name: 'Bank_Statement_6Months.pdf',
      size: '2.4 MB',
      type: 'Bank Financial Record',
      maskedNumber: 'AC: 5010049281928',
      holder: 'HDFC Savings Account'
    },
    {
      id: 'doc-pan',
      name: 'PAN_Card_Tax_Record.pdf',
      size: '950 KB',
      type: 'Income Tax Identification',
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
        // Success: Verified & Delivered
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
        // Failed: High Risk Blocked
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

  // Handle Standalone ID Sandbox Lookup
  const handleTestSandboxId = () => {
    if (!sandboxIdInput.trim()) return;
    const res = AUTHORIZED_EMPLOYEES[sandboxIdInput.trim()];
    if (res) {
      setSandboxResult({ status: 'SUCCESS', data: res, id: sandboxIdInput.trim() });
    } else {
      setSandboxResult({ status: 'FAILED', id: sandboxIdInput.trim() });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* =========================================================================
          1. TOP NAVIGATION
          ========================================================================= */}
      <div className="nb-nav-container">
        <nav className="nb-nav">
          <div className="nb-brand">
            <div className="nb-brand-badge">
              <Shield size={18} />
              <span>KAVACH</span>
            </div>
            <span className="nb-brand-title">SENTINEL</span>
          </div>

          <div className="nb-nav-links">
            <button 
              type="button" 
              className="nb-nav-link"
              onClick={() => scrollToSection(sandboxRef)}
            >
              ⚡ Live Demo
            </button>
            <button 
              type="button" 
              className="nb-nav-link"
              onClick={() => scrollToSection(howItWorksRef)}
            >
              📖 How It Works
            </button>
            <button 
              type="button" 
              className="nb-nav-link"
              onClick={() => scrollToSection(compareRef)}
            >
              ⚖️ Comparison
            </button>
            <button 
              type="button" 
              className="nb-nav-link"
              onClick={() => scrollToSection(validatorRef)}
            >
              🔍 ID Validator
            </button>
          </div>

          <button 
            type="button" 
            className="nb-btn-primary"
            onClick={() => scrollToSection(sandboxRef)}
          >
            LAUNCH APP 🚀
          </button>
        </nav>
      </div>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className="nb-hero">
        <div className="nb-hero-tag-row">
          <span className="nb-tag yellow">
            <Zap size={14} /> ZERO-LEAK PROTOCOL
          </span>
          <span className="nb-tag purple">
            <Lock size={14} /> IN-CHAT 6-DIGIT EMP AUTH
          </span>
          <span className="nb-tag green">
            <Flame size={14} /> HACKATHON MVP
          </span>
        </div>

        <h1 className="nb-hero-headline">
          KAVACH: THE ZERO-TRUST <br />
          <span className="nb-highlight-box">DOCUMENT HANDSHAKE</span>
        </h1>

        <p className="nb-hero-subheadline">
          Stop data leaks at the source with in-chat identity verification. 
          Don't just flag scammers—<strong>block the upload before transmission.</strong>
        </p>

        <div className="nb-hero-cta-group">
          <button 
            type="button" 
            className="nb-btn-hero-lg"
            onClick={() => scrollToSection(sandboxRef)}
          >
            <span>▶ TEST INTERACTIVE DEMO</span>
            <ArrowRight size={20} />
          </button>
          
          <button 
            type="button" 
            className="nb-btn-hero-secondary"
            onClick={() => scrollToSection(validatorRef)}
          >
            <span>🔍 TEST EMPLOYEE ID DATABASE</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          3. HAZARD MARQUEE BANNER
          ========================================================================= */}
      <div className="nb-marquee-wrap">
        <div className="nb-marquee-content">
          <div className="nb-marquee-item">⚡ 100% PRE-UPLOAD QUARANTINE</div>
          <div className="nb-marquee-item">🔒 ZERO DATA LEAKS TO SCAMMERS</div>
          <div className="nb-marquee-item">🛡️ 6-DIGIT EMPLOYEE ID VERIFICATION</div>
          <div className="nb-marquee-item">🚫 INSTANT FRAUD TRANSMISSION PURGE</div>
          <div className="nb-marquee-item">⚡ 100% PRE-UPLOAD QUARANTINE</div>
          <div className="nb-marquee-item">🔒 ZERO DATA LEAKS TO SCAMMERS</div>
          <div className="nb-marquee-item">🛡️ 6-DIGIT EMPLOYEE ID VERIFICATION</div>
          <div className="nb-marquee-item">🚫 INSTANT FRAUD TRANSMISSION PURGE</div>
        </div>
      </div>

      {/* =========================================================================
          4. INTERACTIVE LIVE CHAT SANDBOX (THE CORE KAVACH APP)
          ========================================================================= */}
      <section className="nb-sandbox-section" ref={sandboxRef}>
        <div className="nb-section-title-wrap">
          <span className="nb-section-tag">LIVE INTERACTIVE APP</span>
          <h2 className="nb-section-title">Kavach Sentinel In Action</h2>
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#475569', marginTop: '6px' }}>
            Try attaching a document as Customer, switch to Bank Agent, and test both Valid & Fraud IDs.
          </p>
        </div>

        {/* Neo-Brutalist Phone / Desktop Frame */}
        <div className="nb-chat-window-frame">
          {/* Retro Titlebar */}
          <div className="nb-window-titlebar">
            <div className="nb-window-dots">
              <span className="nb-dot red" />
              <span className="nb-dot yellow" />
              <span className="nb-dot green" />
            </div>
            <span className="nb-window-title">KAVACH_SENTINEL_v2.4.EXE</span>
            <span style={{ fontSize: '11px', fontWeight: '800' }}>[ONLINE]</span>
          </div>

          {/* Perspective Controller Strip */}
          <div className="nb-chat-control-strip">
            <div className="nb-role-tabs">
              <button 
                type="button"
                className={`nb-role-btn ${currentUser === 'user' ? 'active' : ''}`}
                onClick={() => setCurrentUser('user')}
              >
                👤 Sender (User)
              </button>
              <button 
                type="button"
                className={`nb-role-btn ${currentUser === 'agent' ? 'active' : ''}`}
                onClick={() => setCurrentUser('agent')}
              >
                🏦 Receiver (Bank Agent)
              </button>
            </div>

            <button 
              type="button" 
              className="nb-btn-reset-chat"
              onClick={handleResetDemo}
              title="Reset Chat"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Chat Header */}
          <div className="nb-chat-header">
            <div className="nb-chat-agent-info">
              <div className="nb-agent-avatar">
                <Building2 size={20} />
              </div>
              <div className="nb-agent-details">
                <h4>
                  HDFC Loan Desk
                  <ShieldCheck size={16} color="#059669" />
                </h4>
                <p>Officer Vikram • ID #987654</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="nb-chip-btn" title="Phone Call">
                <Phone size={14} />
              </button>
              <button className="nb-chip-btn" title="Options">
                <MoreVertical size={14} />
              </button>
            </div>
          </div>

          {/* Chat Stream Window */}
          <main className="nb-chat-feed">
            <div className="nb-date-divider">TODAY • ENCRYPTED SESSION</div>

            {messages.map((msg) => {
              const isMe = msg.sender === currentUser;

              // 1. Security Hold & Verification Resolution Cards
              if (msg.type === 'security_hold') {
                const currentStatus = msg.status;

                return (
                  <div key={msg.id} className="nb-msg-row system">
                    
                    {/* STATE A: PENDING SECURITY HOLD */}
                    {currentStatus === 'HOLD_PENDING_VERIFICATION' && (
                      <div className="nb-hold-card">
                        <div className="nb-hold-header">
                          <div className="nb-hold-title">
                            <ShieldAlert size={18} />
                            <span>SECURITY HOLD TRIGGERED</span>
                          </div>
                          <span className="nb-badge-paused">UPLOAD PAUSED</span>
                        </div>

                        {/* File Chip */}
                        <div className="nb-hold-file-chip">
                          <div className="nb-hold-file-icon">
                            <FileText size={18} color="#f43f5e" />
                          </div>
                          <div className="nb-hold-file-meta">
                            <h5>{msg.document.name}</h5>
                            <p>{msg.document.type} • {msg.document.size}</p>
                          </div>
                        </div>

                        {msg.customNote && (
                          <p style={{ fontSize: '12px', fontWeight: '700', padding: '0 2px' }}>
                            💬 "{msg.customNote}"
                          </p>
                        )}

                        <div className="nb-hold-warning">
                          ⚠️ <strong>Pre-Upload Quarantine:</strong> This document is locked on the sender device. The receiver must provide their 6-digit Employee ID to authorize transfer.
                        </div>

                        {/* In-Chat Challenge Box */}
                        <div className="nb-challenge-box">
                          <div className="nb-challenge-head">
                            <KeyRound size={15} />
                            <span>Receiver Verification Challenge</span>
                          </div>

                          <p className="nb-challenge-instruction">
                            🔔 <em>"Secure Document pending. Please enter your 6-digit Employee ID to unlock."</em>
                          </p>

                          {/* Bank Agent View (Interactive Input) */}
                          {currentUser === 'agent' ? (
                            <div>
                              <div className="nb-challenge-input-row">
                                <input
                                  type="text"
                                  className="nb-id-input"
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
                                  className="nb-btn-unlock"
                                  disabled={
                                    verifyingIds[msg.id] ||
                                    (employeeIdInputs[msg.id] || '').length < 6
                                  }
                                  onClick={() => handleVerifyEmployeeId(msg.id)}
                                >
                                  {verifyingIds[msg.id] ? (
                                    <>
                                      <Loader2 size={14} className="spin" /> Checking...
                                    </>
                                  ) : (
                                    <>
                                      Unlock <ArrowRight size={13} />
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Fast-Fill Demo Chips */}
                              <div className="nb-fast-chips">
                                <span>Fast-Fill:</span>
                                <button
                                  type="button"
                                  className="nb-chip-btn"
                                  style={{ background: '#dcfce7' }}
                                  onClick={() =>
                                    setEmployeeIdInputs({
                                      ...employeeIdInputs,
                                      [msg.id]: '987654'
                                    })
                                  }
                                >
                                  987654 (Valid Officer)
                                </button>
                                <button
                                  type="button"
                                  className="nb-chip-btn"
                                  style={{ background: '#ffe4e6' }}
                                  onClick={() =>
                                    setEmployeeIdInputs({
                                      ...employeeIdInputs,
                                      [msg.id]: '111222'
                                    })
                                  }
                                >
                                  111222 (Scammer ID)
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Customer View (Waiting indicator) */
                            <div className="nb-waiting-prompt">
                              <Clock size={15} style={{ flexShrink: 0 }} />
                              <span>
                                Waiting for <strong>Officer Vikram</strong> to enter verified Employee ID. (Switch tab to <strong>Bank Agent</strong> above to simulate entering ID!)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STATE B: VERIFIED RESOLUTION */}
                    {currentStatus === 'VERIFIED' && (
                      <div className="nb-resolution-success">
                        <div className="nb-res-head">
                          <div className="nb-res-badge-success">
                            <CheckCircle2 size={18} />
                            <span>Identity Verified</span>
                          </div>
                          <span className="nb-tag green" style={{ padding: '2px 8px', fontSize: '10px' }}>
                            PASSED ✓
                          </span>
                        </div>

                        <div className="nb-delivered-file-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileCheck size={22} color="#059669" />
                            <div>
                              <h5 style={{ fontSize: '13px', fontWeight: '800' }}>{msg.document.name}</h5>
                              <p style={{ fontSize: '11px', fontWeight: '700', color: '#047857' }}>
                                {msg.document.size} • Verified to ID #{msg.attemptedId}
                              </p>
                            </div>
                          </div>

                          <button 
                            type="button" 
                            className="nb-btn-view-doc"
                            onClick={() => setPreviewDoc(msg.document)}
                          >
                            <Eye size={13} /> View
                          </button>
                        </div>

                        {msg.customNote && (
                          <p style={{ fontSize: '12px', fontWeight: '700' }}>
                            💬 Note: "{msg.customNote}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* STATE C: FRAUD FAILED RESOLUTION */}
                    {currentStatus === 'REJECTED' && (
                      <div className="nb-resolution-failed">
                        <div className="nb-res-head">
                          <div className="nb-res-badge-failed">
                            <XCircle size={18} />
                            <span>Verification Failed - High Risk</span>
                          </div>
                          <span className="nb-tag" style={{ background: '#f43f5e', color: '#fff', padding: '2px 8px', fontSize: '10px' }}>
                            BLOCKED ⛔
                          </span>
                        </div>

                        <div className="nb-failed-box">
                          🚨 Employee ID <code>#{msg.attemptedId}</code> was not found in the bank database. Document upload permanently blocked and wiped.
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
                  className={`nb-msg-row ${msg.sender === 'user' ? 'user' : 'agent'}`}
                >
                  <span className="nb-msg-sender">
                    {msg.senderName}
                  </span>
                  <div className="nb-msg-bubble">
                    <p>{msg.text}</p>
                    <div className="nb-msg-meta">
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck size={14} />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </main>

          {/* Attachment Popup Drawer */}
          {showAttachMenu && (
            <div className="nb-attach-popup">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                  Select Sensitive File to Simulate
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowAttachMenu(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                >
                  <X size={16} />
                </button>
              </div>

              {sampleDocuments.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className="nb-attach-opt-btn"
                  onClick={() => handleSelectDocument(doc)}
                >
                  <div style={{ width: '28px', height: '28px', background: '#ffe4e6', border: '1.5px solid #000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} color="#f43f5e" />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '12px', fontWeight: '800' }}>{doc.name}</h5>
                    <p style={{ fontSize: '10.5px', fontWeight: '600', color: '#64748b' }}>{doc.type} • {doc.size}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chat Footer / Input */}
          <footer className="nb-chat-footer">
            {selectedAttachment && (
              <div style={{ background: '#fef08a', border: '2px solid #000', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} />
                  <span>{selectedAttachment.name} ({selectedAttachment.size})</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedAttachment(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <form className="nb-input-group" onSubmit={handleSendMessage}>
              <button
                type="button"
                className="nb-btn-attach"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                title="Attach Document"
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                className="nb-chat-input-field"
                placeholder={
                  selectedAttachment 
                    ? "Add a note with document..." 
                    : `Message as ${currentUser === 'user' ? 'Customer' : 'Bank Agent'}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                type="submit"
                className="nb-btn-send"
                disabled={!inputText.trim() && !selectedAttachment}
                title="Send"
              >
                <Send size={15} />
              </button>
            </form>
          </footer>
        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS (3-STEP ENGINE)
          ========================================================================= */}
      <section className="nb-how-it-works-grid" ref={howItWorksRef}>
        <div className="nb-step-card" style={{ background: '#fef08a' }}>
          <span className="nb-step-num">STEP 01</span>
          <h3>PRE-UPLOAD INTERCEPT</h3>
          <p>
            When a user attaches an Aadhaar or Bank Statement, Kavach holds the document on client-side quarantine instead of blasting it over the wire.
          </p>
          <div className="nb-tag yellow" style={{ alignSelf: 'flex-start' }}>0 Data Exposure</div>
        </div>

        <div className="nb-step-card" style={{ background: '#cffafe' }}>
          <span className="nb-step-num">STEP 02</span>
          <h3>IN-CHAT ID CHALLENGE</h3>
          <p>
            An automated verification challenge is issued directly to the receiver in the chat: <em>"Enter your 6-digit Employee ID to unlock."</em>
          </p>
          <div className="nb-tag green" style={{ alignSelf: 'flex-start' }}>Zero-Trust Handshake</div>
        </div>

        <div className="nb-step-card" style={{ background: '#fce7f3' }}>
          <span className="nb-step-num">STEP 03</span>
          <h3>UNLOCK OR PERMANENT PURGE</h3>
          <p>
            Valid IDs release the decrypted document to the authorized officer. Fake or scammer IDs trigger an instant permanent block and session quarantine.
          </p>
          <div className="nb-tag" style={{ background: '#f43f5e', color: '#fff', alignSelf: 'flex-start' }}>Anti-Scam Defense</div>
        </div>
      </section>

      {/* =========================================================================
          6. COMPARISON MATRIX: TRADITIONAL APPS VS KAVACH
          ========================================================================= */}
      <section className="nb-compare-section" ref={compareRef}>
        <div className="nb-section-title-wrap">
          <span className="nb-section-tag">SECURITY PARADIGM</span>
          <h2 className="nb-section-title">Traditional Chat vs Kavach Sentinel</h2>
        </div>

        <div className="nb-compare-table-wrap">
          <table className="nb-compare-table">
            <thead>
              <tr>
                <th>Feature / Security Vector</th>
                <th>Traditional Chat (WhatsApp/Telegram)</th>
                <th>Kavach Protocol</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Document Upload Behavior</strong></td>
                <td style={{ color: '#dc2626' }}>❌ Sent immediately to receiver</td>
                <td style={{ color: '#16a34a' }}>✅ Paused in client-side quarantine</td>
              </tr>
              <tr>
                <td><strong>Receiver Identity Verification</strong></td>
                <td style={{ color: '#dc2626' }}>❌ None (relies on profile photo/name)</td>
                <td style={{ color: '#16a34a' }}>✅ Mandatory 6-digit verified Employee ID</td>
              </tr>
              <tr>
                <td><strong>Impersonation Attack Defense</strong></td>
                <td style={{ color: '#dc2626' }}>❌ Scammer receives full Aadhaar/PAN</td>
                <td style={{ color: '#16a34a' }}>✅ Transfer destroyed on failed lookup</td>
              </tr>
              <tr>
                <td><strong>Verification Location</strong></td>
                <td>External SMS OTP / Third-party link</td>
                <td><strong>Directly inside the active chat stream</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          7. STANDALONE EMPLOYEE ID VALIDATOR SANDBOX
          ========================================================================= */}
      <section className="nb-compare-section" ref={validatorRef}>
        <div className="nb-section-title-wrap">
          <span className="nb-section-tag">DATABASE CHECK ENGINE</span>
          <h2 className="nb-section-title">Live Employee ID Query Engine</h2>
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#475569' }}>
            Test the mock database directly with any 6-digit ID to see how Kavach authenticates bank personnel.
          </p>
        </div>

        <div style={{ background: '#fff', border: '4px solid #000', borderRadius: '18px', padding: '24px', boxShadow: '8px 8px 0px #000', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text"
              maxLength={6}
              placeholder="Type 6-digit ID (e.g. 987654 or 123456)"
              className="nb-id-input"
              value={sandboxIdInput}
              onChange={(e) => setSandboxIdInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTestSandboxId(); }}
            />
            <button 
              type="button"
              className="nb-btn-primary"
              onClick={handleTestSandboxId}
            >
              QUERY DB ⚡
            </button>
          </div>

          {/* Quick Helper buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800' }}>Quick Test:</span>
            <button className="nb-chip-btn" style={{ background: '#dcfce7' }} onClick={() => { setSandboxIdInput('987654'); }}>987654 (Vikram)</button>
            <button className="nb-chip-btn" style={{ background: '#dcfce7' }} onClick={() => { setSandboxIdInput('123456'); }}>123456 (Ananya)</button>
            <button className="nb-chip-btn" style={{ background: '#ffe4e6' }} onClick={() => { setSandboxIdInput('000999'); }}>000999 (Scammer)</button>
          </div>

          {/* Sandbox Query Result */}
          {sandboxResult && (
            <div style={{ marginTop: '20px', animation: 'nbPop 0.2s ease-out' }}>
              {sandboxResult.status === 'SUCCESS' ? (
                <div style={{ background: '#dcfce7', border: '3px solid #000', borderRadius: '10px', padding: '14px', boxShadow: '4px 4px 0px #000' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#065f46', fontSize: '15px' }}>
                    <CheckCircle2 size={20} />
                    <span>AUTHENTICATED RECORD FOUND (ID #{sandboxResult.id})</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13.5px', fontWeight: '700', color: '#047857' }}>
                    <p>• Officer Name: <strong>{sandboxResult.data.name}</strong></p>
                    <p>• Designation: {sandboxResult.data.designation}</p>
                    <p>• Branch Desk: {sandboxResult.data.branch}</p>
                    <p>• Status: <span style={{ background: '#22c55e', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>VERIFIED ACTIVE</span></p>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#ffe4e6', border: '3px solid #000', borderRadius: '10px', padding: '14px', boxShadow: '4px 4px 0px #000' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#9f1239', fontSize: '15px' }}>
                    <XCircle size={20} />
                    <span>FRAUD RISK: ID #{sandboxResult.id} NOT RECOGNIZED</span>
                  </div>
                  <p style={{ marginTop: '6px', fontSize: '13px', fontWeight: '700', color: '#881337' }}>
                    This Employee ID is not present in the bank repository. Kavach automatically wipes the upload stream and triggers a safety quarantine.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          8. DOCUMENT PREVIEW MODAL
          ========================================================================= */}
      {previewDoc && (
        <div className="nb-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="nb-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #000', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '16px' }}>
                <FileCheck size={20} color="#059669" />
                <span>DECRYPTED DOCUMENT</span>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '800' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="nb-doc-preview-sheet">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                <FileCheck size={24} color="#059669" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{previewDoc.name}</h4>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857' }}>✓ AUTHENTICATED ATTESTATION</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                <span>Category:</span>
                <span>{previewDoc.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                <span>Issued Holder:</span>
                <span>{previewDoc.holder}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                <span>Identifier:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{previewDoc.maskedNumber}</span>
              </div>
            </div>

            <button 
              type="button"
              className="nb-btn-hero-lg"
              style={{ justifyContent: 'center', padding: '12px', fontSize: '15px' }}
              onClick={() => {
                alert(`Downloaded ${previewDoc.name}`);
                setPreviewDoc(null);
              }}
            >
              <Download size={16} /> Download Verified Copy
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. NEO-BRUTALIST FOOTER
          ========================================================================= */}
      <footer className="nb-footer">
        <div className="nb-footer-container">
          <div className="nb-footer-top">
            <div>
              <div className="nb-footer-brand">⚡ KAVACH PROTOCOL</div>
              <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600', marginTop: '6px', maxWidth: '400px' }}>
                Zero-Trust In-Chat Document Verification Protocol. Stopping identity theft before the file ever reaches the scammer.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href="https://github.com/avainanixon3-tech/Kavach" 
                target="_blank" 
                rel="noreferrer" 
                className="nb-btn-primary" 
                style={{ background: '#fff', color: '#000' }}
              >
                <span>GitHub Repository</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="nb-footer-bottom">
            <span>© 2026 Kavach Security Protocol. Built for Hackathon Excellence.</span>
            <span style={{ background: '#22c55e', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
              ALL SYSTEMS SECURED
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
