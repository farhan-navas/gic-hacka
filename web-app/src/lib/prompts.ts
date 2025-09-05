export const ANALYZE_SYSTEM = `You are a compliance analyst. Extract a concise summary of rules from a policy PDF and propose actionable, concrete steps for a trading platform. Keep actions imperative and specific. Output strict JSON.`;

export const ANALYZE_USER = (pdfText: string) => `
PDF CONTENT (truncated to fit model):
"""
${pdfText.slice(0, 15000)}
"""

Return JSON with:
{
  "summary": "2-6 bullet points (1-2 lines each) summarizing key compliance rules",
  "suggested_actions": [
    "Action 1 (clear, testable)",
    "Action 2",
    "Action 3"
  ]
}
`;

export const REFINE_SYSTEM = `You are improving compliance suggestions based on analyst feedback. Use the previous context and suggestions, address feedback, and return improved, implementable actions. Output strict JSON.`;

export const REFINE_USER = (args: {
  pdfText: string;
  previousActions: string[];
  feedback: string;
}) => `
PDF CONTEXT (truncated):
"""
${args.pdfText.slice(0, 15000)}
"""

PREVIOUS SUGGESTED ACTIONS:
${args.previousActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}

ANALYST FEEDBACK:
"${args.feedback}"

Return JSON with:
{
  "improved_actions": [
    "Revised Action 1",
    "Revised Action 2"
  ]
}
`;
