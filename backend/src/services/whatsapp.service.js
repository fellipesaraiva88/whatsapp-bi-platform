/**
 * WhatsApp Service
 * Integra com MCP do WhatsApp para operações de leitura e envio
 */

class WhatsAppService {
  constructor() {
    this.mcpConnected = false;
  }

  /**
   * Busca contatos do WhatsApp
   */
  async searchContacts(query = '') {
    try {
      // Via MCP: mcp__whatsapp__search_contacts
      const response = await fetch('http://localhost:3000/mcp/whatsapp/search_contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      return await response.json();
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }

  /**
   * Lista mensagens com filtros avançados
   */
  async listMessages(filters = {}) {
    try {
      const {
        after,
        before,
        sender_phone_number,
        chat_jid,
        query,
        limit = 20,
        page = 0,
        include_context = true,
        context_before = 1,
        context_after = 1
      } = filters;

      // Via MCP: mcp__whatsapp__list_messages
      const response = await fetch('http://localhost:3000/mcp/whatsapp/list_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          after,
          before,
          sender_phone_number,
          chat_jid,
          query,
          limit,
          page,
          include_context,
          context_before,
          context_after
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error listing messages:', error);
      throw error;
    }
  }

  /**
   * Lista chats
   */
  async listChats(options = {}) {
    try {
      const {
        query,
        limit = 20,
        page = 0,
        include_last_message = true,
        sort_by = 'last_active'
      } = options;

      // Via MCP: mcp__whatsapp__list_chats
      const response = await fetch('http://localhost:3000/mcp/whatsapp/list_chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit, page, include_last_message, sort_by })
      });
      return await response.json();
    } catch (error) {
      console.error('Error listing chats:', error);
      throw error;
    }
  }

  /**
   * Obtém chat específico
   */
  async getChat(chat_jid, include_last_message = true) {
    try {
      // Via MCP: mcp__whatsapp__get_chat
      const response = await fetch('http://localhost:3000/mcp/whatsapp/get_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_jid, include_last_message })
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting chat:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem (usado pela IA humanizada)
   */
  async sendMessage(recipient, message) {
    try {
      // Via MCP: mcp__whatsapp__send_message
      const response = await fetch('http://localhost:3000/mcp/whatsapp/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, message })
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Simula digitação humana - envia mensagem em etapas
   */
  async sendHumanizedMessage(recipient, fullMessage, options = {}) {
    const {
      chunkSize = 50, // caracteres por chunk
      delayBetweenChunks = 2000, // ms entre chunks
      addTypingIndicator = true
    } = options;

    try {
      // Se mensagem for curta, envia de uma vez
      if (fullMessage.length <= chunkSize) {
        return await this.sendMessage(recipient, fullMessage);
      }

      // Divide mensagem em chunks naturais (por frases/parágrafos)
      const chunks = this._splitMessageNaturally(fullMessage, chunkSize);
      const results = [];

      for (let i = 0; i < chunks.length; i++) {
        // Simula tempo de digitação baseado no tamanho do chunk
        const typingDelay = Math.min(chunks[i].length * 50, 3000); // max 3s

        if (addTypingIndicator && i < chunks.length - 1) {
          await this._simulateTyping(typingDelay);
        }

        // Envia chunk
        const result = await this.sendMessage(recipient, chunks[i]);
        results.push(result);

        // Pausa entre chunks (exceto no último)
        if (i < chunks.length - 1) {
          await this._sleep(delayBetweenChunks);
        }
      }

      return {
        success: true,
        chunks_sent: chunks.length,
        results
      };
    } catch (error) {
      console.error('Error sending humanized message:', error);
      throw error;
    }
  }

  /**
   * Divide mensagem naturalmente (respeitando frases e parágrafos)
   */
  _splitMessageNaturally(message, maxChunkSize) {
    const chunks = [];
    const sentences = message.match(/[^.!?]+[.!?]+/g) || [message];

    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks;
  }

  /**
   * Simula tempo de digitação
   */
  async _simulateTyping(duration) {
    // Em produção, poderia enviar indicador de "digitando..." via WhatsApp Web API
    await this._sleep(duration);
  }

  /**
   * Helper para pausas
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtém contexto de mensagem
   */
  async getMessageContext(message_id, before = 5, after = 5) {
    try {
      // Via MCP: mcp__whatsapp__get_message_context
      const response = await fetch('http://localhost:3000/mcp/whatsapp/get_message_context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id, before, after })
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting message context:', error);
      throw error;
    }
  }

  /**
   * Obtém última interação com contato
   */
  async getLastInteraction(jid) {
    try {
      // Via MCP: mcp__whatsapp__get_last_interaction
      const response = await fetch('http://localhost:3000/mcp/whatsapp/get_last_interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid })
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting last interaction:', error);
      throw error;
    }
  }
}

export default new WhatsAppService();