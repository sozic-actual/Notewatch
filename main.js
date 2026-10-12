import { readFile, writeFile, appendFile, existsSync, write } from "node:fs";
import { convertArrayToCSV } from "convert-array-to-csv";
import Anthropic from "@anthropic-ai/sdk";
import { resolve } from "node:dns";
import { type } from "node:os";
//       <string>--env-file=.env</string>

const today = new Date();
today.setDate(today.getDate() - 1);
const todayString = today.toLocaleDateString('sv-SE')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});



async function getPrompt(goals, date) {

  const prompt = await new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/Notewatch Prompt.md`, 'utf-8', (err, data) => {
        if (err) console.error(err);
        resolve(data);
        });
    });
  
  const response = goals + prompt;

  return response
  
}

async function logLatest(dateString) {

    return new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/Daily Notes/${dateString}.md`, 'utf-8', (err, data) => {
        if (err) console.error(err);
        resolve(dateString + "\n" + data);
        });
    })

}

// async function checkForLog(dateString) {
//   if 
// }

async function logGoals() {

    const longTermGoals = await new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/Long-term goals.md`, 'utf-8', (err, data) => {
        if (err) console.error(err);
        resolve(data);
        });
    })

    const shortTermGoals = await new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/Short-term goals.md`, 'utf-8', (err, data) => {
        if (err) console.error(err);
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
      console.log(`Object appended. Date: ${new Date()}`)
    })
  }
  
}

const goals = JSON.stringify(await logGoals());
const prompt = await getPrompt(goals, todayString);
const response = await logLatest(todayString);
const apiResponse = await getAPIResponse(response, prompt);

appendToCSV(JSON.parse(apiResponse));
