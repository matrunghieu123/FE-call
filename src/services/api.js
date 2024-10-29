import axios from 'axios';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';
import { sendTelegramMessage, uploadTelegramFile, getTelegramMessages } from './app_api/TLapi';

const baseUrl = process.env.REACT_APP_BASE_URL;
const tokenUrl = process.env.REACT_APP_TOKEN_URL;
const callRecordUrl = process.env.REACT_APP_CALL_RECORD_URL;

/**
 * Tải tin nhắn từ server cho một người dùng cụ thể.
 */
export const loadMessagesFromServer = async (username) => {
    if (!username) {
        console.error("Username is required to load messages.");
        return [];
    }

    try {
        const response = await fetch(`${baseUrl}/api/chat/public?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (Array.isArray(data)) {
            return data.map(message => ({
                ...message,
                fileUrl: message.fileUrl || '',
                fileName: message.fileName || '',
                fileType: message.fileType || 'text'
            }));
        } else {
            console.error("Dữ liệu không phải là mảng:", data);
            return [];
        }
    } catch (error) {
        console.error("Lỗi khi tải tin nhắn từ server:", error);
        return [];
    }
};

/**
 * Tải lịch sử chat cho một người nhận cụ thể.
 */
export const loadChatHistory = async (receiverName) => {
    try {
        const response = await fetch(`${baseUrl}/api/chat/public?receiverName=${receiverName}`);
        const data = await response.json();

        return data.map(message => ({
            ...message,
            fileUrl: message.fileUrl || '',
            fileName: message.fileName || '',
            fileType: message.fileType || 'text'
        }));
    } catch (error) {
        console.error("Lỗi khi tải lịch sử chat từ server:", error);
        return [];
    }
};

/**
 * Gửi tin nhắn và tệp đính kèm (nếu có) lên server.
 */
export const sendMessageToServer = async (senderName, receiverName, messageText, file) => {
    const formData = new FormData();
    formData.append('senderName', senderName);
    formData.append('receiverName', receiverName);
    formData.append('message', messageText);
    if (file) formData.append('file', file);

    try {
        const response = await axios.post(`${baseUrl}/api/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log('Message sent successfully:', response.data);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Lấy danh sách người dùng từ một nguồn cụ thể.
 */
export const fetchUsersBySource = async (source) => {
    try {
        const endpointMap = {
            facebook: `${baseUrl}/api/facebook/users`,
            zalo: `${baseUrl}/api/zalo/users`,
            telegram: `${baseUrl}/api/chat/telegram`,
            viber: `${baseUrl}/api/viber/users`
        };

        if (!endpointMap[source]) throw new Error('Nguồn không hợp lệ');

        const response = await fetch(endpointMap[source]);

        if (!response.ok) {
            throw new Error(`Error fetching users: ${response.statusText}`);
        }

        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
};

/**
 * Kết nối đến WebSocket server.
 */
export const connectToWebSocket = (stompClientRef, onConnected, onError) => {
    const socket = new SockJS(`${baseUrl}/ws`);
    stompClientRef.current = over(socket);
    stompClientRef.current.connect({}, onConnected, onError);
    console.log("Đang cố gắng kết nối đến WebSocket");
};

/**
 * Xử lý khi người dùng kết nối thành công.
 */
export const onUserConnected = (stompClientRef, userData, onMessageReceived, onPrivateMessage) => {
    console.log("Đã kết nối đến WebSocket", userData);

    stompClientRef.current.subscribe('/topic/public', onMessageReceived);
    stompClientRef.current.subscribe(`/user/${userData.username}/private`, onPrivateMessage);

    userJoin();
    loadMessagesFromServer(userData.username);
    loadChatHistory(userData.username);
};

export const userJoin = () => console.log("User join logic executed.");

/**
 * Ví dụ sử dụng hàm Telegram API.
 */
export const handleEventAndSendTelegramMessage = async (message) => {
    try {
        const response = await sendTelegramMessage(message);
        console.log('Telegram message sent:', response);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};

export const handleFileUploadToTelegram = async (file) => {
    try {
        const response = await uploadTelegramFile(file);
        console.log('File uploaded to Telegram:', response);
    } catch (error) {
        console.error('Error uploading file to Telegram:', error);
    }
};

export const fetchTelegramMessages = async (page, size) => {
    try {
        const messages = await getTelegramMessages(page, size);
        console.log('Fetched Telegram messages:', messages);
        return messages;
    } catch (error) {
        console.error('Error fetching Telegram messages:', error);
    }
};

/**
 * Lấy token từ API.
 */
export const getAuthToken = async (clientId, orgId) => {
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: 'CRM',
                password: '1',
                parameters: {
                    languageName: 'Việt Nam',
                    languageCode: 'vi_VN',
                    clientId,
                    orgId
                }
            })
        });

        if (!response.ok) throw new Error('Failed to fetch token');
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error fetching token:', error);
        return null;
    }
};

/**
 * Gọi API Call Record.
 */
export const getCallRecord = async (token) => {
    try {
        const response = await axios.post(callRecordUrl, {
            callID: "20241010094039-LFYQGLOW-1593",
            callStatus: "hangup",
            direction: "outbound",
            callerNumber: "0903235622",
            destinationNumber: "9352",
            startTime: "2024-09-01T00:00:00Z",
            answerTime: "2024-09-01T00:00:00Z",
            endTime: "2024-09-01T00:00:00Z",
            hangupBy: "0",
            totalDuration: "31",
            holdingDuration: "0",
            recordingUrl: "20241010094039-LFYQGLOW-1593-103.5.210.80.82800039_0903235622_CSK_MBF_1286.mp3",
            objectId: "1",
            transactionID: "None",
            AD_User_ID: 1050147,
            eventType: "call",
            userName: "9352"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Call Record:", response.data);
    } catch (error) {
        console.error("Lỗi khi lấy Call Record:", error);
    }
};

/**
 * Thực thi quy trình lấy token và gửi Call Record.
 */
const fetchData = async () => {
    const token = await getAuthToken();
    if (token) await getCallRecord(token);
};

// Gọi hàm fetchData
fetchData();
