import pool from '../config/database.js';

/**
 * Database Service
 * Gerencia operações do banco de dados PostgreSQL
 */
class DatabaseService {
  /**
   * CONTACTS - Gerenciamento de contatos do CRM
   */

  async upsertContact(contactData) {
    const query = `
      INSERT INTO contacts (phone_number, jid, name, customer_type, interest_level, buying_stage, tags, metadata, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (jid)
      DO UPDATE SET
        phone_number = EXCLUDED.phone_number,
        name = EXCLUDED.name,
        customer_type = EXCLUDED.customer_type,
        interest_level = EXCLUDED.interest_level,
        buying_stage = EXCLUDED.buying_stage,
        tags = EXCLUDED.tags,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      contactData.phone_number,
      contactData.jid,
      contactData.name,
      contactData.customer_type || 'lead',
      contactData.interest_level || 'medium',
      contactData.buying_stage || 'awareness',
      contactData.tags || [],
      contactData.metadata || {}
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getContact(jid) {
    const query = 'SELECT * FROM contacts WHERE jid = $1';
    const result = await pool.query(query, [jid]);
    return result.rows[0];
  }

  async listContacts(filters = {}) {
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.customer_type) {
      query += ` AND customer_type = $${paramCount}`;
      values.push(filters.customer_type);
      paramCount++;
    }

    if (filters.interest_level) {
      query += ` AND interest_level = $${paramCount}`;
      values.push(filters.interest_level);
      paramCount++;
    }

    if (filters.tags && filters.tags.length > 0) {
      query += ` AND tags && $${paramCount}`;
      values.push(filters.tags);
      paramCount++;
    }

    query += ' ORDER BY updated_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * MESSAGES - Armazenamento de mensagens
   */

  async insertMessage(messageData) {
    const query = `
      INSERT INTO messages (message_id, chat_jid, sender_jid, content, from_me, timestamp, has_media, media_type, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      messageData.message_id,
      messageData.chat_jid,
      messageData.sender_jid,
      messageData.content,
      messageData.from_me,
      messageData.timestamp,
      messageData.has_media || false,
      messageData.media_type,
      messageData.metadata || {}
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getMessages(chat_jid, limit = 50) {
    const query = `
      SELECT * FROM messages
      WHERE chat_jid = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [chat_jid, limit]);
    return result.rows;
  }

  async searchMessages(searchQuery, filters = {}) {
    let query = 'SELECT * FROM messages WHERE content ILIKE $1';
    const values = [`%${searchQuery}%`];
    let paramCount = 2;

    if (filters.chat_jid) {
      query += ` AND chat_jid = $${paramCount}`;
      values.push(filters.chat_jid);
      paramCount++;
    }

    if (filters.from_me !== undefined) {
      query += ` AND from_me = $${paramCount}`;
      values.push(filters.from_me);
      paramCount++;
    }

    if (filters.after) {
      query += ` AND timestamp >= $${paramCount}`;
      values.push(filters.after);
      paramCount++;
    }

    if (filters.before) {
      query += ` AND timestamp <= $${paramCount}`;
      values.push(filters.before);
      paramCount++;
    }

    query += ' ORDER BY timestamp DESC';
    query += ` LIMIT $${paramCount}`;
    values.push(filters.limit || 100);

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * AI_ANALYSIS - Análises de IA
   */

  async saveAnalysis(analysisData) {
    const query = `
      INSERT INTO ai_analysis (contact_jid, chat_jid, analysis_type, sentiment, tone, intent, key_topics, entities, insights, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const values = [
      analysisData.contact_jid,
      analysisData.chat_jid,
      analysisData.analysis_type,
      analysisData.sentiment,
      analysisData.tone,
      analysisData.intent,
      analysisData.key_topics || [],
      analysisData.entities || {},
      analysisData.insights || {}
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getLatestAnalysis(contact_jid) {
    const query = `
      SELECT * FROM ai_analysis
      WHERE contact_jid = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [contact_jid]);
    return result.rows[0];
  }

  /**
   * INTERACTIONS - Registro de todas interações
   */

  async logInteraction(interactionData) {
    const query = `
      INSERT INTO interactions (contact_jid, interaction_type, direction, content, metadata, ai_generated, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      interactionData.contact_jid,
      interactionData.interaction_type,
      interactionData.direction,
      interactionData.content,
      interactionData.metadata || {},
      interactionData.ai_generated || false,
      interactionData.timestamp || new Date().toISOString()
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getContactInteractions(contact_jid, limit = 50) {
    const query = `
      SELECT * FROM interactions
      WHERE contact_jid = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [contact_jid, limit]);
    return result.rows;
  }

  /**
   * CONVERSATION_STYLE - Estilo de conversa aprendido
   */

  async saveConversationStyle(jid, style) {
    const query = `
      INSERT INTO conversation_style (
        contact_jid, writing_style, common_expressions, tone, message_length,
        emoji_usage, punctuation_style, greeting_style, closing_style, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (contact_jid)
      DO UPDATE SET
        writing_style = EXCLUDED.writing_style,
        common_expressions = EXCLUDED.common_expressions,
        tone = EXCLUDED.tone,
        message_length = EXCLUDED.message_length,
        emoji_usage = EXCLUDED.emoji_usage,
        punctuation_style = EXCLUDED.punctuation_style,
        greeting_style = EXCLUDED.greeting_style,
        closing_style = EXCLUDED.closing_style,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      jid,
      style.writing_style,
      style.common_expressions || [],
      style.tone,
      style.message_length,
      style.emoji_usage,
      style.punctuation_style,
      style.greeting_style,
      style.closing_style
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getConversationStyle(jid) {
    const query = 'SELECT * FROM conversation_style WHERE contact_jid = $1';
    const result = await pool.query(query, [jid]);
    return result.rows[0];
  }

  /**
   * PIPELINE - Pipeline de vendas
   */

  async updatePipelineStage(contact_jid, stage, value) {
    const query = `
      INSERT INTO pipeline (contact_jid, stage, value, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (contact_jid)
      DO UPDATE SET
        stage = EXCLUDED.stage,
        value = EXCLUDED.value,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, [contact_jid, stage, value]);
    return result.rows[0];
  }

  async getPipeline() {
    const query = `
      SELECT p.*, c.name, c.phone_number, c.customer_type
      FROM pipeline p
      LEFT JOIN contacts c ON p.contact_jid = c.jid
      ORDER BY p.updated_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * METRICS - Métricas do dashboard
   */

  async getDashboardMetrics() {
    // Total de contatos
    const contactsQuery = 'SELECT COUNT(*) as total FROM contacts';
    const contactsResult = await pool.query(contactsQuery);
    const totalContacts = parseInt(contactsResult.rows[0].total);

    // Total de mensagens hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesQuery = 'SELECT COUNT(*) as total FROM messages WHERE timestamp >= $1';
    const messagesResult = await pool.query(messagesQuery, [today.toISOString()]);
    const messagesToday = parseInt(messagesResult.rows[0].total);

    // Contatos ativos (com mensagem nos últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeQuery = `
      SELECT COUNT(DISTINCT sender_jid) as total
      FROM messages
      WHERE timestamp >= $1 AND from_me = false
    `;
    const activeResult = await pool.query(activeQuery, [sevenDaysAgo.toISOString()]);
    const activeContacts = parseInt(activeResult.rows[0].total);

    // Pipeline summary
    const pipelineQuery = 'SELECT stage, SUM(value) as total FROM pipeline GROUP BY stage';
    const pipelineResult = await pool.query(pipelineQuery);
    const pipelineSummary = pipelineResult.rows.reduce((acc, row) => {
      acc[row.stage] = parseFloat(row.total) || 0;
      return acc;
    }, {});

    return {
      total_contacts: totalContacts,
      messages_today: messagesToday,
      active_contacts: activeContacts,
      pipeline: pipelineSummary
    };
  }

  /**
   * Utility methods
   */

  async query(text, params) {
    return pool.query(text, params);
  }

  async getClient() {
    return pool.connect();
  }
}

export default new DatabaseService();