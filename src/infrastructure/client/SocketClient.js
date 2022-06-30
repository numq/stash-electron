export const SocketClient = uri => (() => {

    const socket = new WebSocket(uri);

    socket.addEventListener("open", () => {
        console.log("Connected.")
    });

    const initialize = (callback) => socket.addEventListener("message", ({data}) => {
        const message = JSON.parse(data.toString());
        console.log("message: %s", message.type)
        if (validSignal(message)) {
            callback(message.type, message.body);
        }
    });

    const pause = () => socket.pause;

    const resume = () => socket.resume;

    const close = () => socket.close;

    const signal = (type, body = {}) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket?.send(JSON.stringify({type: type, body: body}));
            console.log(`Sent message with type: ${type}`)
        }
    };

    const validSignal = message => message.type && message.body;

    return {
        initialize: initialize,
        pause: pause,
        resume: resume,
        close: close,
        signal: signal
    }
})(SocketClient || {});