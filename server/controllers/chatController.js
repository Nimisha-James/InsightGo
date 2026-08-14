const { askSalesChatbot } = require('../services/geminiChat');

// POST /chat/message — sales-report chatbot (see geminiChat.js). Stateless on
// the server; the client resends prior turns as `history` each call.
const sendMessage = async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'message is required' });
  }

  try {
    const { reply } = await askSalesChatbot(message.trim(), Array.isArray(history) ? history : []);
    res.json({ reply });
  } catch (error) {
    console.error('Sales chatbot error:', error);
    res.status(500).json({
      message: 'Error getting a response from the sales assistant',
      error: error.message,
    });
  }
};

module.exports = { sendMessage };
