/**
 * prdSchema.js
 * ------------------------------------------------------------------
 * JSON Schema describing the 27-Section Architecture for Wave Projects PRD.
 */

const stringArray = (desc) => ({ type: "array", description: desc, items: { type: "string" } });

const allProperties = {
  // 1
  pendahuluan: {
    type: "object", additionalProperties: false, required: ["projectName", "version", "date", "clientInfo", "overview"],
    properties: { projectName: { type: "string" }, version: { type: "string" }, date: { type: "string" }, clientInfo: { type: "string" }, overview: { type: "string" } }
  },
  // 2
  okr: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["objective", "keyResult", "target"], properties: { objective: { type: "string" }, keyResult: { type: "string" }, target: { type: "string" } } }
  },
  // 3
  functionalRequirements: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["id", "feature", "pic", "priority"], properties: { id: { type: "string" }, feature: { type: "string" }, pic: { type: "string" }, priority: { type: "string" } } }
  },
  // 4
  nonFunctionalRequirements: {
    type: "object", additionalProperties: false, required: ["performance", "security", "scalability", "accessibility"],
    properties: { performance: { type: "string" }, security: { type: "string" }, scalability: { type: "string" }, accessibility: { type: "string" } }
  },
  // 5
  userStories: stringArray("Format: 'Sebagai [Role], saya ingin [aksi], sehingga [manfaat]'"),
  // 6
  scopeBatasan: {
    type: "object", additionalProperties: false, required: ["inScope", "outOfScope"],
    properties: { inScope: stringArray("Daftar In-Scope"), outOfScope: stringArray("Daftar Out-of-Scope") }
  },
  // 7
  arsitekturSistem: {
    type: "object", additionalProperties: false, required: ["dataFlow", "techStack", "folderStructure", "corePseudocode"],
    properties: { dataFlow: stringArray("Urutan flow Frontend -> API -> Database"), techStack: { type: "string" }, folderStructure: { type: "string" }, corePseudocode: { type: "string" } }
  },
  // 8
  schemaDatabase: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["table", "columns", "relations", "index"], properties: { table: { type: "string" }, columns: { type: "string" }, relations: { type: "string" }, index: { type: "string" } } }
  },
  // 9
  apiSpecification: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["module", "method", "path", "body", "response", "auth", "requestPayloadExample", "responsePayloadExample"], properties: { module: { type: "string" }, method: { type: "string" }, path: { type: "string" }, body: { type: "string" }, response: { type: "string" }, auth: { type: "string" }, requestPayloadExample: { type: "string" }, responsePayloadExample: { type: "string" } } }
  },
  // 10
  uiUxGuidelines: {
    type: "object", additionalProperties: false, required: ["colorPalette", "typography", "layout", "responsiveness"],
    properties: { colorPalette: { type: "string" }, typography: { type: "string" }, layout: { type: "string" }, responsiveness: { type: "string" } }
  },
  // 11
  roleAccessMapping: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["role", "feature", "crudPermissions"], properties: { role: { type: "string" }, feature: { type: "string" }, crudPermissions: { type: "string" } } }
  },
  // 12
  thirdPartyIntegrations: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["service", "provider", "purpose"], properties: { service: { type: "string" }, provider: { type: "string" }, purpose: { type: "string" } } }
  },
  // 13
  seoAndPerformance: {
    type: "object", additionalProperties: false, required: ["metaTags", "openGraph", "optimizationStrategy"],
    properties: { metaTags: { type: "string" }, openGraph: { type: "string" }, optimizationStrategy: { type: "string" } }
  },
  // 14
  testingStrategy: {
    type: "object", additionalProperties: false, required: ["unitTest", "integrationTest", "uat", "browserMatrix"],
    properties: { unitTest: { type: "string" }, integrationTest: { type: "string" }, uat: { type: "string" }, browserMatrix: { type: "string" } }
  },
  // 15
  deploymentStrategy: {
    type: "object", additionalProperties: false, required: ["environment", "cicdPipeline", "domainConfig"],
    properties: { environment: { type: "string" }, cicdPipeline: { type: "string" }, domainConfig: { type: "string" } }
  },
  // 16
  devOpsMonitoring: {
    type: "object", additionalProperties: false, required: ["logging", "errorTracking", "uptimeAlerting"],
    properties: { logging: { type: "string" }, errorTracking: { type: "string" }, uptimeAlerting: { type: "string" } }
  },
  // 17
  securityChecklist: stringArray("Daftar keamanan seperti HTTPS, CORS, rate limiting, dll"),
  // 18
  estimasiBiaya: {
    type: "object", additionalProperties: false, required: ["costBreakdown", "paymentMethod", "schedule"],
    properties: { costBreakdown: stringArray("Breakdown anggaran"), paymentMethod: { type: "string" }, schedule: { type: "string" } }
  },
  // 19
  komunikasiKolaborasi: {
    type: "object", additionalProperties: false, required: ["tools", "frequency", "pics"],
    properties: { tools: { type: "string" }, frequency: { type: "string" }, pics: stringArray("Channel PIC") }
  },
  // 20
  timelineRisiko: {
    type: "object", additionalProperties: false, required: ["ganttMilestones", "risks", "mitigation"],
    properties: { ganttMilestones: stringArray("Timeline per milestone"), risks: stringArray("Risiko"), mitigation: stringArray("Mitigasi") }
  },
  // 21
  persetujuanSignOff: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["role", "name", "date"], properties: { role: { type: "string" }, name: { type: "string" }, date: { type: "string" } } }
  },
  // 22
  analyticsTracking: {
    type: "object", additionalProperties: false, required: ["metrics", "tools"],
    properties: { metrics: stringArray("Metrics tracked"), tools: { type: "string" } }
  },
  // 23
  kepatuhanDataPDP: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["item", "description", "compliance"], properties: { item: { type: "string" }, description: { type: "string" }, compliance: { type: "string" } } }
  },
  // 24
  backupDisasterRecovery: {
    type: "object", additionalProperties: false, required: ["rtoRpo", "drProcedures"],
    properties: { rtoRpo: stringArray("Tabel RTO/RPO"), drProcedures: stringArray("5 langkah DR") }
  },
  // 25
  acceptanceCriteria: stringArray("9 Kriteria Definition of Done"),
  // 26
  slaDukungan: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["tier", "duration", "description"], properties: { tier: { type: "string" }, duration: { type: "string" }, description: { type: "string" } } }
  },
  // 27
  glossary: {
    type: "array", items: { type: "object", additionalProperties: false, required: ["term", "meaning"], properties: { term: { type: "string" }, meaning: { type: "string" } } }
  }
};

const allKeys = Object.keys(allProperties);
const part1Keys = allKeys.slice(0, 9);
const part2Keys = allKeys.slice(9, 18);
const part3Keys = allKeys.slice(18, 27);

function createSchema(keys) {
  const props = {};
  keys.forEach(k => props[k] = allProperties[k]);
  return { type: "object", additionalProperties: false, required: keys, properties: props };
}

const prdAiOutputSchemaPart1 = createSchema(part1Keys);
const prdAiOutputSchemaPart2 = createSchema(part2Keys);
const prdAiOutputSchemaPart3 = createSchema(part3Keys);
const prdAiOutputSchema = createSchema(allKeys);

module.exports = { prdAiOutputSchemaPart1, prdAiOutputSchemaPart2, prdAiOutputSchemaPart3, prdAiOutputSchema };
