import { useEffect, useState } from 'react';
import { dashboardAPI, contactsAPI } from '../services/api';
import { TrendingUp, DollarSign, Users } from 'lucide-react';

export default function Pipeline() {
  const [pipeline, setPipeline] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const [pipelineRes, contactsRes] = await Promise.all([
        dashboardAPI.getPipeline(),
        contactsAPI.list({ limit: 200 })
      ]);
      setPipeline(pipelineRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error('Erro ao carregar pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { id: 'prospecting', name: 'Prospecção', color: 'bg-blue-500' },
    { id: 'qualification', name: 'Qualificação', color: 'bg-yellow-500' },
    { id: 'proposal', name: 'Proposta', color: 'bg-orange-500' },
    { id: 'negotiation', name: 'Negociação', color: 'bg-purple-500' },
    { id: 'closing', name: 'Fechamento', color: 'bg-green-500' },
    { id: 'post_sale', name: 'Pós-Venda', color: 'bg-gray-500' },
  ];

  const getContactsByStage = (stage) => {
    return pipeline.filter(item => item.stage === stage);
  };

  const getTotalByStage = (stage) => {
    return getContactsByStage(stage).reduce((sum, item) => sum + (item.value || 0), 0);
  };

  const totalPipeline = pipeline.reduce((sum, item) => sum + (item.value || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline de Vendas</h1>
          <p className="text-gray-600 mt-1">{pipeline.length} oportunidades ativas</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                R$ {totalPipeline.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Oportunidades</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pipeline.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                R$ {pipeline.length > 0 ? (totalPipeline / pipeline.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageItems = getContactsByStage(stage.id);
            const stageTotal = getTotalByStage(stage.id);

            return (
              <div key={stage.id} className="space-y-3">
                {/* Stage Header */}
                <div className={`${stage.color} text-white rounded-lg p-3`}>
                  <h3 className="font-semibold text-sm">{stage.name}</h3>
                  <p className="text-xs mt-1 opacity-90">
                    {stageItems.length} ({stageTotal > 0 ? `R$ ${stageTotal.toLocaleString('pt-BR')}` : 'R$ 0'})
                  </p>
                </div>

                {/* Stage Items */}
                <div className="space-y-2">
                  {stageItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        {item.contacts?.name || 'Sem nome'}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {item.contacts?.phone_number}
                      </p>
                      {item.value && (
                        <p className="text-sm font-semibold text-green-600">
                          R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      {item.probability && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`${stage.color} h-1.5 rounded-full`}
                              style={{ width: `${item.probability}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{item.probability}% de chance</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {stageItems.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-4">
                      Nenhuma oportunidade
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}