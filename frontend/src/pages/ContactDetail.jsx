import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contactsAPI, messagesAPI, aiAPI, interactionsAPI } from '../services/api';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Tag, 
  TrendingUp, 
  MessageSquare,
  Bot,
  Clock,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ContactDetail() {
  const { jid } = useParams();
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadContactData();
  }, [jid]);

  const loadContactData = async () => {
    try {
      setLoading(true);
      const [contactRes, messagesRes, interactionsRes] = await Promise.all([
        contactsAPI.get(jid),
        messagesAPI.list(jid, 20),
        interactionsAPI.list(jid, 20)
      ]);
      setContact(contactRes.data);
      setMessages(messagesRes.data);
      setInteractions(interactionsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados do contato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const response = await aiAPI.analyze(jid);
      setAnalysis(response.data.analysis);
      await loadContactData(); // Reload to get updated data
    } catch (error) {
      console.error('Erro ao analisar contato:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Contato não encontrado</p>
        <Link to="/contacts" className="text-blue-600 hover:underline mt-4 inline-block">
          Voltar para contatos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/contacts" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{contact.name || 'Sem nome'}</h1>
          <p className="text-gray-600 mt-1">{contact.phone_number}</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <Bot className={`h-4 w-4 ${analyzing ? 'animate-pulse' : ''}`} />
          {analyzing ? 'Analisando...' : 'Analisar com IA'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'messages', 'interactions', 'analysis'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' && 'Visão Geral'}
              {tab === 'messages' && 'Mensagens'}
              {tab === 'interactions' && 'Interações'}
              {tab === 'analysis' && 'Análise IA'}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{contact.phone_number}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 capitalize">{contact.customer_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 capitalize">{contact.interest_level || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 capitalize">{contact.buying_stage?.replace('_', ' ') || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Mensagens</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{messages.length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Interações</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{interactions.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Mensagens</h3>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${msg.from_me ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {msg.from_me ? 'Você' : contact.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(msg.timestamp), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Interações</h3>
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {interaction.interaction_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(interaction.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{interaction.content}</p>
                      {interaction.ai_generated && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600">
                          <Bot className="h-3 w-3" />
                          Gerado por IA
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de IA</h3>
              {analysis ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sentimento</p>
                    <p className="text-lg text-gray-900 mt-1 capitalize">{analysis.sentiment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tom</p>
                    <p className="text-lg text-gray-900 mt-1 capitalize">{analysis.tone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Intenção</p>
                    <p className="text-lg text-gray-900 mt-1 capitalize">{analysis.intent}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resumo</p>
                    <p className="text-gray-700 mt-1">{analysis.summary}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Próxima Ação Sugerida</p>
                    <p className="text-gray-700 mt-1">{analysis.next_best_action}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Clique em "Analisar com IA" para ver os insights</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}