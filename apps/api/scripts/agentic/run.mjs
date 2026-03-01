import path from "node:path";
import { readText, writeText, runAgent } from "./lib.mjs";

const repoRoot = path.resolve(process.cwd(), "..", "..");
const brainPath = path.join(repoRoot, "docs/ai/PROJECT_BRAIN.md");
const outputDir = path.join(repoRoot, "docs/ai/output");

const cmd = process.argv[2];
const task = process.argv.slice(3).join(" ").trim() || "No task provided.";

if (!cmd) {
  console.error(
    'Usage: node scripts/agentic/run.mjs <plan|qa|review|release> "task"',
  );
  process.exit(1);
}

const brain = readText(brainPath);
const agentPromptPath = path.join(
  process.cwd(),
  "scripts/agentic/agents",
  `${cmd}.md`,
);
const agentPrompt = readText(agentPromptPath);

const model = process.env.OPENAI_AGENT_MODEL || "gpt-5";
const instructions = agentPrompt;
const input = `PROJECT_BRAIN:\n${brain}\n\nTASK:\n${task}\n`;

const text = await runAgent({ model, instructions, input });

const outFile = path.join(outputDir, `${cmd.toUpperCase()}_OUTPUT.md`);
writeText(outFile, text);

console.log(`Wrote: ${outFile}`);
