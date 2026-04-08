const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Database Initialization
async function initDb() {
   db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
   });

   await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);

   // Seed with initial data if empty
   const count = await db.get('SELECT COUNT(*) as count FROM transactions');
   if (count.count === 0) {
      const initialTransactions = [
         ["Salary", 5000, "income", "salary", "2025-01-01"],
         ["Rent", 1200, "expense", "housing", "2025-01-02"],
         ["Groceries", 150, "expense", "food", "2025-01-03"],
         ["Freelance Work", 800, "income", "salary", "2025-01-05"],
         ["Electric Bill", 95, "expense", "utilities", "2025-01-06"],
         ["Dinner Out", 65, "expense", "food", "2025-01-07"],
         ["Gas", 45, "expense", "transport", "2025-01-08"],
         ["Netflix", 15, "expense", "entertainment", "2025-01-10"],
      ];

      for (const [desc, amt, type, cat, date] of initialTransactions) {
         await db.run(
            'INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)',
            [desc, amt, type, cat, date]
         );
      }
   }
}

// API Endpoints
app.get('/api/transactions', async (req, res) => {
   const transactions = await db.all('SELECT * FROM transactions ORDER BY date DESC');
   res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
   const { description, amount, type, category, date } = req.body;
   const result = await db.run(
      'INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)',
      [description, amount, type, category, date]
   );
   const newTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', result.lastID);
   res.status(201).json(newTransaction);
});

app.delete('/api/transactions/:id', async (req, res) => {
   await db.run('DELETE FROM transactions WHERE id = ?', req.params.id);
   res.status(204).send();
});

// MCP Server Setup
const mcpServer = new Server({
   name: "finance-tracker-mcp",
   version: "1.0.0",
}, {
   capabilities: {
      tools: {}
   }
});

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
   return {
      tools: [
         {
            name: "get_transactions",
            description: "Retrieve all financial transactions",
            inputSchema: { type: "object", properties: {} }
         },
         {
            name: "add_transaction",
            description: "Add a new financial transaction",
            inputSchema: {
               type: "object",
               properties: {
                  description: { type: "string" },
                  amount: { type: "number" },
                  type: { type: "string", enum: ["income", "expense"] },
                  category: { type: "string" },
                  date: { type: "string" }
               },
               required: ["description", "amount", "type", "category", "date"]
            }
         }
      ]
   };
});
 
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
   switch (request.params.name) {
      case "get_transactions":
         const transactions = await db.all('SELECT * FROM transactions');
         return { content: [{ type: "text", text: JSON.stringify(transactions, null, 2) }] };
      case "add_transaction":
         const { description, amount, type, category, date } = request.params.arguments;
         await db.run(
            'INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)',
            [description, amount, type, category, date]
         );
         return { content: [{ type: "text", text: "Transaction added successfully" }] };
      default:
         throw new Error("Tool not found");
   }
});

// Start everything
const PORT = process.env.PORT || 3001;
initDb().then(async () => {
   app.listen(PORT, () => {
      console.log(`REST API running on http://localhost:${PORT}`);
   });

   const transport = new StdioServerTransport();
   await mcpServer.connect(transport);
   console.log("MCP Server connected via Stdio");
});
