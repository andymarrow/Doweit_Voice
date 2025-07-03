// app/callagents/workflow/_components/AgentSelector.jsx
import React from 'react';
import { uiColors } from '../../_constants/uiConstants';

function AgentSelector({ agents, selectedAgentId, onSelectAgent, disabled }) {
    return (
        <select
            value={selectedAgentId || ''}
            onChange={(e) => onSelectAgent(parseInt(e.target.value, 10))}
            disabled={disabled}
             className={`form-select block w-fit text-sm rounded-md p-2 ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
             {/* Add a default option if no agent is selected */}
             {!selectedAgentId && <option value="">Select an Agent</option>}
             {/* Map over the list of agents received */}
            {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name} ({agent.type})</option>
            ))}
        </select>
    );
}

export default AgentSelector;