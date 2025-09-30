import supabase from '../config/supabase.js';

/**
 * Supabase Service
 * Gerencia operações do banco de dados e realtime
 */
class SupabaseService {
  /**
   * CONTACTS - Gerenciamento de contatos do CRM
   */

  async upsertContact(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .upsert({
        phone_number: contactData.phone_number,
        jid: contactData.jid,
        name: contactData.name,
        customer_type: contactData.customer_type,
        interest_level: contactData.interest_level,
        buying_stage: contactData.buying_stage,
        tags: contactData.tags || [],
        metadata: contactData.metadata || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'jid'
      });

    if (error) throw error;
    return data;
  }

  async getContact(jid) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('jid', jid)
      .single();

    if (error) throw error;
    return data;
  }

  async listContacts(filters = {}) {
    let query = supabase.from('contacts').select('*');

    if (filters.customer_type) {
      query = query.eq('customer_type', filters.customer_type);
    }
    if (filters.interest_level) {
      query = query.eq('interest_level', filters.interest_level);
    }
    if (filters.tags) {
      query = query.contains('tags', filters.tags);
    }

    query = query.order('updated_at', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error} = await query;
    if (error) throw error;
    return data;
  }

  /**
   * MESSAGES - Armazenamento de mensagens
   */

  async insertMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        message_id: messageData.message_id,
        chat_jid: messageData.chat_jid,
        sender_jid: messageData.sender_jid,
        content: messageData.content,
        from_me: messageData.from_me,
        timestamp: messageData.timestamp,
        has_media: messageData.has_media || false,
        media_type: messageData.media_type,
        metadata: messageData.metadata || {}
      });

    if (error) throw error;
    return data;
  }

  async getMessages(chat_jid, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_jid', chat_jid)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async searchMessages(query, filters = {}) {
    let dbQuery = supabase
      .from('messages')
      .select('*')
      .ilike('content', `%${query}%`);

    if (filters.chat_jid) {
      dbQuery = dbQuery.eq('chat_jid', filters.chat_jid);
    }
    if (filters.from_me !== undefined) {
      dbQuery = dbQuery.eq('from_me', filters.from_me);
    }
    if (filters.after) {
      dbQuery = dbQuery.gte('timestamp', filters.after);
    }
    if (filters.before) {
      dbQuery = dbQuery.lte('timestamp', filters.before);
    }

    dbQuery = dbQuery.order('timestamp', { ascending: false });
    dbQuery = dbQuery.limit(filters.limit || 100);

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data;
  }

  /**
   * AI_ANALYSIS - Análises de IA
   */

  async saveAnalysis(analysisData) {
    const { data, error } = await supabase
      .from('ai_analysis')
      .insert({
        contact_jid: analysisData.contact_jid,
        chat_jid: analysisData.chat_jid,
        analysis_type: analysisData.analysis_type,
        sentiment: analysisData.sentiment,
        tone: analysisData.tone,
        intent: analysisData.intent,
        key_topics: analysisData.key_topics || [],
        entities: analysisData.entities || {},
        insights: analysisData.insights || {},
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  async getLatestAnalysis(contact_jid) {
    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('contact_jid', contact_jid)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  /**
   * INTERACTIONS - Registro de todas interações
   */

  async logInteraction(interactionData) {
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        contact_jid: interactionData.contact_jid,
        interaction_type: interactionData.interaction_type,
        direction: interactionData.direction,
        content: interactionData.content,
        metadata: interactionData.metadata || {},
        ai_generated: interactionData.ai_generated || false,
        timestamp: interactionData.timestamp || new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  async getContactInteractions(contact_jid, limit = 50) {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('contact_jid', contact_jid)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * CONVERSATION_STYLE - Estilo de conversa aprendido
   */

  async saveConversationStyle(jid, style) {
    const { data, error } = await supabase
      .from('conversation_style')
      .upsert({
        contact_jid: jid,
        writing_style: style.writing_style,
        common_expressions: style.common_expressions || [],
        tone: style.tone,
        message_length: style.message_length,
        emoji_usage: style.emoji_usage,
        punctuation_style: style.punctuation_style,
        greeting_style: style.greeting_style,
        closing_style: style.closing_style,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'contact_jid'
      });

    if (error) throw error;
    return data;
  }

  async getConversationStyle(jid) {
    const { data, error } = await supabase
      .from('conversation_style')
      .select('*')
      .eq('contact_jid', jid)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * PIPELINE - Pipeline de vendas
   */

  async updatePipelineStage(contact_jid, stage, value) {
    const { data, error } = await supabase
      .from('pipeline')
      .upsert({
        contact_jid,
        stage,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'contact_jid'
      });

    if (error) throw error;
    return data;
  }

  async getPipeline() {
    const { data, error } = await supabase
      .from('pipeline')
      .select(`
        *,
        contacts (
          name,
          phone_number,
          customer_type
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * REALTIME - Subscriptions
   */

  subscribeToNewMessages(callback) {
    return supabase
      .channel('new-messages')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        callback
      )
      .subscribe();
  }

  subscribeToContactUpdates(callback) {
    return supabase
      .channel('contact-updates')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        callback
      )
      .subscribe();
  }

  /**
   * METRICS - Métricas do dashboard
   */

  async getDashboardMetrics() {
    // Total de contatos
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // Total de mensagens hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: messagesToday } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', today.toISOString());

    // Contatos ativos (com mensagem nos últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: activeContacts } = await supabase
      .from('messages')
      .select('sender_jid')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .eq('from_me', false);

    const uniqueActiveContacts = [...new Set(activeContacts?.map(m => m.sender_jid) || [])].length;

    // Pipeline summary
    const { data: pipelineData } = await supabase
      .from('pipeline')
      .select('stage, value');

    const pipelineSummary = pipelineData?.reduce((acc, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + (item.value || 0);
      return acc;
    }, {});

    return {
      total_contacts: totalContacts || 0,
      messages_today: messagesToday || 0,
      active_contacts: uniqueActiveContacts,
      pipeline: pipelineSummary || {}
    };
  }
}

export default new SupabaseService();