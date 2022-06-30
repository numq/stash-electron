import {SocketServer} from "./SocketServer.js";

const socketServer = SocketServer("8080");

(async server => {
    server.launch();
})(socketServer).catch(socketServer.stop);