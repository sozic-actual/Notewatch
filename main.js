import { readFile, writeFile, appendFile } from "node:fs";
import { convertArrayToCSV } from "convert-array-to-csv";
import Anthropic from "@anthropic-ai/sdk";

const today = new Date();
today.setDate(today.getDate() - 1);
const todayString = today.toLocaleDateString('sv-SE')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const prompt = `
You are an honest and constructively critical performance evaluator. Your job is to determine how much of the log's activities moved the user towards their long-term goals. 
Do not consider the following:
busyness of a day, total volume of tasks completed

Scoring is additive. Your job is to count evidence of progress, not to penalize for the absence of it. No deductions for doomscrolling, etc, as they simply don't contribute
to the score. 

LONG TERM GOALS:


WEIGHTING RULES (only for activities logged)
High weight: Activites that directly contribute towards a long-term goal
Medium weight: Activities that indirectly contribute towards a long-term goal
Low weight: Academic coursework due to obligation UNLESS academics is specified as a long-term goal
No weight: Routine maintenance. Examples such as brushing teeth, showering, hygiene. Personal logs such as daily lessons or reflections.

ZERO-ACTIVITY RULE
If a document has absolutely nothing in it, or unproductive activities, rank that day as 0/100.

OUTPUT FORMAT (respond only in this structure):

## Rating: X/100 stars

## Synopsis of what moved the needle
- (bullet list, tie each item to a specific goal — omit this section if none)

## Estimated goal-time ratio
X% of logged meaningful time went toward long-term goals

## One honest note
(1-2 sentences of direct, non-sugarcoated feedback on today specifically). 

Returned as the JSON data structure below:

{
"rating": "value",
"synopsis": "value",
"ratio": "value",
"note": "value",
}

___
TODAY'S LOG:
`

async function logLatest(dateString) {

    return new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/${dateString}.md`, 'utf-8', (err, data) => {
        if (err) console.error(error);
        resolve(dateString + "\n" + data);
        });
    })

}

async function logGoals() {

    const message = new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/Goals MOC.md`, 'utf-8', (err, data) => {
        if (err) console.error(error);
        resolve(data);
        });
    })
    return message

}

async function getAPIResponse(response, prompt) {
  const params = {
    max_tokens: 1024,
    messages: [{ role: "user", content: `${prompt} ${response}` }],
    model: "claude-haiku-4-5"
  }

  const message = await client.messages.create(params);

  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  return "Failed to get in time"
}

const response = await logGoals();
console.log(response);

// const response = await logLatest(todayString);
// const apiResponse = await getAPIResponse(response, prompt);
// console.log(apiResponse);



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






const response = await logLatest(todayString);
const escaped = todayString + ";" + JSON.stringify(response).slice(1, -1);

appendFile('output.csv', `\r${csvFromArrayOfArrays}`, err => {
    if (err) console.err(err);
}) */