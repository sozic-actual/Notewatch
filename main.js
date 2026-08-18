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

## Synopsis of what moved the needle. Make this as concise as possible. Do not include semicolons.




Returned as the JSON data structure below:

{
"date": "${date}"; (Change to MM-DD-YYYY)
"rating": "value",
"synopsis": "value",
}
Example
{
  "date": "08-10-2026",
  "rating": "72/100",
  "synopsis": "Significant progress on Notewatch (short-term goal #1), implementing key API and goal-fetching. Indirect contribution to software company ownership goal by learning Docker. Goal-setting session directly supports  clarity for long-term objectives. Academic work (Calc 1, Chem 2) and routine activities (bed-making, meditation) do not contribute to stated goals.",
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
    max_tokens: 1024,
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
    writeFile('output.csv', headers + "\r" + separated, 'utf-8', (err) => {
      if (err) throw err;
      console.log("File created.");
    })
  }
  else {
    appendFile('output.csv', "\r" + separated, 'utf-8', (err) => {
      if (err) throw err;
      console.log("Object appended.")
    })
  }
  
}

const goals = JSON.stringify(await logGoals());
const prompt = getPrompt(goals, "2026-08-12");
const response = await logLatest("2026-08-12");
const apiResponse = await getAPIResponse(response, prompt);
//const exampleReponse = {"date": "08-10-2026", "rating": "68/100", "synopsis": "Significant progress on Notewatch (short-term goal #1) with two focused coding sessions implementing API and goal-fetching functionality. Goal-setting session (30 min) directly supports strategic clarity for long-term objectives. Docker learning represents indirect contribution to software company ownership goal. Academic work (Calc 1, Chem 2) and routine activities (bed-making, meditation, reading) do not contribute to stated goals.", }

appendToCSV(JSON.parse(apiResponse));
/* const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }],
  model: "claude-haiku-4-5"
});

for (const block of message.content) {
  if (block.type === "text") {
    console.log(block.text);
  }
} */

/* const header = ['rating', 'title', 'response',];



const dataArrays = [
  [1, 'Mark', 'Otto', '@mdo'],
  [2, 'Jacob', 'Thornton', '@fat'],
  [3, 'Larry', 'the Bird', '@twitter'],
];
const dataObjects = [
  {
    number: 1,
    first: 'Mark',
    last: 'Otto',
    handle: '@mdo',
  },
  {
    number: 2,
    first: 'Jacob',
    last: 'Thornton',
    handle: '@fat',
  },
  {
    number: 3,
    first: 'Larry',
    last: 'the Bird',
    handle: '@twitter',
  },
];


async function logLatest(dateString) {

    return new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/${dateString}.md`, 'utf-8', (err, data) => {
        if (err) console.error(error);
        resolve(data);
        });
    })
    

}

const csvFromArrayOfArrays = convertArrayToCSV(dataArrays, {
  header: null,
  separator: ';'
});

const test = convertArrayToCSV(dataObjects, {
  header,
  separator: ';'
})


/Users/andyvu/Library/LaunchAgents/com.notewatch.daemon.plist



const response = await logLatest(todayString);
const escaped = todayString + ";" + JSON.stringify(response).slice(1, -1);

appendFile('output.csv', `\r${csvFromArrayOfArrays}`, err => {
    if (err) console.err(err);
}) */