import React from 'react';
import { Button, Input, Tooltip, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import IconPhone from '../call-icon/phone.png';
import IconBranch from '../call-icon/branch.png';
import IconKeyboard from '../call-icon/keyboard.png';
import IconLazy from '../call-icon/lazy.png';
import IconSetting from '../call-icon/setting.png';
import { handleCall } from './callservice/CallService';

const CallFooter = ({
  inputNumber,
  setInputNumber,
  inputRef,
  activeButton,
  handleButtonClick,
  isBranchListVisible,
  members,
  searchTerm,
  setSearchTerm,
  isLazyActive,
  setIsLazyActive,
  handleOptionToggle,
  selectedOptions,
  isSettingsVisible,
  settingsRef,
  toggleSettings,
  handleKeyPress
}) => {
  const handleCallButtonClick = () => {
    handleCall(inputNumber);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9*#]/g, ''); // Loại bỏ các ký tự không phải số, *, và #
    setInputNumber(filteredValue);
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
      }}
    >
      <Input
        ref={inputRef}
        placeholder="Nhập số điện thoại"
        value={inputNumber}
        onChange={handleInputChange} // Sử dụng hàm xử lý mới
        allowClear
        maxLength={20} // Giới hạn tối đa 20 ký tự
        style={{ 
          width: '106%', 
          fontSize: 24,
          height: 70,
          lineHeight: '1.2',
          padding: '8px 10px',
          border: 'none',
          fontWeight: 500,
          outline: 'none',
          boxShadow: 'none',
        }}
        className="custom-input"
      />
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
        }}
      >
        <Button
          type="primary"
          shape="square"
          icon={
            <img
              src={IconPhone}
              alt="Branch"
              className='icon-call'
              style={{
                filter: 'invert(1)',
              }}
            />
          }
          size="large"
          style={{
            border: 'none',
            height: 50, 
            width: 50,
            borderRadius: 12,
            position: 'relative',
          }}
          onClick={handleCallButtonClick}
        >
        </Button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
          }}
        >
          <Tooltip title="Danh sách số nội bộ">
            <Button
              className={`btn-call ${activeButton === 'branch' ? 'active' : ''}`}
              type="text"
              icon={
                <img
                  src={IconBranch}
                  alt="Branch"
                  className={`icon-call ${activeButton === 'branch' ? 'active' : ''}`}
                />
              }
              onClick={() => handleButtonClick('branch')}
            />
          </Tooltip>

          {activeButton === 'branch' && isBranchListVisible && (
            <div className="branch-list">
              <Input.Search
                placeholder="Tìm kiếm"
                allowClear
                onSearch={(value) => setSearchTerm(value)}
                className="branch-input"
              />
              <div>
                {members
                  .filter(member => 
                    searchTerm === '' || member.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(member => (
                    <div key={member.name} className="branch-member-item">
                      <Avatar 
                        icon={<UserOutlined />} 
                        className="branch-member-avatar"
                      />
                      <div>
                        <div className="branch-member-name">{member.name}</div>
                        <div className="branch-member-email">{member.email}</div>
                      </div>
                    </div>
                  ))}
                {/* Thêm 2 member ảo */}
                <div key="member1" className="branch-member-item">
                  <Avatar 
                    icon={<UserOutlined />} 
                    className="branch-member-avatar"
                  />
                  <div>
                    <div className="branch-member-name">100 - CTY KIM CƯƠNG</div>
                    <div className="branch-member-email">tuannh@callcenter.vn</div>
                  </div>
                </div>
                <div key="member2" className="branch-member-item">
                  <Avatar 
                    icon={<UserOutlined />} 
                    className="branch-member-avatar"
                  />
                  <div>
                    <div className="branch-member-name">Jane Smith</div>
                    <div className="branch-member-email">jane.smith@example.com</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Tooltip title="Bàn phím">
            <Button
              className={`btn-call ${activeButton === 'keyboard' ? 'active' : ''}`}
              type="text"
              icon={
                <img
                  src={IconKeyboard}
                  alt="Keyboard"
                  className={`icon-call ${activeButton === 'keyboard' ? 'active' : ''}`}
                />
              }
              onClick={() => handleButtonClick('keyboard')}
            />
          </Tooltip>

          {activeButton === 'keyboard' && (
            <div style={{
              position: 'absolute',
              width: '300px',
              maxWidth: '400px',
              height: '255px',
              right: '400px',
              bottom: '0',
              zIndex: 2000,
              backgroundColor: 'white',
              padding: '12px 0',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%',
              }}>
                <div className='call-keyboard'>
                  {[1, 2, 3].map(num => (
                    <Button 
                      className='keyboard-btn' 
                      key={num} 
                      onClick={() => handleKeyPress(num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <div className='call-keyboard'>
                  {[4, 5, 6].map(num => (
                    <Button 
                      className='keyboard-btn' 
                      key={num} 
                      onClick={() => handleKeyPress(num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <div className='call-keyboard'>
                  {[7, 8, 9].map(num => (
                    <Button 
                      className='keyboard-btn' 
                      key={num} 
                      onClick={() => handleKeyPress(num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <div className='call-keyboard'>
                  {['*', '0', '#'].map(num => (
                    <Button 
                      className='keyboard-btn' 
                      key={num} 
                      onClick={() => handleKeyPress(num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Tooltip 
            title={
              <div style={{ width: '190px', textAlign: 'center', lineHeight: '1.5' }}>
                Tự động phát file LazyCall: {isLazyActive ? 'bật' : 'tắt'}
              </div>
            }
            overlayStyle={{ 
              fontSize: '14px'
            }}
          >
            <Button
              className={`btn-call ${isLazyActive ? 'active' : ''}`}
              type="text"
              icon={
                <img
                  src={IconLazy}
                  alt="Lazy"
                  className={`icon-call ${isLazyActive ? 'active' : ''}`}
                />
              }
              onClick={() => {
                setIsLazyActive(!isLazyActive);
                handleOptionToggle('LazyCall cuộc gọi đi');
              }}
            />
          </Tooltip>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Tooltip title="Cấu hình">
              <Button
                className={`btn-call ${activeButton === 'setting' ? 'active' : ''}`}
                type="text"
                icon={
                  <img
                    src={IconSetting}
                    alt="Setting"
                    className={`icon-call ${activeButton === 'setting' ? 'active' : ''}`}
                  />
                }
                onClick={() => {
                  handleButtonClick('setting');
                  toggleSettings();
                }}
              >
                {selectedOptions.length > 0 && (
                  <span className="notification-badge visible">
                    {selectedOptions.length}
                  </span>
                )}
              </Button>
            </Tooltip>

            {isSettingsVisible && (
              <div ref={settingsRef} style={{
                position: 'absolute',
                top: '-250px',
                right: '4px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
                padding: '0 10px 10px 10px',
                zIndex: 1000,
              }}>
                <h4 style={{
                  display: 'flex',
                  fontSize: '13px',
                  fontWeight: '400',
                  margin: '0 0 10px 0',
                  color: '#9ba9b6',
                }}>Tùy chọn</h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: '220px',
                  }}
                >
                  {['Ưu tiên gọi nội mạng', 'Random đầu số gọi ra', 'LazyCall cuộc gọi đến', 'LazyCall cuộc gọi đi', 'Remote Call (?)'].map(option => (
                    <div 
                      key={option} 
                      onClick={() => handleOptionToggle(option)} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        margin: '5px 0',
                        padding: '5px 0',
                        borderRadius: '4px',
                        backgroundColor: selectedOptions.includes(option) ? '#e6f7ff' : 'transparent',
                        transition: 'background-color 0.3s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option)}
                        onChange={() => handleOptionToggle(option)}
                        style={{
                          marginRight: '10px',
                          pointerEvents: 'none',
                        }}
                      />
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallFooter;
