import React from "react";
import { Layout, Menu, Tooltip } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import LogoFB from './logo-img/Logo-FB.png';
import LogoZL from './logo-img/Logo-Zalo.png';
import LogoTL from './logo-img/Logo-Telegram.png';
import LogoVB from './logo-img/Logo-Viber.png';

const { Sider } = Layout;

const ColNavbar = ({ setTab, handleResetFilter, setLoginType, setSource, setMembers, baseUrl }) => { // Nhận baseUrl
  const handleTabChange = async (newTab, source) => {
    setTab(newTab);
    handleResetFilter();
    setLoginType(newTab);
    setSource(source);

    // Gọi API để lấy danh sách thành viên
    try {
      const response = await fetch(`${baseUrl}/chatroom/${source}`);
      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thành viên:", error);
    }
  };

  const menuItems = [
    {
      key: "0",
      label: (
        <Tooltip title="Chat chung" placement="top" overlayInnerStyle={tooltipStyle}>
          <div onClick={() => handleTabChange("CHATROOM", null)} style={iconContainerStyle}>
            <MessageOutlined style={{ fontSize: "20px" }} />
          </div>
        </Tooltip>
      ),
      style: menuItemStyle,
    },
    {
      key: "5",
      label: (
        <Tooltip title="Facebook" placement="top" overlayInnerStyle={tooltipStyle}>
          <img
            src={LogoFB}
            alt="LogoFB"
            style={iconStyle}
            onClick={() => handleTabChange("FACEBOOK", "facebook")}
          />
        </Tooltip>
      ),
      style: menuItemStyle,
    },
    {
      key: "3",
      label: (
        <Tooltip title="Zalo" placement="top" overlayInnerStyle={tooltipStyle}>
          <img
            src={LogoZL}
            alt="LogoZL"
            style={iconStyle}
            onClick={() => handleTabChange("ZALO", "zalo")}
          />
        </Tooltip>
      ),
      style: menuItemStyle,
    },
    {
      key: "2",
      label: (
        <Tooltip title="Telegram" placement="top" overlayInnerStyle={tooltipStyle}>
          <img
            src={LogoTL}
            alt="LogoTL"
            style={iconStyle}
            onClick={() => handleTabChange("TELEGRAM", "telegram")}
          />
        </Tooltip>
      ),
      style: menuItemStyle,
    },
    {
      key: "4",
      label: (
        <Tooltip title="Viber" placement="top" overlayInnerStyle={tooltipStyle}>
          <img
            src={LogoVB}
            alt="LogoVB"
            style={iconStyle}
            onClick={() => handleTabChange("VIBER", "viber")}
          />
        </Tooltip>
      ),
      style: menuItemStyle,
    },
  ];

  return (
    <Sider theme="light" width={70} style={{ backgroundColor: 'rgb(245, 246, 250)' }}>
      <Menu
        theme="light"
        mode="vertical"
        style={{ textAlign: "center", marginTop: "20px", padding: 0, backgroundColor: '#f5f6fa', border: 'none' }}
        items={menuItems}
      />
    </Sider>
  );
};

// Style cho các Menu.Item và Tooltip
const menuItemStyle = {
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  margin: "0 5px",
};

const tooltipStyle = {
  backgroundColor: "#fff",
  color: "#000",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  borderRadius: "4px",
};

const iconStyle = {
  width: "20px",
  height: "auto",
  cursor: "pointer",
};

const iconContainerStyle = {
  fontSize: "20px",
  color: "#1890ff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
};

export default ColNavbar;
