import { readFile, writeFile, appendFile, existsSync, write } from "node:fs";
import { convertArrayToCSV } from "convert-array-to-csv";
import Anthropic from "@anthropic-ai/sdk";
import { resolve } from "node:dns";
import { type } from "node:os";

const today = new Date();
today.setDate(today.getDate() - 1);
const todayString = today.toLocaleDateString('sv-SE')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});



function getPrompt(goals, date) {
  return `
You are an honest and constructively critical performance evaluator. Your job is to determine how much of the log's activities moved the user towards their long-term goals. 
Do not consider the following:
busyness of a day, total volume of tasks completed

Scoring is additive. Your job is to count evidence of progress, not to penalize for the absence of it. No deductions for doomscrolling, etc, as they simply don't contribute
to the score. 

GOALS:
${goals}


WEIGHTING RULES (only for activities logged)
High weight: Activites that directly contribute towards a short/long term goal
Medium weight: Activities that indirectly contribute towards a short/long term goal
Low weight: Academic coursework due to obligation UNLESS academics is specified as a long-term goal
No weight: Routine maintenance. Examples such as brushing teeth, showering, hygiene. Personal logs such as daily lessons or reflections.

ZERO-ACTIVITY RULE
If a document has absolutely nothing in it, or unproductive activities, rank that day as 0/100.

OUTPUT FORMAT:

## Rating: X/100 stars

## Synopsis of what moved the needle. Make this as concise as possible. Do not include semicolons. Your STRICT limit to this is 20 words. If something doesn't contribute, do not add it to the synopsis.


REFERENCE TABLE
Score	Day profile
0	Zero goal-related activity across all 10 goals.
5-10	1-2 goals touched indirectly only (e.g. skimmed an article, short walk). Rest untouched.
15-20	2-3 goals touched indirectly, or 1 goal touched directly at moderate level.
25-30	1 goal strong direct + 1-2 indirect touches elsewhere.
35-40	2 goals direct/moderate, a couple indirect touches.
45-50	2 goals strong direct, rest untouched or one indirect.
55-60	3 goals direct (mix of moderate/strong), rest untouched.
65-70	4 goals direct, at least 2 strong.
75-80	5 goals direct, 2-3 strong — roughly "half your goal system got real attention."
85-90	6-7 goals touched directly, most at strong level.
95-100	All or nearly all 10 goals touched directly, most/all at strong level — rare, "everything aligned" day.

Returned as the JSON data structure below:

{
"date": "${date}"; (Change to MM-DD-YYYY)
"rating": "value",
"synopsis": "value",
}
Example
{
  "date": "08-10-2026",
  "rating": "50/100",
  "synopsis": "Significant progress on Notewatch implementing key API and goal-fetching. Learned Docker. Set future goals.",
}

___
TODAY'S LOG:
`
}

async function logLatest(dateString) {

    return new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/${dateString}.md`, 'utf-8', (err, data) => {
        if (err) console.error(error);
        resolve(dateString + "\n" + data);
        });
    })

}

async function logGoals() {

    const longTermGoals = await new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/Long-term goals.md`, 'utf-8', (err, data) => {
        if (err) console.error(error);
        resolve(data);
        });
    })

    const shortTermGoals = await new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/Short-term goals.md`, 'utf-8', (err, data) => {
        if (err) console.error(error);
        resolve(data);
        });
    })
    
    return {
      longTermGoals,
      shortTermGoals
    }

}

async function getAPIResponse(response, prompt) {
  const params = {
    max_tokens: 1500,
    messages: [{ role: "user", content: `${prompt} ${response}` }],
    model: "claude-haiku-4-5",
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            date: { type: "string" },
            rating: { type: "string" },
            synopsis: { type: "string" },
          },
          required: ["date", "rating", "synopsis"],
          additionalProperties: false
        }
      }
    }
  }

  const message = await client.messages.create(params);

  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  return "Failed to get in time"
}

function appendToCSV(object) {
  const array = Object.values(object);
  const separated = array.join(";");
  const headers = "date;rating;synopsis";
  if (!existsSync('output.csv')) {
    writeFile('output.csv', headers + "\n" + separated, 'utf-8', (err) => {
      if (err) throw err;
      console.log("File created.");
    })
  }
  else {
    appendFile('output.csv', "\n" + separated, 'utf-8', (err) => {
      if (err) throw err;
      console.log("Object appended.")
    })
  }
  
}

const goals = JSON.stringify(await logGoals());
const prompt = getPrompt(goals, todayString);
const response = await logLatest(todayString);
const apiResponse = await getAPIResponse(response, prompt);

appendToCSV(JSON.parse(apiResponse));
