import React, { useState } from 'react';
import { Button, Drawer, Input, Typography, Select, Radio } from 'antd';
import CreatableSelect from 'react-select/creatable';
import IconImage from './icon/downbox.png';
import playImage from './icon/play.png';

import './TicketAdd.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const TicketAdd = ({ visible, onClose, username }) => {
    const [formData, setFormData] = useState({
        creator: username,
        assignee: undefined,
        subject: [],
        participants: [],
        viewers: [],
        status: 'Tạo mới',
        customer: '',
        content: '',
        attachments: []
    });

    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (value) => {
        setFormData({ ...formData, assignee: value });
    };

    const [activeTab, setActiveTab] = useState('process');

    const handleCloseTab = (tab) => {
        if (tab === activeTab) {
            setActiveTab('');
        }
    };

    const handleStatusChange = (e) => {
        setFormData({ ...formData, status: e.target.value });
    };

    const handleSubjectChange = (newValue) => {
        setFormData({ ...formData, subject: newValue });
    };

    const handleParticipantsChange = (newValue) => {
        setFormData({ ...formData, participants: newValue });
    };

    const handleViewersChange = (newValue) => {
        setFormData({ ...formData, viewers: newValue });
    };

    return (
        <Drawer
            placement="right"
            onClose={onClose}
            open={visible}
            closable={false}
            width={isCollapsed ? 50 : 400}
            title={isCollapsed ? null : (
                <div className="ticket-header-top">
                    <div 
                        className={`ticket-tab ${activeTab === 'process' ? 'active' : 'inactive'}`} 
                        onClick={() => setActiveTab('process')}
                    >
                        Tạo ticket
                        <span className="close-tab" onClick={() => handleCloseTab('process')}>×</span>
                    </div>
                    {!isCollapsed && (
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
                    )}
                </div>
            )}
        >
            <div className="collapse-button" onClick={() => setIsCollapsed(!isCollapsed)}>
                <img 
                    src={playImage} 
                    alt="toggle" 
                    className={`collapse-icon ${isCollapsed ? 'rotate' : ''}`} 
                />
            </div>
            <div className="ticket-add-content" style={{ display: isCollapsed ? 'none' : 'block' }}>
                <Title 
                    style={{
                        margin: '0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '18px',
                    }} 
                    level={4}
                >
                    Thêm mới Ticket
                </Title>
                <hr className="divider" />
                <div className="ticket-add-form">
                    <div className="form-row">
                        <div className="form-item">
                            <Text>Người tạo:</Text>
                            <Input 
                                name="creator" 
                                value={formData.creator} 
                                disabled 
                                style={{ 
                                    fontWeight: '500',
                                    color: 'black',
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        </div>
                        <div className="form-item">
                            <Text>Người thực hiện:</Text>
                            <Select
                                name="assignee"
                                value={formData.assignee}
                                onChange={handleSelectChange}
                                style={{ 
                                    width: '100%',
                                    height: '100%',
                                }}
                                placeholder="Chọn người xử lý"
                                allowClear
                            >
                                <Option value="Người 1">Người 1</Option>
                                <Option value="Người 2">Người 2</Option>
                            </Select>
                        </div>
                    </div>
                    <div className="form-item">
                        <Text>Chủ đề ticket:</Text>
                        <CreatableSelect
                            className='table-select'
                            isMulti
                            value={formData.subject}
                            onChange={handleSubjectChange}
                            options={[
                                { value: 'Chủ đề 1', label: 'Chủ đề 1' },
                                { value: 'Chủ đề 2', label: 'Chủ đề 2' },
                                { value: 'Chủ đề 3', label: 'Chủ đề 3' }
                            ]}
                            placeholder="Chọn chủ đề"
                        />
                    </div>
                    <div className="form-item">
                        <Text>Người tham gia:</Text>
                        <CreatableSelect
                            className='table-select'
                            isMulti
                            value={formData.participants}
                            onChange={handleParticipantsChange}
                            options={[
                                { value: 'Nhân viên 1', label: 'Nhân viên 1' },
                                { value: 'Nhân viên 2', label: 'Nhân viên 2' }
                            ]}
                            placeholder="Chọn người tham gia"
                        />
                    </div>
                    <div className="form-item">
                        <Text>Người xem:</Text>
                        <CreatableSelect
                            className='table-select'
                            isMulti
                            value={formData.viewers}
                            onChange={handleViewersChange}
                            options={[
                                { value: 'Nhân viên 1', label: 'Nhân viên 1' },
                                { value: 'Nhân viên 2', label: 'Nhân viên 2' }
                            ]}
                            placeholder="Chọn người xem"
                        />
                    </div>
                    <div className="form-item">
                        <Text>Trạng thái:</Text>
                        <Radio.Group name="status" value={formData.status} onChange={handleStatusChange}>
                            <Radio value="Tạo mới">Tạo mới</Radio>
                            <Radio value="Đang xử lý">Đang xử lý</Radio>
                            <Radio value="Hoàn thành">Hoàn thành</Radio>
                        </Radio.Group>
                    </div>
                    <div className="form-item">
                        <Text>Gán Khách hàng:</Text>
                        <CreatableSelect
                            className='table-select'
                            isMulti
                            value={formData.customer ? formData.customer.split(', ').map(value => ({ value, label: value })) : []}
                            onChange={(newValue) => setFormData({ ...formData, customer: newValue.map(option => option.value).join(', ') })}
                            options={[
                                { value: 'Khách hàng 1', label: 'Khách hàng 1' },
                                { value: 'Khách hàng 2', label: 'Khách hàng 2' },
                                { value: 'Khách hàng 3', label: 'Khách hàng 3' }
                            ]}
                            placeholder="Chọn khách hàng"
                        />
                    </div>
                    <div className="form-item">
                        <Text>Nội dung:</Text>
                        <TextArea 
                            name="content" 
                            value={formData.content} 
                            onChange={handleInputChange} 
                            style={{ width: '100%' }}
                            placeholder="Nhập nội dung"
                        />
                    </div>
                    <div className="form-item">
                        <Text>File đính kèm:</Text>
                        <div
                            style={{ 
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                onClick={() => document.getElementById('fileInput').click()}
                                style={{ 
                                    width: '40%',
                                    height: '15vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    border: '1px solid #d9d9d9',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    color: '#595959',
                                    gap: '5px',
                                    backgroundColor: '#f5f5f5',
                                }}
                            >
                                <img 
                                    src={IconImage}
                                    alt="icon" 
                                    style={{ 
                                        width: '40px', 
                                        marginBottom: '10px',
                                    }} 
                                />
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
                                >
                                    Chọn file
                                </div>
                                <div 
                                    style={{ 
                                        fontSize: '12px',
                                        color: 'rgb(151 146 146)',
                                    }}
                                >
                                    File dung lượng không quá 50Mb
                                </div>
                                <Input 
                                    id="fileInput"
                                    type="file" 
                                    multiple 
                                    onChange={(e) => setFormData({ ...formData, attachments: e.target.files })} 
                                    style={{ 
                                        display: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ticket-add-footer">
                    <Button type="primary">Lưu lại</Button>
                    <Button onClick={onClose} style={{ marginLeft: '10px' }}>Đóng</Button>
                </div>
            </div>
        </Drawer>
    );
};

export default TicketAdd;
