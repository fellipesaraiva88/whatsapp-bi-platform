import whatsappService from './whatsapp.service.js';
import aiService from './ai.service.js';
import supabaseService from './supabase.service.js';

/**
 * Orchestrator Service
 * Orquestra o fluxo completo: WhatsApp → AI → Supabase → Ações
 */
class OrchestratorService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Sincroniza contatos do WhatsApp para o Supabase
   */
  async syncContacts() {
    try {
      console.log('🔄 Sincronizando contatos...');
      
      const contacts = await whatsappService.searchContacts('');
      
      for (const contact of contacts) {
        await supabaseService.upsertContact({
          phone_number: contact.phone_number,
          jid: contact.jid,
          name: contact.name || contact.phone_number,
          customer_type: 'lead',
          metadata: { synced_at: new Date().toISOString() }
        });
      }

      console.log(`✅ ${contacts.length} contatos sincronizados`);
      return { success: true, count: contacts.length };
    } catch (error) {
      console.error('❌ Erro ao sincronizar contatos:', error);
      throw error;
    }
  }

  /**
   * Sincroniza mensagens de um chat específico
   */
  async syncChatMessages(chat_jid, limit = 100) {
    try {
      console.log(`🔄 Sincronizando mensagens do chat ${chat_jid}...`);

      const messages = await whatsappService.listMessages({
        chat_jid,
        limit,
        include_context: false
      });

      for (const msg of messages) {
        try {
          await supabaseService.insertMessage({
            message_id: msg.id,
            chat_jid: msg.chat_jid,
            sender_jid: msg.sender_jid,
            content: msg.content,
            from_me: msg.from_me,
            timestamp: msg.timestamp,
            has_media: msg.has_media,
            media_type: msg.media_type,
            metadata: msg.metadata || {}
          });
        } catch (error) {
          // Ignora duplicatas
          if (error.code !== '23505') {
            console.error('Erro ao inserir mensagem:', error);
          }
        }
      }

      console.log(`✅ ${messages.length} mensagens sincronizadas`);
      return { success: true, count: messages.length };
    } catch (error) {
      console.error('❌ Erro ao sincronizar mensagens:', error);
      throw error;
    }
  }

  /**
   * Análise completa de um contato
   */
  async analyzeContact(contact_jid) {
    try {
      console.log(`🤖 Analisando contato ${contact_jid}...`);

      // 1. Buscar mensagens do banco
      const messages = await supabaseService.getMessages(contact_jid, 50);

      if (messages.length === 0) {
        return { error: 'Nenhuma mensagem encontrada para análise' };
      }

      // 2. Análise de conversa com IA
      const analysis = await aiService.analyzeConversation(messages);

      // 3. Salvar análise
      await supabaseService.saveAnalysis({
        contact_jid,
        chat_jid: contact_jid,
        analysis_type: 'full_conversation',
        sentiment: analysis.sentiment,
        tone: analysis.tone,
        intent: analysis.intent,
        key_topics: analysis.key_topics,
        insights: {
          customer_mood: analysis.customer_mood,
          urgency_level: analysis.urgency_level,
          sales_stage: analysis.sales_stage,
          next_best_action: analysis.next_best_action,
          summary: analysis.summary
        }
      });

      // 4. Categorizar contato
      const contact = await supabaseService.getContact(contact_jid);
      const myMessages = messages.filter(m => m.from_me).map(m => m.content);
      
      // Se temos mensagens minhas, aprender estilo
      if (myMessages.length >= 5) {
        const style = await aiService.learnConversationStyle(myMessages);
        await supabaseService.saveConversationStyle(contact_jid, style);
      }

      const categorization = await aiService.categorizeContact(contact, messages);

      // 5. Atualizar contato com categorização
      await supabaseService.upsertContact({
        jid: contact_jid,
        phone_number: contact.phone_number,
        name: contact.name,
        customer_type: categorization.customer_type,
        interest_level: categorization.interest_level,
        buying_stage: categorization.buying_stage,
        tags: categorization.tags,
        lifetime_value_prediction: categorization.lifetime_value_prediction,
        churn_risk: categorization.churn_risk
      });

      // 6. Atualizar pipeline
      if (analysis.sales_stage) {
        await supabaseService.updatePipelineStage(
          contact_jid,
          analysis.sales_stage,
          null // value pode ser inferido depois
        );
      }

      console.log(`✅ Análise completa do contato ${contact_jid}`);

      return {
        analysis,
        categorization,
        messages_analyzed: messages.length
      };
    } catch (error) {
      console.error('❌ Erro ao analisar contato:', error);
      throw error;
    }
  }

  /**
   * Gera sugestão de interação para um contato
   */
  async generateInteractionSuggestion(contact_jid) {
    try {
      console.log(`💡 Gerando sugestão de interação para ${contact_jid}...`);

      // 1. Buscar dados do contato
      const contact = await supabaseService.getContact(contact_jid);

      // 2. Buscar última análise
      const analysis = await supabaseService.getLatestAnalysis(contact_jid);

      if (!analysis) {
        return { error: 'Execute analyzeContact primeiro' };
      }

      // 3. Gerar sugestão com IA
      const suggestion = await aiService.suggestNextInteraction(contact, analysis);

      // 4. Salvar sugestão
      await supabaseService.logInteraction({
        contact_jid,
        interaction_type: 'note',
        direction: 'outbound',
        content: `AI Suggestion: ${suggestion.action_type} - ${suggestion.reasoning}`,
        ai_generated: true,
        metadata: suggestion
      });

      console.log(`✅ Sugestão gerada: ${suggestion.action_type}`);

      return suggestion;
    } catch (error) {
      console.error('❌ Erro ao gerar sugestão:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem humanizada (fluxo completo com IA)
   */
  async sendHumanizedMessage(recipient_jid, intent, specific_points = []) {
    try {
      console.log(`📤 Preparando mensagem humanizada para ${recipient_jid}...`);

      // 1. Buscar histórico de conversa
      const messages = await supabaseService.getMessages(recipient_jid, 20);

      // 2. Buscar estilo de conversa aprendido
      const userStyle = await supabaseService.getConversationStyle(recipient_jid);

      if (!userStyle) {
        return { error: 'Estilo de conversa não aprendido. Execute analyzeContact primeiro.' };
      }

      // 3. Gerar mensagem com IA
      const generated = await aiService.generateHumanizedMessage({
        conversation_history: messages,
        user_style: userStyle,
        intent,
        specific_points
      });

      console.log(`🤖 Mensagem gerada (confiança: ${generated.confidence})`);
      console.log(`💬 "${generated.message}"`);

      // 4. Enviar em etapas humanizadas
      const result = await whatsappService.sendHumanizedMessage(
        recipient_jid,
        generated.message,
        {
          chunkSize: 80,
          delayBetweenChunks: 2500,
          addTypingIndicator: true
        }
      );

      // 5. Registrar interação
      await supabaseService.logInteraction({
        contact_jid: recipient_jid,
        interaction_type: 'message',
        direction: 'outbound',
        content: generated.message,
        ai_generated: true,
        metadata: {
          intent,
          confidence: generated.confidence,
          chunks_sent: result.chunks_sent,
          reasoning: generated.reasoning
        }
      });

      console.log(`✅ Mensagem enviada com sucesso!`);

      return {
        success: true,
        message: generated.message,
        confidence: generated.confidence,
        chunks_sent: result.chunks_sent
      };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem humanizada:', error);
      throw error;
    }
  }

  /**
   * Pipeline automático: analisa contatos e gera sugestões
   */
  async runAutoPipeline(limit = 10) {
    try {
      console.log('🚀 Iniciando pipeline automático...');

      // 1. Buscar chats ativos
      const chats = await whatsappService.listChats({ limit });

      const results = [];

      for (const chat of chats) {
        try {
          console.log(`\n📱 Processando ${chat.name || chat.jid}...`);

          // Sincronizar mensagens
          await this.syncChatMessages(chat.jid, 50);

          // Analisar contato
          const analysis = await this.analyzeContact(chat.jid);

          // Gerar sugestão
          const suggestion = await this.generateInteractionSuggestion(chat.jid);

          results.push({
            contact: chat.jid,
            name: chat.name,
            analysis,
            suggestion
          });

        } catch (error) {
          console.error(`Erro ao processar ${chat.jid}:`, error.message);
          results.push({
            contact: chat.jid,
            error: error.message
          });
        }
      }

      console.log('\n✅ Pipeline automático concluído!');

      return results;
    } catch (error) {
      console.error('❌ Erro no pipeline automático:', error);
      throw error;
    }
  }

  /**
   * Inicia sincronização contínua (realtime)
   */
  async startRealtimeSync() {
    if (this.isRunning) {
      console.log('⚠️ Sincronização já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Iniciando sincronização em tempo real...');

    // Sincronizar a cada 30 segundos
    this.syncInterval = setInterval(async () => {
      try {
        const chats = await whatsappService.listChats({ limit: 20 });
        
        for (const chat of chats) {
          // Sincronizar apenas mensagens novas (últimas 10)
          await this.syncChatMessages(chat.jid, 10);
        }

        console.log('✅ Sincronização realtime executada');
      } catch (error) {
        console.error('❌ Erro na sincronização realtime:', error);
      }
    }, 30000); // 30 segundos

    console.log('✅ Sincronização em tempo real ativada (30s interval)');
  }

  /**
   * Para sincronização contínua
   */
  stopRealtimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.isRunning = false;
      console.log('⏸️ Sincronização em tempo real pausada');
    }
  }
}

export default new OrchestratorService();