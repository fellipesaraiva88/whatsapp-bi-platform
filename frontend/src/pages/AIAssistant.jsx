import { useState, useEffect } from 'react';
import { contactsAPI, aiAPI } from '../services/api';
import { Bot, Send, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function AIAssistant() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [intent, setIntent] = useState('follow_up');
  const [specificPoints, setSpecificPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.list({ limit: 100 });
      setContacts(response.data);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !intent) {
      setError('Selecione um contato e defina a intenção da mensagem');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const points = specificPoints.split('\n').filter(p => p.trim());

      const response = await aiAPI.sendMessage({
        recipient_jid: selectedContact,
        intent,
        specific_points: points
      });

      setResult(response.data);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError(error.response?.data?.error || 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const intentOptions = [
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'answer_question', label: 'Responder Pergunta' },
    { value: 'offer', label: 'Fazer Oferta' },
    { value: 'close_deal', label: 'Fechar Negócio' },
    { value: 'schedule_meeting', label: 'Agendar Reunião' },
    { value: 'thank_you', label: 'Agradecer' },
    { value: 'check_in', label: 'Verificar Status' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Bot className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Assistente de IA</h1>
        <p className="text-gray-600 mt-2">
          A IA aprende seu estilo de conversa e envia mensagens humanizadas em etapas
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
        {/* Contact Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Contato
          </label>
          <select
            value={selectedContact}
            onChange={(e) => setSelectedContact(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Escolha um contato...</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.jid}>
                {contact.name || contact.phone_number} - {contact.customer_type}
              </option>
            ))}
          </select>
        </div>

        {/* Intent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intenção da Mensagem
          </label>
          <select
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {intentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pontos Específicos a Mencionar (um por linha)
          </label>
          <textarea
            value={specificPoints}
            onChange={(e) => setSpecificPoints(e.target.value)}
            placeholder="Ex:&#10;Proposta enviada na sexta&#10;Desconto de 15% válido até domingo&#10;Novo recurso X disponível"
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            A IA irá incluir estes pontos de forma natural na mensagem
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Gerando e enviando...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Enviar Mensagem Humanizada
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Erro</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && result.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 text-lg">Mensagem Enviada com Sucesso!</h3>
              <p className="text-green-700 text-sm mt-1">
                Confiança da IA: {(result.confidence * 100).toFixed(0)}% | 
                Enviada em {result.chunks_sent} etapa(s)
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Mensagem Gerada:</span>
            </div>
            <p className="text-gray-900 whitespace-pre-wrap">{result.message}</p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Como Funciona
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• A IA analisa seu histórico de mensagens com o contato</li>
          <li>• Aprende seu estilo de escrita, tom e expressões comuns</li>
          <li>• Gera uma mensagem que parece ter sido escrita por você</li>
          <li>• Envia em etapas com pausas naturais (simulando digitação)</li>
          <li>• Registra a interação no CRM automaticamente</li>
        </ul>
      </div>
    </div>
  );
}