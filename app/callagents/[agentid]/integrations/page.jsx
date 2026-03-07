// app/callagents/[agentid]/integrations/page.jsx
//
// Per-agent integrations dashboard. The workspace-level integrations page
// (`/callagents/Integrations`) is for connecting *accounts*; this page is
// for defining what THIS agent should send and where.

import IntegrationsRulesPage from "./_components/IntegrationsRulesPage";

export const dynamic = "force-dynamic";

export default function AgentIntegrationsRoute() {
    return <IntegrationsRulesPage />;
}
