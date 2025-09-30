import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orchestratorService from './services/orchestrator.service.js';
import databaseService from './services/database.service.js';
import aiService from './services/ai.service.js';
import whatsappService from './services/whatsapp.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== SYNC ENDPOINTS =====

// Sincronizar contatos
app.post('/api/sync/contacts', async (req, res) => {
  try {
    const result = await orchestratorService.syncContacts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sincronizar mensagens de um chat
app.post('/api/sync/messages/:chatJid', async (req, res) => {
  try {
    const { chatJid } = req.params;
    const { limit = 100 } = req.body;
    const result = await orchestratorService.syncChatMessages(chatJid, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pipeline automático
app.post('/api/sync/auto-pipeline', async (req, res) => {
  try {
    const { limit = 10 } = req.body;
    const result = await orchestratorService.runAutoPipeline(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CONTACTS ENDPOINTS =====

// Listar contatos
app.get('/api/contacts', async (req, res) => {
  try {
    const { customer_type, interest_level, tags, limit } = req.query;
    const filters = { customer_type, interest_level, limit: limit ? parseInt(limit) : 50 };
    if (tags) filters.tags = tags.split(',');
    
    const contacts = await databaseService.listContacts(filters);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter contato específico
app.get('/api/contacts/:jid', async (req, res) => {
  try {
    const { jid } = req.params;
    const contact = await databaseService.getContact(jid);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar contato
app.put('/api/contacts/:jid', async (req, res) => {
  try {
    const { jid } = req.params;
    const data = { ...req.body, jid };
    const result = await databaseService.upsertContact(data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MESSAGES ENDPOINTS =====

// Buscar mensagens de um chat
app.get('/api/messages/:chatJid', async (req, res) => {
  try {
    const { chatJid } = req.params;
    const { limit = 50 } = req.query;
    const messages = await databaseService.getMessages(chatJid, parseInt(limit));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar mensagens por query
app.post('/api/messages/search', async (req, res) => {
  try {
    const { query, filters } = req.body;
    const messages = await databaseService.searchMessages(query, filters);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== AI ENDPOINTS =====

// Analisar contato
app.post('/api/ai/analyze/:contactJid', async (req, res) => {
  try {
    const { contactJid } = req.params;
    const result = await orchestratorService.analyzeContact(contactJid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gerar sugestão de interação
app.post('/api/ai/suggest/:contactJid', async (req, res) => {
  try {
    const { contactJid } = req.params;
    const suggestion = await orchestratorService.generateInteractionSuggestion(contactJid);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensagem humanizada
app.post('/api/ai/send-message', async (req, res) => {
  try {
    const { recipient_jid, intent, specific_points = [] } = req.body;
    
    if (!recipient_jid || !intent) {
      return res.status(400).json({ error: 'recipient_jid e intent são obrigatórios' });
    }

    const result = await orchestratorService.sendHumanizedMessage(
      recipient_jid,
      intent,
      specific_points
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DASHBOARD ENDPOINTS =====

// Métricas do dashboard
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const metrics = await databaseService.getDashboardMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pipeline
app.get('/api/dashboard/pipeline', async (req, res) => {
  try {
    const pipeline = await databaseService.getPipeline();
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Histórico de interações
app.get('/api/interactions/:contactJid', async (req, res) => {
  try {
    const { contactJid } = req.params;
    const { limit = 50 } = req.query;
    const interactions = await databaseService.getContactInteractions(contactJid, parseInt(limit));
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== WHATSAPP DIRECT ENDPOINTS (para testes) =====

// Listar chats
app.get('/api/whatsapp/chats', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const chats = await whatsappService.listChats({ limit: parseInt(limit) });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensagem simples (sem IA)
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { recipient, message } = req.body;
    
    if (!recipient || !message) {
      return res.status(400).json({ error: 'recipient e message são obrigatórios' });
    }

    const result = await whatsappService.sendMessage(recipient, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== REALTIME CONTROL =====

// Iniciar sincronização em tempo real
app.post('/api/realtime/start', async (req, res) => {
  try {
    await orchestratorService.startRealtimeSync();
    res.json({ status: 'started', message: 'Sincronização em tempo real iniciada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parar sincronização em tempo real
app.post('/api/realtime/stop', async (req, res) => {
  try {
    orchestratorService.stopRealtimeSync();
    res.json({ status: 'stopped', message: 'Sincronização em tempo real parada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   WhatsApp BI Platform - Backend API         ║
║   🚀 Server running on port ${PORT}            ║
╚════════════════════════════════════════════════╝

📡 Endpoints disponíveis:
   
   SYNC:
   POST /api/sync/contacts
   POST /api/sync/messages/:chatJid
   POST /api/sync/auto-pipeline
   
   CONTACTS:
   GET  /api/contacts
   GET  /api/contacts/:jid
   PUT  /api/contacts/:jid
   
   MESSAGES:
   GET  /api/messages/:chatJid
   POST /api/messages/search
   
   AI:
   POST /api/ai/analyze/:contactJid
   POST /api/ai/suggest/:contactJid
   POST /api/ai/send-message
   
   DASHBOARD:
   GET  /api/dashboard/metrics
   GET  /api/dashboard/pipeline
   GET  /api/interactions/:contactJid
   
   WHATSAPP:
   GET  /api/whatsapp/chats
   POST /api/whatsapp/send
   
   REALTIME:
   POST /api/realtime/start
   POST /api/realtime/stop

🔗 Health check: http://localhost:${PORT}/health
  `);
});