import { Server } from "node:http";
import app from "./app";

const port = 4000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log("Server is running on port", port);
  });
}

main();
