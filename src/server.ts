import { Server } from "http";
import app from "./app";
import config from "./config";

async function main() {
  try {
    const server: Server = app.listen(config.port, () => {
      console.log("Server is running on port", config.port);
      
      // Auto-ping the keep-alive endpoint every 5 minutes (300000 ms)
      // to prevent Render free tier from spinning down the service
      // and to keep the database connection warm.
      setInterval(() => {
        const url = process.env.BACKEND_URL 
          ? `${process.env.BACKEND_URL}`
          : `http://localhost:${config.port}/`;
          
        fetch(url)
          .then(res => res.text())
          .then(data => console.log("[KeepAlive] Auto-ping successful:", data))
          .catch(err => console.error("[KeepAlive] Auto-ping failed:", err.message));
      }, 13.5 * 60 * 1000);
    });

    // graceful shutdown
    process.on("SIGTERM", () => {
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

main();
