import React, { useState, useEffect } from 'react';
import { DashboardLayout, Button, Toast } from '../components';
import { AgentsList } from '../components/AgentsList';
import { AgentDetails } from '../components/AgentDetails';
import { CreateAgentModal } from '../components/CreateAgentModal';
import { Plus, Users } from 'lucide-react';
import { fetchAgents } from '../services/agents';
import { isSuperAdmin } from '../services/auth';
import type { Agent } from '../types/agent';

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  const isSuperAdminUser = isSuperAdmin();

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await fetchAgents({
        offset: currentPage,
        limit: pageSize,
      });
      setAgents(response.agents);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to load agents',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setToast({ message: 'Agent created successfully', type: 'success' });
    loadAgents();
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-600 mt-1">Manage errand runners and service providers</p>
        </div>
        
        {isSuperAdminUser && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              Create New Agent
            </span>
          </Button>
        )}
      </div>

      {agents.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agents Found</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {isSuperAdminUser 
              ? "Get started by creating your first agent."
              : "There are no agents registered in the system at the moment."}
          </p>
        </div>
      ) : (
        <AgentsList
          agents={agents}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onAgentClick={handleAgentClick}
        />
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <AgentDetails
          agent={selectedAgent}
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};
