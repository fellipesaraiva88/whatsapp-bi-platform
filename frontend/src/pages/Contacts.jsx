import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contactsAPI, syncAPI } from '../services/api';
import { Users, Search, Filter, RefreshCw } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [filterType]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = filterType !== 'all' ? { customer_type: filterType } : {};
      const response = await contactsAPI.list(params);
      setContacts(response.data);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncContacts = async () => {
    try {
      setSyncing(true);
      await syncAPI.contacts();
      await loadContacts();
    } catch (error) {
      console.error('Erro ao sincronizar contatos:', error);
    } finally {
      setSyncing(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number?.includes(searchTerm)
  );

  const getTypeColor = (type) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      active_customer: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      vip: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || colors.lead;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600 mt-1">{filteredContacts.length} contatos encontrados</p>
        </div>
        <button
          onClick={handleSyncContacts}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar WhatsApp'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Tipos</option>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="active_customer">Cliente Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="vip">VIP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Link
              key={contact.id}
              to={`/contacts/${contact.jid}`}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{contact.name || 'Sem nome'}</h3>
                    <p className="text-sm text-gray-500">{contact.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contact.customer_type)}`}>
                    {contact.customer_type?.replace('_', ' ')}
                  </span>
                </div>

                {contact.interest_level && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Interesse:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{contact.interest_level}</span>
                  </div>
                )}

                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contato encontrado</h3>
          <p className="text-gray-600">Tente sincronizar com o WhatsApp ou ajustar os filtros</p>
        </div>
      )}
    </div>
  );
}