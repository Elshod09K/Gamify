import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Btn from '../components/ui/Btn';

interface AgentTabProps {
  state: AppState;
  onApplyMutation: (mut: any) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  mutationApplied?: boolean;
}

const QUICK_PROMPTS = [
  { label: "📋 Audit stats", prompt: "Review my current stats and levels, and suggest which areas I need to prioritize to maintain balance." },
  { label: "⚡ Optimize habits", prompt: "Look at my daily habits checklist and current phase. Suggest adjustments for maximum morning productivity." },
  { label: "🧪 Startup validation", prompt: "Here is my startup name and idea. Suggest three quick, scientific validation experiments I can log." },
  { label: "💰 Budget check", prompt: "Analyze my inflows and outflows. Suggest how I can reach my war chest savings goal faster." }
];

export function AgentTab({ state, onApplyMutation }: AgentTabProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic_api_key') || '');
  const [showSettings, setShowSettings] = useState(!apiKey);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('agent_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        content: "Greetings, Founder. I am your integrated System Agent. I analyze your gamified metrics and can perform safe mutations on your stats, quests, and logs. How shall we optimize your path today?"
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem('agent_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('anthropic_api_key', apiKey.trim());
    setShowSettings(false);
    alert("Anthropic API key saved locally!");
  };

  const handleClearHistory = () => {
    if (confirm("Reset conversation history?")) {
      const defaultMsg: Message[] = [
        {
          role: 'assistant',
          content: "Greetings, Founder. I am your integrated System Agent. I analyze your gamified metrics and can perform safe mutations on your stats, quests, and logs. How shall we optimize your path today?"
        }
      ];
      setMessages(defaultMsg);
    }
  };

  const sendToClaude = async (userPrompt: string) => {
    if (loading) return;
    
    // Check key
    const activeKey = apiKey.trim() || localStorage.getItem('anthropic_api_key') || '';
    if (!activeKey) {
      setError("Anthropic API key is missing. Click settings to set it up.");
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Add user message
    const updatedMsgs = [...messages, { role: 'user', content: userPrompt } as Message];
    setMessages(updatedMsgs);
    setInput('');

    // 2. Build system message with state serialization
    const systemPrompt = `You are the Founder's OS AI System Agent. You are a personal RPG game master and business coach assisting a high school student.
Your role:
- Analyze their levels, stats, habits, quests, startup milestone progress, well-being, and finances.
- Suggest strategic focuses, optimizations, and experiments.
- You have direct capability to mutate the application state. When they complete a major goal, connect with a mentor, or validate an experiment, you can reward them.
- State mutation format: You MUST output any mutations inside a single \`\`\`json ... \`\`\` block at the very end of your response.
- Mutation structure can modify character fields, stats XP additions (positive only), habits lists, weekly quests lists (appending), startup details, finance updates, wins logs, or reading logs. Refer to the current state.
- Keep modifications safe: Never reduce stats, never reduce totalXP, never wipe histories, and keep XP values proportional to their effort (e.g. +10 to +100 max).

Here is the CURRENT state of the application:
${JSON.stringify(state, null, 2)}`;

    try {
      // Build Anthropic messages payload
      // Convert history to Anthropic format
      const anthMessages = updatedMsgs.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-html-user-access': 'true' // needed for client-side API requests
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          system: systemPrompt,
          messages: anthMessages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const assistantText = data.content[0].text;

      // Parse mutation if present
      const jsonMatch = assistantText.match(/```json\s*([\s\S]*?)\s*```/);
      let mutationObj = null;
      let applied = false;

      if (jsonMatch) {
        try {
          mutationObj = JSON.parse(jsonMatch[1]);
          onApplyMutation(mutationObj);
          applied = true;
        } catch (parseErr) {
          console.error("Failed to parse mutation JSON from assistant response", parseErr);
        }
      }

      // Append assistant message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: assistantText,
          mutationApplied: applied
        }
      ]);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to communicate with Claude API.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendToClaude(input.trim());
  };

  return (
    <div style={styles.container}>
      {/* Settings Panel Toggle */}
      <div style={styles.headerRow}>
        <div style={styles.tabTitle}>⚡ SYSTEM AGENT INTERFACE</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn variant="secondary" onClick={() => setShowSettings(!showSettings)} style={styles.controlBtn}>
            ⚙️ API Settings
          </Btn>
          <Btn variant="secondary" onClick={handleClearHistory} style={styles.controlBtn}>
            🗑️ Clear Chat
          </Btn>
        </div>
      </div>

      {showSettings && (
        <Card style={{ padding: '12px' }}>
          <form onSubmit={handleSaveKey} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Anthropic Claude API Key</label>
              <input
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{ fontSize: '11px' }}
                required
              />
              <span style={styles.subtext}>
                Stored locally in your browser. Key is only sent directly to Anthropic API endpoint.
              </span>
            </div>
            <Btn type="submit" variant="primary" style={{ padding: '4px 10px', fontSize: '10px' }}>
              Save API Key
            </Btn>
          </form>
        </Card>
      )}

      {error && (
        <div style={styles.errorAlert}>
          {error}
        </div>
      )}

      {/* Messages Window */}
      <Card style={styles.chatWindow}>
        <div style={styles.messagesList}>
          {messages.map((m, idx) => {
            const isAgent = m.role === 'assistant';
            return (
              <div 
                key={idx} 
                style={{
                  ...styles.messageRow,
                  justifyContent: isAgent ? 'flex-start' : 'flex-end'
                }}
              >
                <div 
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: isAgent ? 'var(--bg-2)' : 'var(--bg-3)',
                    borderColor: isAgent ? 'var(--purple)44' : 'var(--border)',
                    borderLeft: isAgent ? '3px solid var(--purple)' : '0.5px solid var(--border)'
                  }}
                >
                  <div style={styles.roleLabel}>{isAgent ? 'SYSTEM AGENT' : 'FOUNDER'}</div>
                  <div style={styles.messageContent}>{m.content}</div>
                  {m.mutationApplied && (
                    <Pill color="var(--teal)" style={{ marginTop: '8px', fontSize: '7px' }}>
                      🔧 APPLIED STATE MUTATION
                    </Pill>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={styles.loadingRow}>
              <span style={styles.loadingDots}>⚡ Synchronizing neural links...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </Card>

      {/* Quick Prompts Panel */}
      <div style={styles.quickPromptsGrid}>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendToClaude(qp.prompt)}
            disabled={loading}
            style={styles.qpBtn}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <Card style={{ padding: '8px' }}>
        <form onSubmit={handleSend} style={styles.inputForm}>
          <input
            type="text"
            placeholder={loading ? "Synthesizing response..." : "Instruct the system agent..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            style={styles.textInput}
          />
          <Btn type="submit" variant="primary" disabled={loading || !input.trim()} style={styles.sendBtn}>
            Send
          </Btn>
        </form>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tabTitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  },
  controlBtn: {
    padding: '3px 8px',
    fontSize: '9px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  label: {
    fontSize: '9px',
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    fontWeight: 600
  },
  subtext: {
    fontSize: '8px',
    color: 'var(--text-3)',
    marginTop: '2px'
  },
  errorAlert: {
    backgroundColor: 'rgba(216, 90, 48, 0.12)',
    border: '0.5px solid var(--coral)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    color: 'var(--text-1)',
    fontSize: '10px'
  },
  chatWindow: {
    padding: '12px',
    marginBottom: 0,
    height: '320px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  messagesList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '4px'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '8px 12px',
    border: '0.5px solid',
    borderRadius: 'var(--radius)',
    display: 'flex',
    flexDirection: 'column'
  },
  roleLabel: {
    fontSize: '8px',
    color: 'var(--text-3)',
    fontWeight: 600,
    letterSpacing: '.05em',
    marginBottom: '4px'
  },
  messageContent: {
    fontSize: '11px',
    lineHeight: '1.4',
    color: 'var(--text-1)',
    whiteSpace: 'pre-wrap'
  },
  loadingRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '4px 0'
  },
  loadingDots: {
    fontSize: '10px',
    color: 'var(--text-3)',
    fontStyle: 'italic'
  },
  quickPromptsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px'
  },
  qpBtn: {
    backgroundColor: 'var(--bg-1)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '8px',
    fontSize: '10px',
    color: 'var(--text-2)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  inputForm: {
    display: 'flex',
    gap: '6px'
  },
  textInput: {
    flex: 1,
    padding: '6px 10px',
    fontSize: '11px'
  },
  sendBtn: {
    padding: '6px 16px',
    fontSize: '10px'
  }
};

// CSS overrides for qpBtn hover
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    button[disabled] { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(style);
}

export default AgentTab;
