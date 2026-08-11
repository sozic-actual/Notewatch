import { readFile, writeFile, appendFile } from "node:fs";
import { convertArrayToCSV } from "convert-array-to-csv";
import Anthropic from "@anthropic-ai/sdk";

const today = new Date();
today.setDate(today.getDate() - 1);
const todayString = today.toLocaleDateString('sv-SE')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function logLatest(dateString) {

    return new Promise((resolve, reject) => {
        readFile(`/Users/andyvu/Obsidian Vault/Obsidian Vault/${dateString}.md`, 'utf-8', (err, data) => {
        if (err) console.error(error);
        resolve(data);
        });
    })

}

async function getAPIResponse(response) {
  const params = {
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, Claude" }],
    model: "claude-haiku-4-5"
  }

  const message = await client.messages.create(params);

  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  
}


const response = await logLatest(todayString);
const apiResponse = await getAPIResponse(response);
console.log(apiResponse);



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