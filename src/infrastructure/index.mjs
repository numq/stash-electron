import {SocketClient} from "./client/SocketClient.js";

export const configureServices = () => {

    const SOCKET_URI = "ws://192.168.1.67:8080";
    const client = SocketClient(SOCKET_URI);

    return {
        client: client
    }
};