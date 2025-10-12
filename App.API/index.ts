import "reflect-metadata";

import http from "http";
import server from "./Server/index";

const { PORT } = process.env;

const httpServer = http.createServer({}, server);

httpServer.listen(PORT, async () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api/docs`,
  );
});
