const PROPERTY_TYPE_LABELS = {
  single_family: "house",
  condo: "condo",
  townhouse: "townhouse",
  multi_family: "property",
  land: "property",
  other: "place",
};

const personalizeMessage = (template, client, agent) => {
  const propertyLabel = PROPERTY_TYPE_LABELS[client.property_type] || "place";
  const agentFullName = `${agent.first_name} ${agent.last_name}`;
  let message = template
    .replace(/\{\{first_name\}\}/g, client.first_name || "")
    .replace(/\{\{last_name\}\}/g, client.last_name || "")
    .replace(/\{\{city\}\}/g, client.city || "your area")
    .replace(/\{\{state\}\}/g, client.state || "")
    .replace(/\{\{property_type\}\}/g, propertyLabel)
    .replace(/\{\{agent_name\}\}/g, agentFullName)
    .replace(/\{\{company_name\}\}/g, agent.company_name || "")
    .trim();

  const signature = agent.company_name
    ? `\n\n— ${agentFullName}, ${agent.company_name}`
    : `\n\n— ${agentFullName}`;

  if (!message.includes(agentFullName)) {
    message += signature;
  }

  return message;
};

module.exports = { personalizeMessage };
