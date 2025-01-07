const logStyle = `
  background: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Arial', sans-serif;
`;

const timestampStyle = `
  color: #999;
  font-size: 10px;
`;

const getCurrentTimestamp = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
};
const log = (message: any, style: string = "") => {
  if (typeof message === "string")
    return console.log(`%c[${getCurrentTimestamp()}] %c${message}`, timestampStyle, logStyle.concat(style));

  console.log(`%c[${getCurrentTimestamp()}]`, timestampStyle, message);
};
const debug = (message: any) => log(message);
const info = (message: any) => {
  const infoStyle = "background:rgba(212,169,28,0.6);color:#fff;";
  log(message, infoStyle);
};
const error = (message: any) => {
  const errorStyle = "background:#d41c1c;color:#fff;";
  log(message, errorStyle);
};

export default { info, error, debug };
