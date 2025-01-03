import axiosService from './axios_service';
import StompService from './stomp_service';

const baseUrl = 'http://118.70.155.34:8000';

class ChatApi {
  HandleUploadFile = async (file, adClientId, adOrgId, adUserId, cmChatGroupId) => {
    console.log('ChatApi - Tham số nhận được:', {
        file,
        adClientId,
        adOrgId,
        adUserId,
        cmChatGroupId
    });

    // Kiểm tra file
    if (!file) {
        throw new Error('File không hợp lệ');
    }

    const formData = new FormData();
    formData.append('adClientId', String(adClientId));
    formData.append('adOrgId', String(adOrgId));
    formData.append('adUserId', String(adUserId));
    formData.append('cmChatGroupId', String(cmChatGroupId));
    formData.append('file', file);

    return await axiosService('/api/chat/upload', {
        baseURL: baseUrl,
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data: formData
    });
  };

  HandleGetChatGroup = async (type = 'all', page = Number(0)) => {
    return await axiosService(`/api/chatgroup/${type}?page=${page}`, {
      baseURL: baseUrl,
      method: 'get',
    });
  };

  HandleGetHistoryMessage = async (chatGroupId, page = Number(0), size = Number(20)) => {
    try {
      const response = await axiosService(`/api/chat/history/${chatGroupId}?page=${page}&size=${size}`, {
        baseURL: baseUrl,
        method: 'get',
        params: {
          page,
          size: 20,
        },
      });
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử chat:', error);
      throw error;
    }
  };
}

export const connectToWebSocket = (stompClientRef, onMessageReceived, chatGroupId) => {
    const stompService = StompService.getInstance(chatGroupId);
    stompService.setOnMessageCallback(onMessageReceived);

    stompService.connect();

    stompClientRef.current = stompService;
    console.log("Đang cố gắng kết nối đến WebSocket");
};

export const onUserConnected = (stompClientRef, userData, onMessageReceived) => {
    console.log("Đã kết nối đến WebSocket", userData);

    const stompService = stompClientRef.current;
    stompService.setOnMessageCallback(onMessageReceived);

    // Thực hiện các hành động cần thiết khi người dùng kết nối
};

export const loadMessagesFromServer = async (username) => {
    const chatApi = new ChatApi();
    return await chatApi.HandleGetHistoryMessage(username, 0);
};

export const loadChatHistory = async (chatGroupId) => {
    const chatApi = new ChatApi();
    return await chatApi.HandleGetHistoryMessage(chatGroupId, 0);
};

const chatAPI = new ChatApi();
export default chatAPI;

