const { GoogleGenAI } = require('@google/genai');
const salesMetrics = require('./salesMetrics');

// Every "tool" Gemini is allowed to call. Each one maps 1:1 to a real Mongo
// aggregation in salesMetrics.js — the model never invents numbers, it only
// asks for data and narrates the result. Keeps the chatbot's answers
// consistent with what the embedded Looker Studio report shows, since both
// read from the same current sales import.
const TOOLS = [
  {
    name: 'getTotalSales',
    handler: salesMetrics.getTotalSales,
    declaration: {
      name: 'getTotalSales',
      description:
        "Total revenue and order count for the business owner's current sales import. Matches the totals on the Looker Studio sales report.",
      parametersJsonSchema: { type: 'object', properties: {} },
    },
  },
  {
    name: 'getSalesByState',
    handler: salesMetrics.getSalesByState,
    declaration: {
      name: 'getSalesByState',
      description:
        'Total sales revenue broken down by Indian state, sorted highest first. Use for questions about which regions/states sell the most or least.',
      parametersJsonSchema: { type: 'object', properties: {} },
    },
  },
  {
    name: 'getSalesByItem',
    handler: salesMetrics.getSalesByItem,
    declaration: {
      name: 'getSalesByItem',
      description:
        'Total sales revenue broken down by product/item category, sorted highest first. Use for questions about best- or worst-selling items.',
      parametersJsonSchema: { type: 'object', properties: {} },
    },
  },
  {
    name: 'getSalesTrend',
    handler: salesMetrics.getSalesTrend,
    declaration: {
      name: 'getSalesTrend',
      description:
        'Total sales revenue grouped by month (YYYY-MM), in chronological order. Use for questions about sales trends, growth, or how sales changed over time.',
      parametersJsonSchema: { type: 'object', properties: {} },
    },
  },
];

const SYSTEM_INSTRUCTION = `You are the sales assistant embedded next to a business owner's live sales report on InsightGo. Answer questions about their sales data ONLY by calling the provided tools — never guess, estimate, or invent numbers. Keep answers short and concrete, in plain business language, using ₹ for currency. If a question isn't about sales totals, state breakdowns, item breakdowns, or trends over time, say briefly that you can only help with sales-report questions for now.`;

// Guards against a runaway tool-call loop if the model keeps requesting
// functions instead of answering.
const MAX_TOOL_ROUNDS = 4;

let client = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/**
 * @param {string} message - the user's latest chat message
 * @param {Array<{role: 'user'|'model', parts: Array<{text: string}>}>} history - prior turns
 */
async function askSalesChatbot(message, history = []) {
  const ai = getClient();
  if (!ai) {
    return {
      reply: 'The sales assistant is not configured yet — add GEMINI_API_KEY to server/.env to enable it.',
    };
  }

  const chat = ai.chats.create({
    // "latest" alias rather than a pinned version — new API keys can lose
    // access to a specific dated model (e.g. gemini-2.5-flash) once Google
    // deprecates it for new users, while the alias keeps pointing at
    // whatever the current recommended model is. The "lite" tier is plenty
    // for routing between 4 small tool calls and narrating the result.
    model: 'gemini-flash-lite-latest',
    history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: TOOLS.map((t) => t.declaration) }],
    },
  });

  let response = await chat.sendMessage({ message });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const calls = response.functionCalls;
    if (!calls || calls.length === 0) break;

    const responseParts = [];
    for (const call of calls) {
      const tool = TOOLS.find((t) => t.name === call.name);
      let result;
      try {
        result = tool ? await tool.handler() : { error: `Unknown tool "${call.name}"` };
      } catch (err) {
        result = { error: err.message };
      }
      responseParts.push({ functionResponse: { name: call.name, response: { result } } });
    }
    response = await chat.sendMessage({ message: responseParts });
  }

  return { reply: response.text || "Sorry, I couldn't work that out — try rephrasing." };
}

module.exports = { askSalesChatbot };
