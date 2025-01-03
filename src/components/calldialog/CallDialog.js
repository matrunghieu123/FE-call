import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Tooltip, notification } from 'antd';
import IconClose from './call-icon/close.png';
import IconPhone from './call-icon/phone.png';
import IconArrow from '../../body/message/messageinfor/ticket/icon/play.png';
import './CallDialog.css';
import CallFooter from './callcomponents/CallFooter';
import { getAuthToken, getCallRecord } from '../../services/call_api/Callapi';

const CallDialog = ({ members }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState('null');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const settingsRef = useRef(null);
  const [activeButton, setActiveButton] = useState(null);
  const [inputNumber, setInputNumber] = useState('');
  const inputRef = useRef(null);
  const [isLazyActive, setIsLazyActive] = useState(false);
  const [isBranchListVisible, setIsBranchListVisible] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_CALL_URL);
        const data = await response.json();
        if (data.records && Array.isArray(data.records)) {
          const numbers = data.records.map(record => ({
            number: record.Value,
            label: record.Name
          }));
          setPhoneNumbers(numbers);
          if (numbers.length > 0) {
            setSelectedNumber(numbers[0].number);
          }
        } else {
          console.error('Dữ liệu không đúng định dạng:', data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy số điện thoại:', error);
      }
    };

    fetchPhoneNumbers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsVisible(false);
        setActiveButton(null);
      }
    };

    if (isSettingsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    if (isDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownVisible]);

  const filteredNumbers = phoneNumbers.filter(phone =>
    phone.number.includes(searchTerm)
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
    setIsDropdownVisible(false);
  };

  const toggleSettings = () => {
    setIsSettingsVisible(!isSettingsVisible);
    if (isSettingsVisible) {
      setActiveButton(null);
    }
  };

  const handleButtonClick = (buttonName) => {
    if (activeButton === buttonName) {
      setActiveButton(null);
      if (buttonName === 'branch') {
        setIsBranchListVisible(false);
      }
    } else {
      setActiveButton(buttonName);
      if (buttonName === 'branch') {
        setIsBranchListVisible(true);
      }
    }
  };

  const handleOptionToggle = (option) => {
    setSelectedOptions(prevOptions => {
      const newOptions = prevOptions.includes(option)
        ? prevOptions.filter(item => item !== option)
        : [...prevOptions, option];

      if (option === 'LazyCall cuộc gọi đi') {
        setIsLazyActive(newOptions.includes(option));
      }

      return newOptions;
    });
  };

  const handleKeyPress = (key) => {
    setInputNumber(prevInput => prevInput + key);
  };

  const handleCallButtonClick = async () => {
    const phoneRegex = /^[0-9]{9,11}$/; // Giả sử số điện thoại từ 9-11 chữ số
    
    if (phoneRegex.test(inputNumber)) {
      const token = await getAuthToken();
      if (token) {
        await getCallRecord(token);
      }
      
      // ... existing modal code ...
    } else {
      notification.error({
        message: 'Lỗi',
        description: 'Số điện thoại không hợp lệ',
      });
    }
  };

  return (
    <div className="call-dialog-container">
      <Tooltip title="Gọi điện">
        <Button
          type="primary"
          className="btn-call-main"
          icon={
            <img
              src={IconPhone}
              alt="phone"
              style={{
                height: '20px',
                width: '20px',
                filter: 'invert(1)',
              }}
            />
          }
          onClick={showModal}
          size="large"
        />
      </Tooltip>

      {/* Modal */}
      {isModalVisible && (
        <div className="call-dialog">
          {/* Nút đóng */}
          <Button
            type="text"
            className="call-dialog-ant-btn-text"
            icon={
              <img 
                src={IconClose} 
                alt="Close" 
                style={{ 
                  height: '17px', 
                  width: '17px',
                }} 
              />
            }
            onClick={handleCancel}
          />

          {/* Nội dung của modal */}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', height: '100%' }}>
            {/* Phần trên cùng */}
            <div 
              className="clickable-div"
              onClick={toggleDropdown}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>{selectedNumber}</h3>
                <span style={{ fontSize: '14px', color: '#888' }}>
                  {phoneNumbers.find(phone => phone.number === selectedNumber)?.label || ''}
                </span>
              </div>
              <Button
                className="clickable-button"
                type="text"
                icon={
                  <img 
                    src={IconArrow} 
                    alt="Arrow" 
                    style={{ height: '10px', width: '10px' }} 
                  />
                }
                style={{
                  fontSize: '16px',
                  color: '#000',
                }}
              />
            </div>

            {/* Danh sách số điện thoại */}
            {isDropdownVisible && (
              <div 
                ref={dropdownRef}
                className="phone-list"
              >
                <div 
                  style={{ 
                    padding: '10px', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Input
                    placeholder="Tìm kiếm số điện thoại"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      padding: '8px', 
                      borderBottom: '1px solid rgba(0, 177, 255, 0.1)',
                      border: 'none',
                      borderRadius: '12px',
                      backgroundColor: '#f9f9f9',
                      width: '70%',
                    }}
                  />
                  {filteredNumbers.map((phone) => (
                    <div
                      key={phone.number}
                      onClick={() => handleNumberSelect(phone.number)}
                      className="phone-list-item" // Thêm lớp CSS
                    >
                      {phone.number} - {phone.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phần giữa */}
            <div 
              className="middle-section"
            >
            </div>

            {/* Phần dưới */}
            <CallFooter
              inputNumber={inputNumber}
              setInputNumber={setInputNumber}
              inputRef={inputRef}
              activeButton={activeButton}
              handleButtonClick={handleButtonClick}
              isBranchListVisible={isBranchListVisible}
              members={members}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLazyActive={isLazyActive}
              setIsLazyActive={setIsLazyActive}
              handleOptionToggle={handleOptionToggle}
              selectedOptions={selectedOptions}
              isSettingsVisible={isSettingsVisible}
              settingsRef={settingsRef}
              toggleSettings={toggleSettings}
              handleKeyPress={handleKeyPress}
              handleCallButtonClick={handleCallButtonClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CallDialog;
