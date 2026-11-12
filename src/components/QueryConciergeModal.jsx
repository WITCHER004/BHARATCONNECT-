import { useState } from 'react';
import {
  MessageSquare, X, Send, Search, Check, Copy, ExternalLink,
  HelpCircle, ChevronRight, ShieldCheck, AlertCircle
} from 'lucide-react';
import { generateQueryTicketId } from '../pages/QueryPage';

export default function QueryConciergeModal({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('quick'); // 'quick' | 'track' | 'success'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [ticketId, setTicketId] = useState('');
  const [copied, setCopied] = useState(false);

  // Quick lookup state
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    const newTicket = generateQueryTicketId();
    setTicketId(newTicket);

    try {
      const past = JSON.parse(localStorage.getItem('bc-queries') || '[]');
      past.unshift({
        id: newTicket,
        timestamp: new Date().toISOString(),
        fullName: name,
        email,
        category,
        message,
        dept: 'Secretariat Fast-Track Desk',
        status: 'Assigned to Protocol Officer',
        eta: '24 Hours',
      });
      localStorage.setItem('bc-queries', JSON.stringify(past));
    } catch { /* storage fallback */ }

    setMode('success');
  };

  const handleLookup = (e) => {
    e.preventDefault();
    const q = lookupId.trim().toUpperCase();
    if (!q) return;

    setSearched(true);
    const pastQueries = JSON.parse(localStorage.getItem('bc-queries') || '[]');
    const qMatch = pastQueries.find((item) => item.id.toUpperCase() === q || item.email?.toUpperCase() === q);
    if (qMatch) {
      setLookupResult({ title: qMatch.id, subtitle: qMatch.category, status: qMatch.status });
      return;
    }

    const pastStartups = JSON.parse(localStorage.getItem('bc-startup-history') || '[]');
    const sMatch = pastStartups.find((s) => s.id?.toUpperCase() === q || s.email?.toUpperCase() === q);
    if (sMatch) {
      setLookupResult({ title: sMatch.id, subtitle: sMatch.entityName, status: 'Accredited (2-Year Validity)' });
      return;
    }

    if (q === 'BMF.BC-SU-00001' || q.includes('00001')) {
      setLookupResult({ title: 'BMF.BC-SU-00001', subtitle: 'Startup Pavilion Pioneer', status: 'Verified & Confirmed' });
      return;
    }

    setLookupResult(null);
  };

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Secretariat Query Desk"
          className="group relative flex items-center gap-2.5 h-12 px-4 rounded-full bg-surface-0 border border-gold-foil/40 text-fg shadow-xl hover:border-gold-foil transition-colors duration-200 cursor-pointer motion-safe:active:scale-95"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse" />
          <MessageSquare className="w-4 h-4 text-gold-text" />
          <span className="text-xs font-semibold pr-1">
            Query desk
          </span>
        </button>
      </div>

      {/* Floating Query Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-22 sm:right-6 z-50 sm:w-[420px] max-h-[90vh] flex flex-col surface-card bg-surface-0/98 backdrop-blur-2xl rounded-2xl border border-line-strong shadow-2xl motion-safe:animate-slide-up overflow-hidden">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-surface-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-foil/15 border border-gold-foil/30 flex items-center justify-center text-gold-text">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-fg">Secretariat Helpdesk</h3>
                <p className="text-[11px] text-fg-3">BABC 2026 Concierge</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-3 hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader Modes */}
          <div className="flex border-b border-line text-xs font-medium">
            <button
              onClick={() => { setMode('quick'); }}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
                mode === 'quick' ? 'text-fg border-b-2 border-gold-foil bg-surface-2/40 font-semibold' : 'text-fg-3 hover:text-fg'
              }`}
            >
              Ask a Query
            </button>
            <button
              onClick={() => { setMode('track'); }}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
                mode === 'track' ? 'text-fg border-b-2 border-gold-foil bg-surface-2/40 font-semibold' : 'text-fg-3 hover:text-fg'
              }`}
            >
              Track ID / Ticket
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-sm">
            {mode === 'quick' && (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-fg-2 mb-1">Inquiry Department</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-surface-2 border border-line text-xs text-fg focus:outline-none focus:border-gold-foil cursor-pointer"
                  >
                    <option value="Startup Showcase">Startup Showcase (BMF.BC-SU)</option>
                    <option value="B2B Matchmaking">B2B Deal Rooms & Matchmaking</option>
                    <option value="Exhibition Stalls">Exhibition Stalls & Pavilions</option>
                    <option value="Diplomatic Protocol">Diplomatic Protocol & Visas</option>
                    <option value="General Inquiry">General Conclave Inquiry</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-fg-2 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg bg-surface-2 border border-line text-xs text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-2 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg bg-surface-2 border border-line text-xs text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-fg-2 mb-1">Your Query *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your inquiry or question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-2 border border-line text-xs text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary h-10 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer mt-1 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Query (Issue Ticket)
                </button>
              </form>
            )}

            {mode === 'track' && (
              <div className="space-y-4">
                <form onSubmit={handleLookup} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. BMF.BC-SU-00001 or BMF.BC-QRY-00001"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg bg-surface-2 border border-line text-xs font-mono text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                  />
                  <button type="submit" className="btn-primary h-9 px-3 text-xs font-semibold cursor-pointer">
                    Verify
                  </button>
                </form>

                {searched && (
                  <div>
                    {lookupResult ? (
                      <div className="p-3.5 rounded-xl bg-surface-2 border border-line-strong space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-fg">{lookupResult.title}</span>
                          <span className="text-[10px] text-positive bg-positive/10 border border-positive/20 px-2 py-0.5 rounded-full font-medium">
                            {lookupResult.status}
                          </span>
                        </div>
                        <p className="text-xs text-fg-2">{lookupResult.subtitle}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-fg-3 text-center py-4">No record found. Check the ID spelling or submit a query.</p>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-line text-xs text-fg-3">
                  <p>Tip: Enter your Startup Registration ID (<span className="font-mono text-gold-text">BMF.BC-SU-00001</span>) or ticket reference.</p>
                </div>
              </div>
            )}

            {mode === 'success' && (
              <div className="text-center py-4 space-y-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-fg text-surface-0 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium text-fg">Query Ticket Issued</h4>
                  <p className="text-xs text-fg-2 mt-1">Secretariat will respond to {email} within 24 hours.</p>
                </div>

                <div className="p-3 rounded-xl bg-surface-1 border border-gold-foil/40 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-fg">{ticketId}</span>
                  <button
                    onClick={() => handleCopy(ticketId)}
                    className="text-xs text-gold-text hover:text-fg font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <button
                  onClick={() => { setMode('quick'); setName(''); setEmail(''); setMessage(''); }}
                  className="btn-secondary h-8 px-4 text-xs cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer Link to Full Page */}
          <div className="p-3 bg-surface-1 border-t border-line flex items-center justify-between text-xs">
            <span className="text-fg-3">Need detailed assistance?</span>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate?.('query');
              }}
              className="text-gold-text hover:text-fg font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              Open Full Secretariat Desk
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
