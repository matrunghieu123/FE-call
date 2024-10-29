import React, { useState } from 'react';
import { Avatar, Button, Typography } from 'antd';
import { UserAddOutlined, SolutionOutlined, PhoneOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';
import TicketAddDrawer from './ticket/TicketAdd';
import TicketHandle from './ticket/TicketHandle';
import IconTicket from './icon-ticket/ticket.png';
import './MessageInfor.css';

const { Text } = Typography;

const MessageInfor = ({ currentCustomer, userData }) => { // Đảm bảo userData được nhận từ props
    const [visible, setVisible] = useState(false);
    const [addVisible, setAddVisible] = useState(false);

    const getInitials = (name) => {
        const nameParts = name.split(' ');
        const initials = nameParts.map(part => part[0]).join('');
        return initials.toUpperCase();
    };

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    const showAddDrawer = () => {
        setAddVisible(true);
    };

    const onAddClose = () => {
        setAddVisible(false);
    };

    return (
        <div className='top-chat'>
            <div className="avatar-section">
                <div className="avatar-info">
                    <Avatar size={40} style={{ fontSize: 14, backgroundColor: currentCustomer.color || '#f56a00' }}>
                        {getInitials(currentCustomer.name)}
                    </Avatar>
                    <div className="info">
                        <Text strong>{currentCustomer.name}</Text><br />
                        <Text type="secondary">Không có số điện thoại</Text>
                    </div>
                </div>
                <div className="icons">
                    <Button icon={<UserAddOutlined />} size="middle" type="text" />
                    <Button 
                        size="middle" 
                        style={{ 
                            padding: '4px 0',
                            width: '32px',
                        }}
                        type="text" 
                        onClick={showAddDrawer}
                    >
                        <img 
                            src={IconTicket} 
                            alt="Ticket Icon" 
                            style={{ 
                                width: '16px', 
                                height: '16px',
                                padding: '0',
                            }} 
                        />
                    </Button>
                    <Button icon={<PhoneOutlined />} size="middle" type="text" />
                    <Button icon={<MailOutlined />} size="middle" type="text" />
                    <Button icon={<MessageOutlined />} size="middle" type="text" />
                    <Button icon={<SolutionOutlined />} size="middle" type="text" onClick={showDrawer} />
                </div>
            </div>
            <div className="link-section">
                <Avatar size={40} style={{ fontSize: 14, backgroundColor: '#1890ff' }}>U</Avatar>
                <div style={{ marginLeft: '10px' }}>
                    <Text strong>Tên BOT</Text>
                </div>
            </div>
            <TicketAddDrawer visible={addVisible} onClose={onAddClose} username={userData?.username} /> {/* Truyền username vào TicketAddDrawer */}
            <TicketHandle visible={visible} onClose={onClose} />
        </div>
    );
};

export default MessageInfor;