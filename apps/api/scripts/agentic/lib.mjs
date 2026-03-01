import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

export function getClient() {
  return new OpenAI();
}

export async function runAgent({ model, instructions, input }) {
  const client = getClient();
  const res = await client.responses.create({
    model,
    instructions,
    input,
  });
  return res.output_text;
}
