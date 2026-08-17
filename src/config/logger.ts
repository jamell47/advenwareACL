import morgan from "morgan";
import { env } from "../config/env";

const format = env.nodeEnv === "production" ? "combined" : ":method :url :status :response-time ms - :remote-addr";

export const morganMiddleware = morgan(format, {
  stream: {
    write: (message: string) => {
      const msg = message.trim();
      if (env.nodeEnv !== "test") {
        console.log(msg);
      }
    },
  },
});
