import { useRef, useState, useEffect, useCallback } from 'react';
import ColNavbar from '../colnavbar/ColNavbar';
import MessageList from '../body/message/messagelist/MessageList';
import SendMessage from '../body/message/sendmessage/SendMessage';
import MessageInfor from '../body/message/messageinfor/MessageInfor';
import MemberList from '../body/member/MemberList';
import FilterBar from '../body/filterbar/FilterMenu';
import ChatTool from '../body/chattool/ChatTool';
import CallDialog from './calldialog/CallDialog';
import { Input, Button, Modal } from 'antd';
import { 
    loadMessagesFromServer
} from '../services/chat_api';
import '../index.css';
import { useSelector } from 'react-redux';
import StompService from '../services/stomp_service';
import chatAPI from '../services/chat_api';
import JsSIPService from '../services/call_api/JsSIPService';

const ChatRoom = () => {
    // Lấy dữ liệu từ authReducer
    const authData = useSelector((state) => state.authReducer.data);

    // State declarations
    const [privateChats, setPrivateChats] = useState(() => new Map());
    const [tab, setTab] = useState("CHATROOM");
    const [loginType, setLoginType] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
    });
    const [isUpdatedAsc, setIsUpdatedAsc] = useState(true);
    const [isCuuNhatActive, setIsCuuNhatActive] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState({ name: '', avatar: '', color: '' });
    const [avatarColors, setAvatarColors] = useState({});
    const [source, setSource] = useState(null);
    const [joinedMembers, setJoinedMembers] = useState(new Map());
    const [members, setMembers] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isFilterCleared, setIsFilterCleared] = useState(true);
    const [currentMember, setCurrentMember] = useState(null);
    const [chatGroupId, setChatGroupId] = useState(null);
    // Message data
    const [messageData, setMessageData] = useState({});
    const [incomingSession, setIncomingSession] = useState(null);

    // Refs
    const endOfMessagesRef = useRef(null);
    const stompServiceRef = useRef(null);

    // Constants
    const baseUrl = 'http://118.70.155.34:8000';

    // Functions
    const toggleUpdateOrder = () => {
        setIsUpdatedAsc(!isUpdatedAsc);
    };

    const toggleCuuNhat = () => {
        setIsCuuNhatActive(!isCuuNhatActive);
    };

    const stompService = StompService.getInstance(userData.username);

    const connect = () => {
        stompService.connect();
        stompService.setOnMessageCallback(onMessageReceived);
        console.log("Connected to stomp service");
    };

    const processedMessages = new Set();

     const onMessageReceived = (payload) => {
        try {
            console.log("Message received:", payload);
            if (!payload || !payload.body) {
                throw new Error("Payload không hợp lệ");
            }

            var payloadData = JSON.parse(payload.body);
            payloadData.fileUrl = payloadData.fileUrl || '';
            payloadData.fileName = payloadData.fileName || '';
            payloadData.fileType = payloadData.fileType || 'text';

            if (processedMessages.has(payloadData.id)) {
                return;
            }
            processedMessages.add(payloadData.id);

            if (privateChats.has(payloadData.id)) {
                console.warn("Tin nhắn đã được xử lý:", payloadData.id);
                return;
            }

            switch (payloadData.status) {
                case "JOIN":
                    if (!privateChats.get(payloadData.senderName)) {
                        privateChats.set(payloadData.senderName, []);
                        setPrivateChats(new Map(privateChats));
                    }
                    break;
                case "MESSAGE":
                    if (payloadData.receiverName) {
                        setPrivateChats(prevChats => {
                            const newChats = new Map(prevChats);
                            const chatList = newChats.get(payloadData.receiverName) || [];
                            chatList.push(payloadData);
                            newChats.set(payloadData.receiverName, chatList);
                            return newChats;
                        });
                    } else {
                        console.error("receiverName is undefined in payloadData");
                    }
                    break;
                default:
                    console.warn(`Nhận được tin nhắn với trạng thái không xác định: ${payloadData.status}`);
                    break;
            }
        } catch (error) {
            console.error("Lỗi khi xử lý tin nhắn nhận được:", error);
        }
    };

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, message: value });
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            const files = selectedFiles.map(fileObj => fileObj.file);
            if (tab === "CHATROOM") {
                sendValue(userData.message, files);
            }
        }
    };

    // Phương thức để xử lý thông tin file và trả về chuỗi
    const getFileDetailsString = (files) => {
        if (files.length === 0) return null;

        const fileUrl = URL.createObjectURL(files[0]);
        return {
            uri: `${fileUrl.split('/').pop()}fileUrl_${files[0].name}`,
            type: files[0].type,
            name: files[0].name,
        };
    };

    // Hàm sendValue sau khi chỉnh sửa
    const sendValue = useCallback(async (message, files = []) => {
        console.log("Sending message:", message, "with files:", files);

        if (!stompService.isConnected()) {
            console.warn('Cannot send message. Not connected.');
            return;
        }

        const messageStr = String(message);
        if (messageStr.trim() === '' && files.length === 0) {
            console.warn('Cannot send message. Message is empty.');
            return;
        }

        try {
            const file = getFileDetailsString(files);
            if (file) {
                console.log('File to upload:', file);
                
                const formData = new FormData();
                formData.append('adClientId', String(messageData.adClientId));
                formData.append('adOrgId', String(messageData.adOrgId));
                formData.append('adUserId', String(currentMember.conversationId));
                formData.append('cmChatGroupId', String(messageData.cmChatGroupId));
                formData.append('file', files[0]);

                await chatAPI.HandleUploadFile(formData);
            }

            if (messageStr) {
                const chatMessage = {
                    adClientId: messageData.adClientId,
                    adOrgId: messageData.adOrgId,
                    adUserId: messageData.adUserId,
                    cmChatGroupId: messageData.cmChatGroupId,
                    contentText: messageStr,
                    dataType: files.length > 0 ? "File" : "Text",
                    createdBy: messageData.createdBy,
                    updatedBy: messageData.updatedBy,
                    created: new Date().toISOString()
                };

                console.log('Sending chat message:', chatMessage);
                stompService.sendMessage(chatMessage);

                setPrivateChats(prevChats => {
                    const newChats = new Map(prevChats);
                    const chatList = newChats.get("CHATROOM") || [];
                    chatList.push({ ...chatMessage, fileName: file ? file.name : null });
                    newChats.set("CHATROOM", chatList);
                    return newChats;
                });

                setUserData({ ...userData, message: "" });
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }, [stompService, messageData, userData]);


    const handleClearFilter = () => {
        setIsFilterCleared(true);
    };

    const handleJoin = (memberName) => {
        setJoinedMembers(prev => {
            const newJoinedMembers = new Map(prev);
            newJoinedMembers.set(memberName, true);
            return newJoinedMembers;
        });

        if (memberName === tab) {
            const systemMessage = {
                senderName: 'System',
                message: `${userData.username} đã tham gia cuộc hội thoại.`,
                time: new Date().toISOString(),
                status: 'SYSTEM'
            };

            setPrivateChats(prevChats => {
                const newChats = new Map(prevChats);
                const chatList = newChats.get(tab) || [];
                newChats.set(tab, [...chatList, systemMessage]);
                return newChats;
            });
        }
    };

    const handleTransfer = (memberName) => {
        setJoinedMembers(prev => new Map(prev).set(memberName, false));
        if (memberName === tab) {
            setIsJoined(false);
        }
    };

    const handleMemberClick = (member) => {
        setCurrentMember(member);
        setChatGroupId(member.CM_ChatGroup_ID);
        setUserData(prevUserData => ({
            ...prevUserData,
            adClientId: member.AD_Client_ID || prevUserData.adClientId,
            adOrgId: member.AD_Org_ID || prevUserData.adOrgId,
            adUserId: member.conversationId || prevUserData.adUserId,
            message: '',
        }));
        if (!joinedMembers.get(member.name)) {
            handleJoin(member.name);
        }
        setIsFilterCleared(false);
    };

    // Handle receive data from MessageList
    const handleReceiveData = (data) => {
        setMessageData(data);

        // Cập nhật currentMember và chatGroupId
        setCurrentMember(prev => ({
            ...prev,
            adClientId: data.adClientId,
            adOrgId: data.adOrgId,
            adUserId: data.adUserId,
            cmChatId: data.cmChatId,
            createdBy: data.createdBy,
            updatedBy: data.updatedBy
        }));
        setChatGroupId(data.cmChatGroupId);
    };

    // useEffect hooks
    useEffect(() => {
        if (authData && authData.token && !stompService.isConnected()) {
            console.log("Tên người dùng:", authData.token);
            setUserData((prevUserData) => ({
                ...prevUserData,
                username: authData.token,
            }));
            connect();
        }
    }, [authData, stompService]);

    useEffect(() => {
        if (userData.connected && userData.username) {
            loadMessagesFromServer(userData.username)
                .then(data => {
                    if (Array.isArray(data)) {
                        console.log("Tin nhắn tải về:", data);
                    } else {
                        console.error("Dữ liệu không phải là mảng:", data);
                    }
                })
                .catch(error => console.error("Lỗi khi tải tin nhắn từ server: ", error));
        }
    }, [userData.connected, userData.username]);

    useEffect(() => {
        console.log("Đang cố gắng kết nối đến WebSocket");
        connect();
    }, [connect]);

    useEffect(() => {
        if (authData.token) {
            setUserData((prevUserData) => ({
                ...prevUserData,
                username: authData.token,
            }));
        }
    }, [authData]);

    useEffect(() => {
        if (!stompServiceRef.current) {
            stompServiceRef.current = new StompService(chatGroupId);
            stompServiceRef.current.setOnMessageCallback(sendValue);
        }

        if (!stompServiceRef.current.isConnected()) {
            stompServiceRef.current.connect();
        }

        return () => {
            stompServiceRef.current?.disconnect();
        };
    }, [chatGroupId]);

    useEffect(() => {
        const jsSIPService = new JsSIPService();
        jsSIPService.initializeAndConnect();
        jsSIPService.registerEventHandlers();

        jsSIPService.onIncomingCall((session) => {
            console.log('Incoming call session:', session);
            setIncomingSession(session);
        });

        jsSIPService.eventEmitter.on('callEnded', () => {
            console.log('Call ended, closing modal.');
            setIncomingSession(null);
        });

        return () => {
            jsSIPService.disconnect();
        };
    }, []);

    const onSearch = (value) => {
        console.log("Tìm kiếm:", value);
    };

    // Ví dụ: Gọi cuộc gọi từ ChatRoom
    const handleMakeCall = (number) => {
        const jsSIPService = new JsSIPService();
        jsSIPService.makeCall(number);
    };

    const handleAcceptCall = () => {
        if (incomingSession) {
            incomingSession.answer();
            setIncomingSession(null);
        }
    };

    const handleRejectCall = () => {
        if (incomingSession) {
            console.log('Rejecting call...');
            console.log('Session status:', incomingSession.status);
            incomingSession.terminate();
            setIncomingSession(null);
        } else {
            console.log('No active session to reject.');
        }
    };

    return (
        <div className="chatroom-container">
            <div className="chatroom-container-1">
                <div className="chatroom-body-nav">
                    <div className="body-col-nav">
                        <div className="col-nav">
                            <ColNavbar
                                setTab={setTab}
                                setLoginType={setLoginType}
                                handleClearFilter={handleClearFilter}
                            />
                        </div>
                    </div>

                    <div className="chat-box-body">
                        <div className="chat-box">
                            <div className='member-search'>
                                <div className='search-box'>
                                    <Input.Search className='search-button' placeholder="Tìm kiếm"
                                        allowClear
                                        onSearch={onSearch}
                                        size='large'
                                        style={{ borderRadius: '4px', borderColor: '#d9d9d9' }}
                                    />
                                </div>

                                <div className='search-box'>
                                    <Input.Search
                                        className='search-button'
                                        placeholder="Tìm kiếm từ ngày đến ngày ..."
                                        allowClear
                                        size='large'
                                        style={{ borderRadius: '4px', borderColor: '#d9d9d9' }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                        margin: '16px',
                                    }}
                                >
                                    <span onClick={toggleUpdateOrder} style={{ cursor: 'pointer' }}>
                                        Thời gian cập nhật
                                        <span style={{ marginLeft: '5px', fontSize: '12px' }}>
                                            {isUpdatedAsc ? '▼' : '▲'}
                                        </span>
                                    </span>
                                    <span
                                        onClick={toggleCuuNhat}
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {isCuuNhatActive ? 'Mới nhất' : 'Cũ nhất'}
                                        <span
                                            style={{
                                                marginLeft: '5px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                color: isCuuNhatActive ? 'lightgray' : 'black'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    transform: 'scale(1, 0.6)',
                                                    color: isCuuNhatActive ? 'lightgray' : 'black'
                                                }}
                                            >
                                                &#9650;
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    transform: 'scale(1, 0.6)',
                                                    marginTop: '-8px',
                                                    color: isCuuNhatActive ? 'blackz' : 'lightgray'
                                                }}
                                            >
                                                &#9660;
                                            </span>
                                        </span>
                                    </span>
                                </div>

                                <div className='member-box'>
                                    <div className='member-list'>
                                        <MemberList
                                            privateChats={privateChats}
                                            setTab={(name) => {
                                                handleMemberClick(name);
                                            }}
                                            tab={tab}
                                            setAvatarColors={setAvatarColors}
                                            source={source}
                                            baseUrl={baseUrl}
                                            setCurrentMember={(member) => {
                                                setCurrentMember(member);
                                            }}
                                            setChatGroupId={setChatGroupId}
                                            onMemberClick={handleMemberClick}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="chat-content">
                                <div
                                    style={{
                                        margin: '16px 16px 0px 12px',
                                    }}
                                >
                                    <FilterBar onClearFilter={handleClearFilter} />
                                </div>

                                {isFilterCleared ? (
                                    <div className="empty-screen">
                                        <p>Chưa chọn cuộc hội thoại</p>
                                    </div>
                                ) : (
                                    <div className='chat-border'>
                                        <div className='chat-input'>
                                            <div className='text-input'>
                                                <div>
                                                    <div
                                                        style={{
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <MessageInfor 
                                                            currentCustomer={currentCustomer} 
                                                            userData={userData} 
                                                            currentMember={currentMember} 
                                                            botInfo={currentMember?.botInfo || { avatar: null, name: 'Tên BOT' }} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className='chat-input-box'>

                                                    <div className='chat-input-box-1'>
                                                        <div style={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            overflow: 'hidden',
                                                            position: 'relative',
                                                            flexDirection: 'column',
                                                        }}>
                                                            <MessageList
                                                                chats={privateChats.get(currentMember?.name) || []}
                                                                tab={tab}
                                                                userData={userData}
                                                                endOfMessagesRef={endOfMessagesRef}
                                                                avatarColors={avatarColors}
                                                                members={members}
                                                                chatGroupId={chatGroupId}
                                                                setMessages={setPrivateChats}
                                                                baseUrl={baseUrl}
                                                                currentMember={currentMember}
                                                                onReceiveData={handleReceiveData}
                                                            />
                                                            {!joinedMembers.get(currentMember?.name) && (
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    marginTop: '10px',
                                                                }}>
                                                                    <Button
                                                                        type="primary"
                                                                        onClick={() => handleJoin(currentMember?.name)}
                                                                        style={{
                                                                            width: 'fit-content',
                                                                        }}
                                                                    >
                                                                        Tham gia
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {joinedMembers.get(currentMember?.name) && (
                                                            <div style={{
                                                                backgroundColor: 'white',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                flexDirection: 'column',
                                                            }}>
                                                                <SendMessage
                                                                    userData={{
                                                                        ...userData,
                                                                        adClientId: messageData.adClientId,
                                                                        adOrgId: messageData.adOrgId,
                                                                        adUserId: currentMember?.conversationId,
                                                                        cmChatGroupId: messageData.cmChatGroupId,
                                                                        message: userData.message
                                                                    }}
                                                                    handleMessage={handleMessage}
                                                                    handleKeyPress={handleKeyPress}
                                                                    sendValue={sendValue}
                                                                    tab={tab}
                                                                    selectedFiles={selectedFiles}
                                                                    setSelectedFiles={setSelectedFiles}
                                                                />
                                                                <Button
                                                                    type="default"
                                                                    onClick={() => handleTransfer(currentMember?.name)}
                                                                    style={{
                                                                        marginTop: '10px',
                                                                        backgroundColor: '#0ec50e',
                                                                        color: 'white',
                                                                    }}
                                                                >
                                                                    Chuyển nhân viên phụ trách
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='chat-tool-wrapper'>
                                            <div className='chat-tool-body'>
                                                <ChatTool
                                                    avatar={userData.username ? userData.username[0].toUpperCase() : ''}
                                                    userName={userData.username}
                                                    isJoined={joinedMembers.get(tab)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <CallDialog members={members} />
            </div>
            {incomingSession && (
                <Modal
                    title="Cuộc gọi đến"
                    open={true}
                    onOk={handleAcceptCall}
                    onCancel={handleRejectCall}
                    footer={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button key="cancel" onClick={handleRejectCall}>
                                Hủy
                            </Button>
                            <Button key="ok" type="primary" onClick={handleAcceptCall}>
                                Nghe
                            </Button>
                        </div>
                    }
                >
                    <p>Có cuộc gọi đến từ số: {incomingSession.remote_identity.uri.user}</p>
                </Modal>
            )}
        </div>
    );
};

export default ChatRoom;
