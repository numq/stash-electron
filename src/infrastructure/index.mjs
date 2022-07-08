import {SocketClient} from "./client/SocketClient.js";

export const configureServices = () => {

    const URI = "192.168.1.67";
    const SOCKET_URI = `ws://${URI}:8080`;
    const client = SocketClient(SOCKET_URI);

    return {
        uri: URI,
        client: client
    }
};