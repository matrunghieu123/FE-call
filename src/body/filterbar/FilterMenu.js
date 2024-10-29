import React, { useState } from 'react';
import { Dropdown, Row, Col, Button, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import './FilterMenu.css';

const customerMenuItems = [
  { key: 'search', label: <Input.Search placeholder="Tìm kiếm" /> },
  { key: '1', label: 'Khách hàng VIP' },
  { key: '2', label: 'Khách hàng mới' },
];

const staffMenuItems = [
  { key: 'search', label: <Input.Search placeholder="Tìm kiếm" /> },
  { key: '1', label: 'Nhân viên A' },
  { key: '2', label: 'Nhân viên B' },
];

const FilterBar = ({ onClearFilter }) => {
  const [dropdownOpen, setDropdownOpen] = useState({
    customer: false,
    staff: false,
  });

  const toggleDropdown = (key) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return (
    <div
      style={{
        backgroundColor: 'rgb(234 235 241)',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Row style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
        <div
          className="left-side custom-button-padding"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: '1',
            padding: '0',
          }}
        >
          <Col>
            <Dropdown
              menu={{ items: customerMenuItems }} // Đảm bảo menu là một phần tử duy nhất
              trigger={['click']}
              onOpenChange={() => toggleDropdown('customer')} // Thay thế onVisibleChange bằng onOpenChange
            >
              <Button type="text">
                Khách hàng
                <FontAwesomeIcon
                  icon={faSortDown}
                  className={`custom-icon ${dropdownOpen.customer ? 'rotate' : ''}`}
                />
              </Button>
            </Dropdown>
          </Col>
          <Col>
            <Dropdown
              menu={{ items: staffMenuItems }} // Đảm bảo menu là một phần tử duy nhất
              trigger={['click']}
              onOpenChange={() => toggleDropdown('staff')} // Thay thế onVisibleChange bằng onOpenChange
            >
              <Button type="text">
                Nhân viên tiếp nhận
                <FontAwesomeIcon
                  icon={faSortDown}
                  className={`custom-icon ${dropdownOpen.staff ? 'rotate' : ''}`}
                />
              </Button>
            </Dropdown>
          </Col>
        </div>
      </Row>
    </div>
  );
};

export default FilterBar;