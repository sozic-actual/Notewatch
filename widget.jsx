import { css } from "uebersicht"
import Papa from 'papaparse';

const header = css`
  font-size: 20px;
  text-align: left;
  color: white;
  margin-left: 20px;
`

const boxes = css`
  display: flex;
  flex-direction: column;
  list-style-type: none;
`

const container = css`
  display: flex;
  flex-direction: column;
  width: 40vw;
  height: 29vh;
  background: rgba(0, 0, 0, 0.75);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  
  border: 1px solid rgba(106, 106, 106, 0.43); 
  backdrop-filter: blur(6.1px);
  -webkit-backdrop-filter: blur(6.1px);

`
const box = css`
  display: grid;
  grid-template-columns: 1fr 1fr 5fr;
  column-gap: 10px;
  margin-left: 20px;
  margin-top: 5px;
  font-size: 0.6vw;
  border-top: 1px solid rgba(106, 106, 106, 0.43)`


const header_container = css`
  display: grid;
  grid-template-columns: 1fr 1fr 5fr;
  column-gap: 10px;
  margin-left: 20px`

export const className = `
  left: 20px;
  top: 20px;
  width: 200px;
  color: white;
  font-family: monospace;
  
`

export const refreshFrequency = 28800000;
export const command = `tail -n 5 "/Users/andyvu/Library/Application Support/Übersicht/widgets/Notewatch/output.csv"`;

function parseCSVString(csvString) {
  return Papa.parse(csvString, [{header: false, delimiter: ';'}])
  
}


export const render = ({output}) => {
  const csvData = parseCSVString(output);
  return (
    <div className={container}>
      <h1 className={header}>NOTEWATCH</h1>
      <div className={header_container}>
        <div>Date</div>
        <div>Rating</div>
        <div>Synopsis</div>
      </div>
      
      <div className={boxes}>
        {csvData.data.map((csvRow) =>
        <li key={csvRow[0]} className={box}>
          <div>{csvRow[0]}</div>
          <div>{csvRow[1]}</div>
          <div>{csvRow[2]}</div>
        </li>)}
      </div>
    </div>
  )
}

