import React, { useState } from 'react';
import { Button, Drawer, Input, Steps, Table, Typography, Tag } from 'antd';
import { 
    EyeOutlined, 
    EditOutlined, 
    SearchOutlined, 
    FilterOutlined, 
    CaretUpOutlined, 
    CaretDownOutlined, 
    DeleteOutlined 
} from '@ant-design/icons';
import { FaPaperclip } from 'react-icons/fa';
import './TicketHandle.css';

const { TextArea } = Input;
const { Step } = Steps;
const { Title, Text } = Typography;

const columns = [
    {
        title: (
            <span className="column-title">
                User tạo/Update <SearchOutlined className="small-icon" />
            </span>
        ),
        dataIndex: 'user',
        key: 'user',
    },
    {
        title: (
            <span className="column-title">
                Trạng thái trước <FilterOutlined className="small-icon" />
            </span>
        ),
        dataIndex: 'statusBefore',
        key: 'statusBefore',
    },
    {
        title: (
            <span className="column-title">
                Trạng thái sau <FilterOutlined className="small-icon" />
            </span>
        ),
        dataIndex: 'statusAfter',
        key: 'statusAfter',
    },
    {
        title: (
            <span className="column-title">
                Ngày cập nhật
                <span className="column-icons">
                    <CaretUpOutlined className="small-icon"/>
                    <CaretDownOutlined className="small-icon" style={{ marginTop: '-5px' }} />
                </span>
            </span>
        ),
        dataIndex: 'updateDate',
        key: 'updateDate',
    },
    {
        title: (
            <span className="column-title">
                Nội dung <SearchOutlined className="small-icon" />
            </span>
        ),
        dataIndex: 'content',
        key: 'content',
    },
    {
        title: (
            <span className="column-title">
                File <SearchOutlined className="small-icon" />
            </span>
        ),
        dataIndex: 'file',
        key: 'file',
        render: (text) => <a href={text}>{text}</a>,
    },
];


const data = [
    {
        key: '1',
        user: 'Nguyễn Văn A',
        statusBefore: 'Đang xử lý',
        statusAfter: 'Hoàn thành',
        updateDate: '01-01-2024',
        content: 'Nội dung xử lý 1',
        file: 'file1.png',
    },
    {
        key: '2',
        user: 'Trần Thị B',
        statusBefore: 'Chờ xử lý',
        statusAfter: 'Đang xử lý',
        updateDate: '02-01-2024',
        content: 'Nội dung xử lý 2',
        file: 'file2.png',
    },
    {
        key: '3',
        user: 'Lê Văn C',
        statusBefore: 'Hoàn thành',
        statusAfter: 'Đang xử lý',
        updateDate: '03-01-2024',
        content: 'Nội dung xử lý 3',
        file: 'file3.png',
    },
    {
        key: '4',
        user: 'Phạm Thị D',
        statusBefore: 'Đang xử lý',
        statusAfter: 'Chờ xử lý',
        updateDate: '04-01-2024',
        content: 'Nội dung xử lý 4',
        file: 'file4.png',
    },
    {
        key: '5',
        user: 'Hoàng Văn E',
        statusBefore: 'Chờ xử lý',
        statusAfter: 'Hoàn thành',
        updateDate: '05-01-2024',
        content: 'Nội dung xử lý 5',
        file: 'file5.png',
    },
    {
        key: '6',
        user: 'Đỗ Thị F',
        statusBefore: 'Hoàn thành',
        statusAfter: 'Chờ xử lý',
        updateDate: '06-01-2024',
        content: 'Nội dung xử lý 6',
        file: 'file6.png',
    },
    {
        key: '7',
        user: 'Ngô Văn G',
        statusBefore: 'Đang xử lý',
        statusAfter: 'Hoàn thành',
        updateDate: '07-01-2024',
        content: 'Nội dung xử lý 7',
        file: 'file7.png',
    },
    {
        key: '8',
        user: 'Vũ Thị H',
        statusBefore: 'Chờ xử lý',
        statusAfter: 'Đang xử lý',
        updateDate: '08-01-2024',
        content: 'Nội dung xử lý 8',
        file: 'file8.png',
    },
    {
        key: '9',
        user: 'Bùi Văn I',
        statusBefore: 'Hoàn thành',
        statusAfter: 'Chờ xử lý',
        updateDate: '09-01-2024',
        content: 'Nội dung xử lý 9',
        file: 'file9.png',
    },
    {
        key: '10',
        user: 'Dương Thị J',
        statusBefore: 'Đang xử lý',
        statusAfter: 'Hoàn thành',
        updateDate: '10-01-2024',
        content: 'Nội dung xử lý 10',
        file: 'file10.png',
    },
    {
        key: '11',
        user: 'Lý Văn K',
        statusBefore: 'Chờ xử lý',
        statusAfter: 'Đang xử lý',
        updateDate: '11-01-2024',
        content: 'Nội dung xử lý 11',
        file: 'file11.png',
    },
];


