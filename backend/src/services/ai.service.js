import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Service - Claude Integration
 * Responsável por análise de conversas e geração de respostas humanizadas
 */
class AIService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = 'claude-sonnet-4-5-20250929';
  }

  /**
   * Analisa conversa e extrai insights
   */
  async analyzeConversation(messages) {
    try {
      const prompt = this._buildAnalysisPrompt(messages);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const analysis = JSON.parse(response.content[0].text);

      return {
        sentiment: analysis.sentiment,
        tone: analysis.tone,
        intent: analysis.intent,
        key_topics: analysis.key_topics,
        customer_mood: analysis.customer_mood,
        urgency_level: analysis.urgency_level,
        sales_stage: analysis.sales_stage,
        next_best_action: analysis.next_best_action,
        summary: analysis.summary
      };
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      throw error;
    }
  }

  /**
   * Aprende o estilo de conversa do usuário analisando mensagens anteriores
   */
  async learnConversationStyle(userMessages) {
    try {
      const prompt = `Analise as mensagens abaixo e extraia o estilo de comunicação desta pessoa:

MENSAGENS:
${userMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

Retorne em JSON:
{
  "writing_style": "descrição do estilo (formal/informal/técnico/etc)",
  "common_expressions": ["expressões frequentes"],
  "tone": "tom predominante (amigável/profissional/casual)",
  "message_length": "preferência de tamanho (curto/médio/longo)",
  "emoji_usage": "uso de emojis (frequente/moderado/raro/nunca)",
  "punctuation_style": "estilo de pontuação",
  "greeting_style": "como costuma cumprimentar",
  "closing_style": "como costuma despedir"
}`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error learning conversation style:', error);
      throw error;
    }
  }

  /**
   * Gera mensagem humanizada baseada no estilo aprendido
   */
  async generateHumanizedMessage(context) {
    const {
      conversation_history,
      user_style,
      intent, // 'follow_up', 'answer_question', 'offer', 'close_deal', etc
      specific_points = []
    } = context;

    try {
      const prompt = `Você é um assistente que escreve mensagens no estilo da pessoa.

ESTILO DA PESSOA:
${JSON.stringify(user_style, null, 2)}

HISTÓRICO DA CONVERSA:
${conversation_history.map((msg, i) =>
  `${msg.from_me ? 'Eu' : 'Cliente'}: ${msg.content}`
).join('\n')}

OBJETIVO DA MENSAGEM: ${intent}

PONTOS ESPECÍFICOS A MENCIONAR:
${specific_points.join('\n- ')}

INSTRUÇÕES:
1. Escreva UMA mensagem natural que pareça ter sido escrita pela pessoa
2. Mantenha o tom e estilo exatamente como ela escreveria
3. Use as expressões e emojis que ela costuma usar
4. Respeite o tamanho médio de mensagens dela
5. Seja natural e humano - evite parecer robótico
6. Mencione os pontos específicos de forma orgânica

Retorne em JSON:
{
  "message": "a mensagem completa",
  "confidence": 0.95,
  "reasoning": "breve explicação do por que esta mensagem parece natural"
}`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error generating humanized message:', error);
      throw error;
    }
  }

  /**
   * Sugere próxima interação baseada em análise de conversa
   */
  async suggestNextInteraction(contact_profile, conversation_analysis) {
    try {
      const prompt = `Analise o perfil do contato e a conversa para sugerir a próxima melhor ação.

PERFIL DO CONTATO:
${JSON.stringify(contact_profile, null, 2)}

ANÁLISE DA CONVERSA:
${JSON.stringify(conversation_analysis, null, 2)}

Retorne em JSON:
{
  "action_type": "send_message | schedule_call | send_proposal | follow_up | wait",
  "priority": "high | medium | low",
  "timing": "agora | em 2 horas | amanhã | próxima semana",
  "reasoning": "por que esta é a melhor ação agora",
  "message_intent": "se action é send_message, qual o objetivo",
  "suggested_content": "sugestão do que dizer/fazer",
  "expected_outcome": "resultado esperado desta ação"
}`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error suggesting next interaction:', error);
      throw error;
    }
  }

  /**
   * Categoriza automaticamente o contato para tags
   */
  async categorizeContact(contact_data, messages) {
    try {
      const prompt = `Analise o perfil e mensagens para categorizar este contato.

DADOS DO CONTATO:
${JSON.stringify(contact_data, null, 2)}

ÚLTIMAS MENSAGENS:
${messages.slice(-10).map(m => `${m.from_me ? 'Eu' : 'Cliente'}: ${m.content}`).join('\n')}

Retorne em JSON:
{
  "customer_type": "lead | prospect | active_customer | inactive | vip",
  "interest_level": "high | medium | low",
  "buying_stage": "awareness | consideration | decision | post_purchase",
  "tags": ["tag1", "tag2", "tag3"],
  "lifetime_value_prediction": "alto | médio | baixo",
  "churn_risk": "alto | médio | baixo"
}`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error categorizing contact:', error);
      throw error;
    }
  }

  /**
   * Extrai entidades importantes de mensagens (valores, produtos, datas)
   */
  async extractEntities(message) {
    try {
      const prompt = `Extraia entidades importantes desta mensagem:

MENSAGEM: "${message}"

Retorne em JSON:
{
  "values": [{"amount": 100, "currency": "BRL", "context": "preço mencionado"}],
  "products": ["produto1", "produto2"],
  "dates": [{"date": "2025-01-15", "context": "reunião agendada"}],
  "people": ["nome1", "nome2"],
  "companies": ["empresa1"],
  "locations": ["local1"],
  "actions": [{"action": "agendar reunião", "deadline": "próxima semana"}]
}`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error extracting entities:', error);
      throw error;
    }
  }

  /**
   * Constrói prompt para análise de conversa
   */
  _buildAnalysisPrompt(messages) {
    const conversation = messages.map(msg =>
      `${msg.from_me ? 'Eu' : 'Cliente'}: ${msg.content}`
    ).join('\n');

    return `Analise esta conversa de WhatsApp e retorne insights em JSON:

CONVERSA:
${conversation}

Retorne em JSON:
{
  "sentiment": "positive | negative | neutral",
  "tone": "friendly | professional | urgent | casual",
  "intent": "inquiry | complaint | purchase | support | other",
  "key_topics": ["tópico1", "tópico2"],
  "customer_mood": "satisfeito | neutro | frustrado | ansioso | empolgado",
  "urgency_level": "high | medium | low",
  "sales_stage": "prospecting | qualification | proposal | negotiation | closing | post_sale",
  "next_best_action": "descrição da melhor próxima ação",
  "summary": "resumo executivo da conversa em 2-3 frases"
}`;
  }
}

export default new AIService();