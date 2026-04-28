import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";

const app: Application = express();
app.use(cors());
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Healthcare Server");
});

app.use("/api/v1", router);

app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("PATH:", req.path);
  console.log("ORIGINAL URL:", req.originalUrl);
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req);
  res.status(404).json({
    success: false,
    message: "API not found",
    error: {
      path: req.originalUrl,
      message: "Your requested path not found",
    },
  });
});

app.use(globalErrorHandler);

export default app;