const Ticket = ({ visible, onClose }) => {
    const [activeTab, setActiveTab] = useState('process'); // Mặc định là 'process'
    const [activeButton, setActiveButton] = useState('detail');

    const handleCloseTab = (tab) => {
        if (tab === activeTab) {
            setActiveTab('');
        }
    };

    return (
        <Drawer
            placement="right"
            onClose={onClose}
            open={visible}
            closable={false}
            title={
                <div className="ticket-header-top">
                    <div 
                        className={`ticket-tab ${activeTab === 'process' ? 'active' : 'inactive'}`} 
                        onClick={() => setActiveTab('process')}
                    >
                        Xử lý ticket
                        <span className="close-tab" onClick={() => handleCloseTab('process')}>×</span>
                    </div>
                    <div className="right-buttons">
                    <Button 
                            type="text" 
                            className="close-button" 
                            onClick={onClose}
                            style={{
                                padding: '4px',
                                right: '0',
                                left: 'auto',
                                width: 'auto',
                                borderRadius: '6px',
                            }}
                        >
                            Đóng tất cả
                            <span className="close-tab" onClick={() => handleCloseTab('process')}>×</span>
                        </Button>
                    </div>
                </div>
            }
        >
            <div 
                className="ticket-content"
                style={{
                    marginTop: '20px',
                }}
            >
                <div className="ticket-header">
                    <Button 
                        type="text" 
                        className={activeButton === 'detail' ? 'active-button' : ''}
                        onClick={() => setActiveButton('detail')}
                    >
                        Chi tiết <EyeOutlined />
                    </Button>
                    <Button 
                        type="text" 
                        className={activeButton === 'process' ? 'active-button' : ''}
                        onClick={() => setActiveButton('process')}
                    >
                        Xử lý <EditOutlined />
                    </Button>
                    <Button 
                        type="text"
                        className="delete-button"
                        style={{ 
                            backgroundColor: 'red', 
                            color: 'white' 
                        }}
                    >
                        Xóa <DeleteOutlined />
                    </Button>
                </div>
                <div className="ticket-info">
                    <Title level={4} className="ticket-title">Ticket xxxxx</Title>
                    <hr className="divider" />
                    <div className="ticket-details">
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Ngày tạo:</Text>
                            <Text className="ticket-detail-value">12-12-2024</Text>
                        </div>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Khách hàng:</Text>
                            <Text className="ticket-detail-value">Công ty X</Text>
                        </div>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Người tạo:</Text>
                            <Text className="ticket-detail-value">Nguyễn Huy Tuấn</Text>
                        </div>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Người xử lý:</Text>
                            <Text className="ticket-detail-value">Kiều Ngọc Khánh</Text>
                        </div>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Chủ đề ticket:</Text>
                            <Text className="ticket-detail-value"><Tag>Chủ đề 1</Tag> <Tag>Chủ đề 2</Tag></Text>
                        </div>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Trạng thái:</Text>
                        </div>
                        <Steps current={1} className="ticket-steps">
                            <Step title="Tạo mới" />
                            <Step title="Đang xử lý" />
                            <Step title="Update" />
                            <Step title="Waiting" />
                            <Step title="Hoàn thành" />
                        </Steps>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Thời hạn xử lý:</Text>
                            <Text className="ticket-detail-value">Trong hạn xử lý (còn 3 ngày)</Text>
                        </div>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Nhân viên liên quan:</Text>
                            <Text className="ticket-detail-value"><Tag>Nhân viên 1</Tag> <Tag>Nhân viên 2</Tag></Text>
                        </div>
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">Nội dung xử lý:</Text>
                        </div>
                        <TextArea placeholder="Ghi chú abc" />
                        <div className="ticket-detail-item">
                            <Text className="ticket-detail-label">File đính kèm:</Text>
                            <Text className="ticket-detail-value">
                                <a href="xxx.png">
                                    <FaPaperclip style={{ fontSize: '12px', color: 'gray' }} /> xxx.png
                                </a>
                                <a href="xxx.png">
                                    <FaPaperclip style={{ fontSize: '12px', color: 'gray' }} /> xxx.png
                                </a>
                                <a href="xxx.png">
                                    <FaPaperclip style={{ fontSize: '12px', color: 'gray' }} /> xxx.png
                                </a>
                            </Text>
                        </div>
                    </div>
                </div>
                <div 
                    className="ticket-history" 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center' 
                    }}
                >
                    <Title level={4} className="ticket-title">
                        Lịch sử tác động
                    </Title>
                    <hr className="divider" />
                    <Table 
                        columns={columns} 
                        dataSource={data} 
                        pagination={{ pageSize: 10 }} 
                        style={{ width: '100%' }} 
                        className="custom-table"
                    />
                </div>
                <div className="ticket-footer">
                    <Button type="primary">Lưu lại</Button>
                    <Button onClick={onClose} style={{ marginLeft: '10px' }}>Đóng</Button>
                </div>
            </div>
        </Drawer>
    );
};

export default Ticket;