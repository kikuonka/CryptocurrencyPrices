import {useState, useEffect, useCallback} from "react";
import { io, Socket } from "socket.io-client";
import styles from './index.module.css';
type MessageType = {
    text: string;
    username?: string;
    timestamp: string;
}

type SystemMessageType = {
    text: string;
    timestamp: string;
}

type ChatMessage = {
    type: 'message' | 'system';
    data: MessageType | SystemMessageType
}

function CryptoChat() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const socket = 'wss://89.169.168.253:3666';
        const newSocket = io(socket, {
            transports: ["websocket"],
            reconnectionAttempts: 5,
            timeout: 5000,
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log('Соединение с сервером установлено');
            setSocket(newSocket);
        });
        newSocket.on('message', (message: MessageType) => {
            setMessages (prev => [...prev, { type: 'message', data: message }]);
        });
        newSocket.on('system', (systemMessage: SystemMessageType) => {
            setMessages (prev => [...prev, { type: 'system', data: systemMessage }]);
        });
        newSocket.on('disconnect', () => {
            console.log('Соединение с сервером разорвано');
            setSocket(null);
        });
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = useCallback(async () => {
        if (!socket || ! inputText.trim()) return;

        if (inputText.startsWith('/name ')) {
            const newUsername = inputText.split(' ')[1];
            socket.emit('set_username', { username: newUsername });
            setUsername(newUsername);
        } else {
            if (!username) {
                alert('Сначала установите имя с помощью команды /name "Ваше_Имя"');
                return;
            }
            socket.emit('message', { text: inputText });
        }
        setInputText('');
    }, [socket, inputText, username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendMessage();
    };

    return (
        <div className={styles.cryptoChat}>
            <h2 className={styles.titleChat}>Чат {username && `(${username})`}</h2>
            <div className={styles.messages}>
                {messages.map((msg, index) => (
                    <div key={index} className={styles.messagesType}>
                        {msg.type === 'system' ? (
                            <div className={styles.messageSystem}>
                                <em>{msg.data.text}</em>
                                <small>
                                    {new Date(msg.data.timestamp).toLocaleTimeString()}
                                </small>
                            </div>
                        ) : (
                            <div className={styles.messageUser}>
                                <strong>{(msg.data as MessageType).username}: </strong>
                                <span>{(msg.data as MessageType).text}</span>
                                <small>
                                    {new Date(msg.data.timestamp).toLocaleTimeString()}
                                </small>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <form className={styles.formChat} onSubmit={handleSubmit}>
                <input
                    className={styles.inputMessage}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                        username
                            ? "Введите сообщение..."
                            : "Установите имя: /name"
                    }
                    disabled={!socket?.connected}
                />
                <button
                    className={styles.button}
                    type="submit"
                    disabled={!socket?.connected || inputText.trim() === ""}>
                    Отправить
                </button>
            </form>
            <div className={styles.connectionStatus}>
                Статус: {socket?.connected ? 'Подключено' : 'Не подключено'}
            </div>
        </div>
    );
}

export default CryptoChat;
