import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_URL;

/**
 * Gửi tin nhắn qua WebSocket cho Telegram.
 * @param {Object} message - Đối tượng tin nhắn cần gửi.
 * @returns {Promise<Object>} - Phản hồi từ server sau khi gửi tin nhắn.
 */
export const sendTelegramMessage = async (message) => {
    try {
        const response = await axios.post(`${baseUrl}/telegram/chatroom`, message);
        console.log('Telegram message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        throw error;
    }
};

/**
 * Tải lên tệp cho Telegram.
 * @param {File} file - Tệp cần tải lên.
 * @returns {Promise<Object>} - Phản hồi từ server sau khi tải lên tệp.
 */
export const uploadTelegramFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${baseUrl}/telegram/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('File uploaded successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Phân trang tin nhắn cho Telegram.
 * @param {number} page - Số trang cần lấy.
 * @param {number} size - Số lượng tin nhắn trên mỗi trang.
 * @returns {Promise<Object>} - Dữ liệu tin nhắn được phân trang từ server.
 */
export const getTelegramMessages = async (page, size) => {
    try {
        const response = await axios.get(`${baseUrl}/telegram/messages`, {
            params: { page, size },
        });
        console.log('Fetched paged messages:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching paged messages:', error);
        throw error;
    }
};
