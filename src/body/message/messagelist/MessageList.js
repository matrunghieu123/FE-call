import React, { useLayoutEffect } from 'react';
import { List, Avatar } from 'antd';
import './MessageList.css';
import ImageMessage from './imghanlde/ImageMessage';
import FileMessage from './filehandle/FileMessage';

const MessageList = ({ chats, userData, endOfMessagesRef, tab, avatarColors }) => {
    useLayoutEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chats, endOfMessagesRef, tab]);

    const renderFileContent = (fileUrl, fileType, fileName) => {
        if (fileType && fileType.startsWith('image/')) {
            return <ImageMessage src={fileUrl} alt="Sent image" />;
        } else if (fileType && fileType.startsWith('video/')) {
            return (
                <video controls width="250">
                    <source src={fileUrl} type={fileType} />
                    Trình duyệt của bạn không hỗ trợ video.
                </video>
            );
        } else if (fileUrl) {
            return <FileMessage fileUrl={fileUrl} fileType={fileType} fileName={fileName} />;
        } else {
            return null;
        }
    };
    
    const getInitials = (name) => {
        const nameParts = name.split(' ');
        const initials = nameParts.map(part => part[0]).join('');
        return initials.toUpperCase();
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    };

    return (
        <List
            className="chat-messages"
            itemLayout="horizontal"
            dataSource={chats && chats
                .filter(chat => {
                    if (tab === 'private') {
                        return (chat.senderName === userData.username || chat.receiverName === userData.username);
                    } else {
                        return true;
                    }
                })
                .sort((a, b) => new Date(a.time) - new Date(b.time))} // Sắp xếp tin nhắn theo thời gian
                renderItem={(chat, index) => {
                    const previousChat = chats[index - 1];
                    const isSameSender = index > 0 && previousChat && previousChat.senderName === chat.senderName;
                    const isFirstMessage = index === 0;
                    const isSelf = chat.senderName === userData.username;
                    const isNewSenderAfterDifferentUser = index > 0 && previousChat && previousChat.senderName !== chat.senderName;
                  

                    let avatarMeta = null;
                    let senderTimeWrapper = null;
                    let selfAvatar = null;

                    if (!isSameSender || isFirstMessage || isNewSenderAfterDifferentUser) {
                        if (isSelf) {
                            senderTimeWrapper = (
                                <div className="message-sender-time-wrapper self">
                                    <span className="message-sender">{chat.senderName}</span>
                                    <span className="message-time">{formatDateTime(chat.time)}</span>
                                </div>
                            );
                    
                            selfAvatar = (
                                <Avatar
                                    className="avatar self"
                                    style={{ backgroundColor: avatarColors[chat.senderName] || '#7265e6' }}
                                >
                                    {getInitials(chat.senderName)}
                                </Avatar>
                            );
                        } else {
                            avatarMeta = (
                                <List.Item.Meta
                                    avatar={
                                        <Avatar style={{ backgroundColor: avatarColors[chat.senderName] || '#7265e6' }}>
                                            {getInitials(chat.senderName)}
                                        </Avatar>
                                    }
                                    title={chat.senderName}
                                    description={chat.time ? formatDateTime(chat.time) : 'Không rõ thời gian'}
                                />
                            );
                        }
                    }                    

                    return (
                        <List.Item
                            key={index}
                            className={`message ${isSelf ? "self" : ""} no-border`}
                            title={chat.time ? `Gửi lúc: ${formatDateTime(chat.time)}` : ''}
                        >
                            {avatarMeta}
                            <div className="message-content-wrapper">
                                {senderTimeWrapper}
                                <div className={`message-content-inner ${isSelf ? "self" : ""}`}>
                                    <div className="message-data">
                                        {/* Hiển thị nội dung tin nhắn văn bản nếu có */}
                                        {chat.message && <span className="message-content">{chat.message}</span>}
                                        {/* Hiển thị nội dung file nếu có, bên dưới nội dung văn bản */}
                                        {chat.fileUrl && (
                                            <div className="message-file">
                                                {renderFileContent(chat.fileUrl, chat.fileType, chat.fileName)}
                                            </div>
                                        )}
                                        <span className="message-time-hover">{formatDateTime(chat.time)}</span>
                                    </div>
                                </div>
                            </div>
                            {selfAvatar}
                        </List.Item>
                    );
                }}                
        >
            <div ref={endOfMessagesRef} />
        </List>
    );
};

export default React.memo(MessageList);
