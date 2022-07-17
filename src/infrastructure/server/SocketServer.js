import WebSocket from "ws";
import {createServer} from "http";

export const SocketServer = port => (() => {

    const httpServer = createServer();
    const webSocketServer = new WebSocket.Server({server: httpServer});

    const broadcast = (server, msg) => server.clients.forEach(client => client.send(msg));

    const launch = () => (port => {
        webSocketServer.addListener("open", () => {
            console.log(`Server with address ${webSocketServer.address()} connected`);
        });
        webSocketServer.addListener("close", () => {
            console.log(`Server closed.`);
        });
        webSocketServer.addListener("error", err => {
            console.error(`An error occurred:\n${err}`);
        });
        webSocketServer.addListener("connection", socket => {
            socket.onopen = _ => console.log("Client connected.");
            socket.onclose = _ => console.log("Client disconnected.");
            socket.onmessage = ({data}) => broadcast(webSocketServer, data);
        });
        httpServer.listen(port);
    })(port);

    const stop = () => webSocketServer?.close();

    return {
        launch: launch,
        stop: stop
    }
})(SocketServer || {});