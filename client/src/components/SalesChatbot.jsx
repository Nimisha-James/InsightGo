import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/SalesChatbot.css';

const API_BASE = 'http://localhost:8000';

const STARTER_PROMPTS = [
  'What are my total sales?',
  'Which state sells the most?',
  'What are my top-selling items?',
  'How have sales trended over time?',
];

const GREETING = "Hi! I can answer questions about your current sales report — totals, top states, top items, or trends over time.";

/**
 * Chat panel that sits next to the embedded Looker Studio report
 * (see LookerReport.jsx). Answers are grounded in the same MongoDB data
 * that feeds the report (via Gemini function-calling on the server, see
 * server/services/geminiChat.js) — not the report itself, since Looker
 * Studio has no query API to ask it questions directly.
 */
const SalesChatbot = () => {
  const [messages, setMessages] = useState([{ role: 'model', text: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // The greeting isn't a real turn, so it's excluded from the history sent
    // back to Gemini (which only expects alternating user/model turns).
    const priorTurns = messages.slice(1);
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const history = priorTurns.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
      const { data } = await axios.post(`${API_BASE}/chat/message`, { message: trimmed, history });
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (error) {
      const errText =
        error.response?.data?.message || 'Something went wrong reaching the sales assistant.';
      setMessages((prev) => [...prev, { role: 'model', text: errText }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="sales-chatbot">
      <div className="sales-chatbot-header">
        <h3>Sales Assistant</h3>
        <p>Ask about the report on the left</p>
      </div>

      <div className="sales-chatbot-messages" ref={listRef}>
        {messages.map((m, i) => (
          <div key={i} className={`sales-chatbot-msg sales-chatbot-msg-${m.role}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="sales-chatbot-msg sales-chatbot-msg-model sales-chatbot-typing">
            Thinking…
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="sales-chatbot-starters">
          {STARTER_PROMPTS.map((q) => (
            <button key={q} type="button" onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <form className="sales-chatbot-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your sales…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default SalesChatbot;
