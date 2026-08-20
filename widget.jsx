import { css } from "uebersicht"

const header = css`
  font-family: Ubuntu;
  font-size: 20px;
  text-align: center;
  color: white;
`

const boxes = css`
  display: flex;
  justify-content: center;
`

const box = css({
  height: "40px",
  width: "40px",
  "& + &": {
    marginLeft: "5px"
  }
})

export const className = `
  left: 20px;
  top: 20px;
  width: 200px;
`
export const command = `cat "/Users/andyvu/Library/Application Support/Übersicht/widgets/Notewatch/output.csv"`;


export const render = ({output}) => {
  return (
    <div>
      <h1 className={header}>Some colored boxes</h1>
      <div className={boxes}>
        {typeof output}
      </div>
    </div>
  )
}

