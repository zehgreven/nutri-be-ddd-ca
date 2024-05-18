import { Server } from './Server';

const mainApi = () => {
  const server = new Server();
  server.init();
  server.start();
};

mainApi();
