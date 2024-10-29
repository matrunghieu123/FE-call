import React, { useRef, useState, useEffect } from 'react';
import ColNavbar from '../colnavbar/ColNavbar';
import MessageList from '../body/message/messagelist/MessageList';
import SendMessage from '../body/message/sendmessage/SendMessage';
import MessageInfor from '../body/message/messageinfor/MessageInfor';
import MemberList from '../body/member/MemberList';
import FilterBar from '../body/filterbar/FilterMenu';
import ChatTool from '../body/chattool/ChatTool';
import CallDialog from './calldialog/CallDialog';
import { Input, Button } from 'antd';
import { 
    loadMessagesFromServer, 
    loadChatHistory, 
    sendMessageToServer, 
    fetchUsersBySource, 
    connectToWebSocket, 
    onUserConnected 
} from '../services/api';

const ChatRoom = () => {
    // State declarations
    const [privateChats, setPrivateChats] = useState(() => new Map());
    const [publicChats, setPublicChats] = useState([]);
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
    const [jsSIPService, setJsSIPService] = useState(null);

    // Refs
    const endOfMessagesRef = useRef(null);
    const stompClientRef = useRef(null);

    // Constants
    const baseUrl = process.env.REACT_APP_BASE_URL;

    // Functions
    const getAvatar = (name) => null;

    const toggleUpdateOrder = () => {
        setIsUpdatedAsc(!isUpdatedAsc);
    };

    const toggleCuuNhat = () => {
        setIsCuuNhatActive(!isCuuNhatActive);
    };

    const connect = () => {
        connectToWebSocket(stompClientRef, onConnected, onError);
    };

    const onConnected = () => {
        onUserConnected(stompClientRef, userData, onMessageReceived, onPrivateMessage);
        setUserData({ ...userData, connected: true });
    };

    const onMessageReceived = (payload) => {
        try {
            var payloadData = JSON.parse(payload.body);
            payloadData.fileUrl = payloadData.fileUrl || '';
            payloadData.fileName = payloadData.fileName || '';
            payloadData.fileType = payloadData.fileType || 'text';

            switch (payloadData.status) {
                case "JOIN":
                    if (!privateChats.get(payloadData.senderName)) {
                        privateChats.set(payloadData.senderName, []);
                        setPrivateChats(new Map(privateChats));
                    }
                    break;
                case "MESSAGE":
                    if (payloadData.receiverName === "Chat chung") {
                        setPublicChats(prevPublicChats =>
                            [...prevPublicChats, payloadData].sort((a, b) => new Date(a.time) - new Date(b.time))
                        );
                    } else {
                        addMessageToPrivateChat(payloadData);
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

    const onPrivateMessage = (payload) => {
        try {
            const payloadData = JSON.parse(payload.body);
            if (payloadData.senderName !== userData.username) {
                addMessageToPrivateChat(payloadData);
            }
        } catch (error) {
            console.error("Lỗi khi xử lý tin nhắn riêng:", error);
        }
    };

    const addMessageToPrivateChat = (message) => {
        setPrivateChats(prevChats => {
            const newChats = new Map(prevChats);
            const chatList = newChats.get(message.receiverName) || [];
            const messageId = `${message.senderName}-${message.time}`;
            if (!chatList.some(msg => `${msg.senderName}-${msg.time}` === messageId)) {
                newChats.set(message.receiverName, [...chatList, { ...message, id: messageId }]);
            }
            return newChats;
        });
    };

    const onError = (err) => {
        console.log("Lỗi kết nối WebSocket:", err);
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
            } else {
                sendPrivateValue(userData.message, files);
            }
        }
    };

    const handleUsername = (event) => {
        setUserData({ ...userData, username: event.target.value });
    };

    const sendValue = async (message, files = []) => {
        if (stompClientRef.current && (message.trim() !== '' || files.length > 0)) {
            try {
                let fileUrl = null;
                let fileName = null;
                let fileType = null;

                if (files.length > 0) {
                    const response = await sendMessageToServer(userData.username, "Chat chung", message, files[0]);
                    if (response.data && response.data.fileUrl) {
                        const relativePath = response.data.fileUrl.replace(/^.*[\\/]/, '');
                        fileUrl = `${baseUrl}/uploads/${relativePath}`;
                        fileName = files[0].name;
                        fileType = files[0].type;
                    }
                }

                const chatMessage = {
                    senderName: userData.username,
                    receiverName: "Chat chung",
                    message: message || "",
                    status: "MESSAGE",
                    fileType: fileType,
                    fileUrl: fileUrl,
                    time: new Date().toISOString()
                };

                stompClientRef.current.send("/app/message/public", {}, JSON.stringify(chatMessage));
                setPublicChats(prevPublicChats => [...prevPublicChats, { ...chatMessage, fileName }]);
                setUserData({ ...userData, message: "" });
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn:", error);
            }
        }
    };

    const sendPrivateValue = async (message, files = []) => {
        if (stompClientRef.current && (message.trim() !== '' || files.length > 0)) {
            try {
                let fileUrl = null;
                let fileName = null;
                let fileType = null;

                if (files.length > 0) {
                    const response = await sendMessageToServer(userData.username, tab, message, files[0]);
                    const responseData = response.data;

                    if (responseData && responseData.fileUrl) {
                        const relativePath = responseData.fileUrl.replace(/^.*[\\/]/, '');
                        fileUrl = `${baseUrl}/uploads/${relativePath}`;
                        fileName = files[0].name;
                        fileType = files[0].type;
                    }
                }

                const chatMessage = {
                    senderName: userData.username,
                    receiverName: tab,
                    message: message || "",
                    status: "MESSAGE",
                    fileType: fileType,
                    fileUrl: fileUrl,
                    time: new Date().toISOString()
                };

                stompClientRef.current.send("/app/private-message", {}, JSON.stringify(chatMessage));
                addMessageToPrivateChat({ ...chatMessage, fileName });
                setUserData({ ...userData, message: "" });
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn:", error);
            }
        }
    };

    const handleClearFilter = () => {
        setIsFilterCleared(true);
    };

    const handleResetFilter = () => {
        setIsFilterCleared(false);
    };

    const handleJoin = (memberName) => {
        setJoinedMembers(prev => new Map(prev).set(memberName, true));
        if (memberName === tab) {
            setIsJoined(true);
            const systemMessage = {
                senderName: 'System',
                message: `${userData.username} đã tham gia cuộc hội thoại.`,
                time: new Date().toISOString(),
                status: 'SYSTEM'
            };

            if (tab === "CHATROOM") {
                setPublicChats(prevPublicChats => [...prevPublicChats, systemMessage]);
            } else {
                setPrivateChats(prevChats => {
                    const newChats = new Map(prevChats);
                    const chatList = newChats.get(tab) || [];
                    newChats.set(tab, [...chatList, systemMessage]);
                    return newChats;
                });
            }
        }
    };

    const handleTransfer = (memberName) => {
        setJoinedMembers(prev => new Map(prev).set(memberName, false));
        if (memberName === tab) {
            setIsJoined(false);
        }
    };

    const handleSetTab = (name, color, source) => {
        setTab(name);
        setSource(source);
        const avatar = getAvatar(name);
        setCurrentCustomer({ name, avatar, color });
        setIsFilterCleared(false);
    };

    const handleSetAvatarColors = (colors) => {
        setAvatarColors(colors);
    };

    const setRemoteStream = (stream) => {
        // Xử lý stream từ xa
    };

    useEffect(() => {
        if (userData.connected) {
            loadMessagesFromServer(userData.username)
                .then(data => {
                    setPublicChats(data.publicMessages);
                    setPrivateChats(data.privateMessages);
                })
                .catch(error => console.error("Lỗi khi tải tin nhắn từ server: ", error));
        }
    }, [userData.connected, userData.username]);

    useEffect(() => {
        if (userData.connected) {
            loadChatHistory(userData.username, "Chat chung")
                .then(data => {
                    setPublicChats(data);
                })
                .catch(error => console.error("Lỗi khi tải lịch sử chat từ server: ", error));
        }
    }, [userData.connected, userData.username]);

    useEffect(() => {
        const loadUsers = async () => {
            if (source) {
                const users = await fetchUsersBySource(source);
                const newPrivateChats = new Map(users.map(user => [user, []]));
                setPrivateChats(newPrivateChats);
            } else {
                setPrivateChats(new Map());
            }
        };

        loadUsers();
    }, [source]);

    useEffect(() => {
        // Dọn dẹp khi component unmount
        return () => {
            console.log('Đang ngắt kết nối JsSIP...');
            if (jsSIPService) { // Kiểm tra jsSIPService có khác null không
                jsSIPService.disconnect(); 
            }
        };
    }, [jsSIPService]); // Thêm jsSIPService vào dependency array

    const onSearch = (value) => {
        console.log("Tìm kiếm:", value);
        // Thêm logic tìm kiếm của bạn ở đây
    };

    return (
        <div className="container">
            {userData.connected ? (
                <div className="container-1">
                    <div className="body-nav">
                        <div className="body-col-nav">
                            <div className="col-nav">
                                <ColNavbar
                                    setTab={handleSetTab}
                                    handleResetFilter={handleResetFilter}
                                    setLoginType={setLoginType}
                                    setSource={setSource}
                                    setMembers={setMembers}
                                    baseUrl={baseUrl}
                                />
                            </div>
                        </div>

                        <div className="chat-box-body">
                            <div className="chat-box">
                                <div className='member-search'>
                                    <div className='search-box'>
                                        <Input.Search
                                            className='search-button'
                                            placeholder="Tìm kiếm"
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
                                                        color: isCuuNhatActive ? 'black' : 'lightgray'
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
                                                setTab={handleSetTab}
                                                tab={tab}
                                                userData={userData}
                                                setAvatarColors={handleSetAvatarColors}
                                                source={source}
                                                members={members}
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
                                                            <MessageInfor currentCustomer={currentCustomer} userData={userData} />
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
                                                                    chats={tab === "CHATROOM" ? publicChats : (privateChats?.get(tab) || [])}
                                                                    tab={tab} userData={userData} endOfMessagesRef={endOfMessagesRef} avatarColors={avatarColors}
                                                                />
                                                                {!joinedMembers.get(tab) && (
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        marginTop: '10px',
                                                                    }}>
                                                                        <Button
                                                                            type="primary"
                                                                            onClick={() => handleJoin(tab)}
                                                                            style={{
                                                                                width: 'fit-content',
                                                                            }}
                                                                        >
                                                                            Tham gia
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {joinedMembers.get(tab) && (
                                                                <div style={{
                                                                    backgroundColor: 'white',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    flexDirection: 'column',
                                                                }}>
                                                                    <SendMessage
                                                                        userData={userData}
                                                                        handleMessage={handleMessage}
                                                                        handleKeyPress={handleKeyPress}
                                                                        sendValue={sendValue}
                                                                        sendPrivateValue={sendPrivateValue}
                                                                        tab={tab}
                                                                    />
                                                                    <Button
                                                                        type="default"
                                                                        onClick={() => handleTransfer(tab)}
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
                                                        avatar={userData.username[0].toUpperCase()}
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
            ) : (
                <div className="register">
                    {loginType === "CHATROOM" ? (
                        <>
                            <input
                                className='name-input'
                                id="user-name"
                                placeholder="Nhập tên của bạn"
                                name="userName"
                                value={userData.username}
                                onChange={handleUsername}
                            />
                            <button onClick={connect}>Kết nối</button>
                        </>
                    ) : (
                        <p>Vui lòng đăng nhập từ ứng dụng {loginType}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatRoom;
