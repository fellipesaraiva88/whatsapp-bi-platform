import { useEffect, useState } from 'react';
import { messagesAPI, whatsappAPI } from '../services/api';
import { Search, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.jid);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await whatsappAPI.listChats(50);
      setChats(response.data);
      if (response.data.length > 0) {
        setSelectedChat(response.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatJid) => {
    try {
      const response = await messagesAPI.list(chatJid, 100);
      setMessages(response.data.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.jid?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mensagens</h1>

      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Chat List */}
        <div className="col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chats */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.jid}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedChat?.jid === chat.jid ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{chat.name || 'Sem nome'}</h3>
                      {chat.last_message_time && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(chat.last_message_time), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    {chat.last_message && (
                      <p className="text-sm text-gray-600 truncate">{chat.last_message}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.name || 'Sem nome'}</h2>
                  <p className="text-sm text-gray-500">{selectedChat.jid}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.from_me
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.from_me ? 'text-blue-100' : 'text-gray-500'}`}>
                        {format(new Date(msg.timestamp), 'dd/MM HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p>Selecione uma conversa para ver as mensagens</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}