/**
 * prdSchema.js
 * ------------------------------------------------------------------
 * JSON Schema describing the part of the PRD that the AI is asked to
 * DRAFT: the interpretation of the customer's request, the RACI plan,
 * and the five role-specific requirement blocks.
 *
 * This schema is passed to Claude via `output_config.format` (Structured
 * Outputs). Claude is GUARANTEED to return JSON matching this shape —
 * no retries, no malformed JSON, no missing fields.
 *
 * Design rule (important — do not break this when editing):
 *   Every property is listed in `required` and `additionalProperties`
 *   is `false` on every object, with NO optional fields and NO union
 *   types (no `anyOf` / nullable types). Claude's Structured Outputs
 *   has hard complexity limits on optional/union parameters per
 *   request (24 optional params, 16 union-type params). Keeping
 *   everything required keeps this schema safely under those limits
 *   no matter how many sections we add. If a field doesn't apply,
 *   the prompt instructs the AI to return an empty string/array
 *   instead of omitting it.
 *
 * NOTE: document-level facts (client name, dates, PRD ID, etc.) and
 * the sign-off / revision-history tables are intentionally NOT part
 * of this schema. Those are either already known by your own system
 * (passed in as input — see generatePRD.js) or are meant to be filled
 * in by humans after the document is generated (signatures, approval
 * dates). The AI's job is narrowly scoped to the interpretation and
 * execution-planning work — the part that's actually hard to do by
 * hand when a customer request is messy or ambiguous.
 */

const stringArray = (description, itemDescription) => ({
  type: "array",
  description,
  items: { type: "string", description: itemDescription || description },
});

const raciValue = {
  type: "string",
  description:
    'RACI value for this role on this activity. Must be one of: "R", "A", "R/A", "C", "I", or "-" (dash if the role has no involvement at all).',
};

const prdAiOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["interpretation", "goals", "raci", "roleRequirements", "timeline", "risks", "suggestedAttachments"],
  properties: {
    interpretation: {
      type: "object",
      description:
        "The team's translation of the raw, possibly ambiguous customer request into something unambiguous and actionable.",
      additionalProperties: false,
      required: ["teamUnderstanding", "assumptions", "clarifyingQuestions", "inScope", "outOfScope"],
      properties: {
        teamUnderstanding: {
          type: "string",
          description:
            "2-5 sentences restating the customer's request in clear, structured, unambiguous Indonesian. This is what the request actually means once disambiguated, not a copy of the raw text.",
        },
        assumptions: stringArray(
          "Concrete assumptions the team is making because the customer did not state them explicitly (e.g. target platform, scale, language). Empty array only if the request truly left nothing ambiguous.",
          "One specific assumption and why it was needed."
        ),
        clarifyingQuestions: stringArray(
          "Specific questions Admin Customer Service should ask the customer to confirm before/while work starts. Empty array only if nothing needs confirming.",
          "One specific, answerable question for the customer."
        ),
        inScope: stringArray(
          "Concrete deliverables/work items explicitly agreed to be included.",
          "One concrete in-scope item."
        ),
        outOfScope: stringArray(
          "Concrete items explicitly NOT included, especially things customers commonly assume are included but aren't (prevents scope creep).",
          "One concrete out-of-scope item."
        ),
      },
    },
    goals: {
      type: "object",
      additionalProperties: false,
      required: ["businessGoal", "successMetrics", "definitionOfDone"],
      properties: {
        businessGoal: {
          type: "string",
          description: "Why the customer needs this — the underlying business problem being solved, in 1-3 sentences.",
        },
        successMetrics: stringArray(
          "Concrete, measurable indicators of success (numbers/conditions where possible).",
          "One measurable success metric."
        ),
        definitionOfDone: {
          type: "string",
          description: "The specific condition(s) that mean this work item can be considered complete and handed over.",
        },
      },
    },
    raci: {
      type: "array",
      description:
        "6-10 rows mapping the key activities of this specific project/order to who is Responsible/Accountable/Consulted/Informed across the five roles. Tailor the activities to what this particular request actually requires.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["activity", "dev", "admin", "finance", "cs", "owner"],
        properties: {
          activity: { type: "string", description: "One concrete activity or deliverable, e.g. 'Menyusun estimasi biaya'." },
          dev: raciValue,
          admin: raciValue,
          finance: raciValue,
          cs: raciValue,
          owner: raciValue,
        },
      },
    },
    roleRequirements: {
      type: "object",
      description: "Requirements broken down per role, scoped to exactly what this role needs to execute their part.",
      additionalProperties: false,
      required: ["dev", "admin", "finance", "cs", "owner"],
      properties: {
        dev: {
          type: "object",
          additionalProperties: false,
          required: [
            "functionalRequirements",
            "nonFunctionalRequirements",
            "techStackNotes",
            "integrations",
            "userFlow",
            "constraints",
            "acceptanceCriteria",
          ],
          properties: {
            functionalRequirements: stringArray("Concrete features/functions to build.", "One concrete feature."),
            nonFunctionalRequirements: stringArray(
              "Performance, security, scalability, compatibility requirements.",
              "One non-functional requirement."
            ),
            techStackNotes: {
              type: "string",
              description:
                "Suggested platform/stack notes inferred from the request (web/mobile/desktop, likely integrations needed). State clearly this is a suggestion for the developer to confirm, not a fixed decision.",
            },
            integrations: stringArray("Third-party integrations likely needed (payment gateway, APIs, etc).", "One integration."),
            userFlow: { type: "string", description: "Short step-by-step description of the end-user flow." },
            constraints: { type: "string", description: "Known technical constraints or limitations to design around." },
            acceptanceCriteria: stringArray(
              "Specific, testable conditions that mean the technical work is acceptable.",
              "One testable acceptance criterion."
            ),
          },
        },
        admin: {
          type: "object",
          additionalProperties: false,
          required: ["tasks", "resources", "coordination", "documentation"],
          properties: {
            tasks: stringArray("Operational tasks needed to support this project.", "One operational task."),
            resources: stringArray("Resources/tools/access needed.", "One resource needed."),
            coordination: stringArray("Who needs to coordinate with whom, and about what.", "One coordination point."),
            documentation: stringArray("Reports/documentation that must be prepared.", "One documentation item."),
          },
        },
        finance: {
          type: "object",
          additionalProperties: false,
          required: ["budgetEstimateNotes", "paymentTermsSuggestion", "invoiceItems", "paymentStatus", "taxNotes"],
          properties: {
            budgetEstimateNotes: {
              type: "string",
              description:
                "A rough, clearly-labelled-as-preliminary cost breakdown narrative (components of cost, not a binding total). Always state this requires Admin Keuangan validation before being quoted to the customer. Never invent a precise final price.",
            },
            paymentTermsSuggestion: {
              type: "string",
              description: "A reasonable suggested payment structure (e.g. DP/pelunasan split), marked as a suggestion to confirm.",
            },
            invoiceItems: stringArray("Line items likely to appear on the invoice.", "One billable line item."),
            paymentStatus: { type: "string", description: 'Initial status, normally "Belum Dibayar".' },
            taxNotes: { type: "string", description: "Any tax/legal/contract notes relevant to this order, if applicable; otherwise a short note that none apply." },
          },
        },
        cs: {
          type: "object",
          additionalProperties: false,
          required: ["communicationPlan", "updateFrequency", "customerExpectations", "escalationProcedure", "faq"],
          properties: {
            communicationPlan: { type: "string", description: "Suggested channel/cadence for talking to this customer." },
            updateFrequency: { type: "string", description: "How often updates should be sent, e.g. 'setiap 3 hari kerja'." },
            customerExpectations: stringArray(
              "Expectations that need explicit, proactive management with this customer.",
              "One expectation to manage."
            ),
            escalationProcedure: { type: "string", description: "What CS should do if something goes wrong or the customer complains." },
            faq: stringArray("Questions this customer will likely ask, pre-answered.", "One anticipated question."),
          },
        },
        owner: {
          type: "object",
          additionalProperties: false,
          required: ["strategicAlignment", "riskAssessment", "budgetApproval", "finalDecisionNotes"],
          properties: {
            strategicAlignment: { type: "string", description: "Whether/how this order fits the business's direction." },
            riskAssessment: { type: "string", description: "Owner-level risk and urgency assessment." },
            budgetApproval: { type: "string", description: "What budget/resource approval is being requested, framed as a request, not a granted approval." },
            finalDecisionNotes: { type: "string", description: "Open items the owner specifically needs to decide or weigh in on." },
          },
        },
      },
    },
    timeline: {
      type: "array",
      description: "4-8 milestones from kickoff to project closure, tailored to this request.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["milestone", "pic", "targetDateNote", "status"],
        properties: {
          milestone: { type: "string", description: "One concrete milestone." },
          pic: { type: "string", description: "Who is responsible, by role (e.g. 'Full Stack Developer')." },
          targetDateNote: {
            type: "string",
            description: 'Relative timing since exact dates aren\'t known yet, e.g. "Minggu ke-1" — never invent a calendar date.',
          },
          status: { type: "string", description: 'Initial status, normally "Belum dimulai".' },
        },
      },
    },
    risks: {
      type: "array",
      description: "3-6 realistic risks specific to this request, not generic filler.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["risk", "impact", "mitigation", "pic"],
        properties: {
          risk: { type: "string", description: "One specific risk relevant to this project." },
          impact: { type: "string", description: "What happens if it occurs." },
          mitigation: { type: "string", description: "A concrete mitigation step." },
          pic: { type: "string", description: "Role best placed to own this risk." },
        },
      },
    },
    suggestedAttachments: stringArray(
      "Suggested supporting documents/links to attach (design refs, contracts, meeting notes) based on the request. Empty array if nothing specific is implied.",
      "One suggested attachment."
    ),
  },
};

module.exports = { prdAiOutputSchema };
