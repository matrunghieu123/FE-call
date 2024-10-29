import React, { useEffect, useRef } from 'react';
import { Typography, Avatar, List } from 'antd';
import './MemberList.css';

// Hàm formatDate để định dạng thời gian theo kiểu "n phút trước", "n giờ trước", "n ngày trước"
const formatDate = (time) => {
    if (!time) return "Không có thời gian";

    // Kiểm tra nếu time chỉ là chuỗi thời gian (giờ, phút, giây)
    if (typeof time === 'string' && time.match(/\d{1,2}:\d{2}(:\d{2})? [APMapm]{2}/)) {
        // Lấy ngày hiện tại và thêm vào trước chuỗi thời gian
        const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dạng YYYY-MM-DD
        time = `${today} ${time}`; // Tạo chuỗi đầy đủ ngày giờ
    }

    const date = new Date(time);
    if (isNaN(date.getTime())) {
        return "Thời gian không hợp lệ";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000); // Tính số giây đã qua
    const diffInMinutes = Math.floor(diffInSeconds / 60); // Tính số phút đã qua
    const diffInHours = Math.floor(diffInMinutes / 60); // Tính số giờ đã qua
    const diffInDays = Math.floor(diffInHours / 24); // Tính số ngày đã qua
    const diffInMonths = Math.floor(diffInDays / 30); // Tính số tháng đã qua

    if (diffInSeconds < 60) {
        return "Vừa gửi"; // Nếu chưa đủ 1 phút
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    } else if (diffInDays < 30) {
        return `${diffInDays} ngày trước`;
    } else {
        return `${diffInMonths} tháng trước`; // Nếu đã trôi qua hơn 30 ngày
    }
};

const MemberList = ({ privateChats, setTab, tab, userData, setAvatarColors, source, members }) => { // Thêm members
    const avatarColors = useRef({});

    useEffect(() => {
        if (privateChats) {
            const newAvatarColors = { ...avatarColors.current };
            let hasChanged = false;

            privateChats.forEach((_, name) => {
                if (!newAvatarColors[name]) {
                    newAvatarColors[name] = getRandomColor();
                    hasChanged = true;
                }
            });

            if (hasChanged) {
                avatarColors.current = newAvatarColors;
                setAvatarColors(newAvatarColors); // Cập nhật state màu avatar trong ChatRoom
            }
        }
    }, [privateChats, setAvatarColors]);

    const getAvatar = (name) => {
        // Lấy URL từ database hoặc API
        return null; // Trả về null để sử dụng avatar mặc định của Ant Design
    };

    const getLastMessageTime = (name) => {
        const chat = privateChats.get(name);
        if (chat && chat.length > 0) {
            const lastMessage = chat[chat.length - 1];
            const time = lastMessage.time;
    
            return formatDate(time);
        }
        return "Không có tin nhắn";
    };    

    const getInitials = (name) => {
        const nameParts = name.split(' ');
        const initials = nameParts.map(part => part[0]).join('');
        return initials.toUpperCase();
    };

    const getRandomColor = () => {
        const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#ff4d4f', '#52c41a', '#1890ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const filteredChats = members || (tab === "CHATROOM"
        ? privateChats ? [...new Set(privateChats.keys())] : [] // Sử dụng Set để loại bỏ trùng lặp
        : source 
            ? privateChats ? [...new Set(privateChats.keys())].filter(name => name.includes(source)) : []
            : privateChats ? [...new Set(privateChats.keys())] : []);

    return (
        <div className="member-list">
            <List
                dataSource={filteredChats} // Sử dụng danh sách đã lọc
                renderItem={(name) => (
                    <List.Item
                        onClick={() => setTab(name, avatarColors.current[name])}
                        className={`member ${tab === name ? "active" : ""}`}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar style={{ backgroundColor: avatarColors.current[name] }} src={getAvatar(name)}>
                                    {getAvatar(name) ? null : getInitials(name)}
                                </Avatar>
                            }
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography.Text className="member-name">{name}</Typography.Text>
                                    <Typography.Text className="member-time" style={{ marginLeft: 'auto' }}>
                                        {getLastMessageTime(name)}
                                    </Typography.Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default MemberList;
