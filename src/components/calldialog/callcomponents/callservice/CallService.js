import { notification, Modal, Spin } from 'antd';
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Thêm useCallback
import { createRoot } from 'react-dom/client';
import { getAuthToken, getCallRecord } from '../../../../services/api';
import JsSIPService from '../../../../services/call_api/JsSIPService';

// Hàm tiện ích để ghi log trạng thái kết nối
const logConnectionStatus = (status) => {
  console.log('Connection status:', status);
};

// Component quản lý giao diện cuộc gọi
const CallModal = ({ inputNumber, closeModal }) => { // Xóa startTime khỏi props
  const [duration, setDuration] = useState(0);
  const [connecting, setConnecting] = useState(true);
  const sessionRef = useRef(null);
  const startTimeRef = useRef(null); // Thêm ref để lưu thời gian bắt đầu

  // Định nghĩa các callback sử dụng useCallback
  const onCallAccepted = useCallback(() => {
    setConnecting(false); // Ngừng hiển thị Spin khi cuộc gọi được chấp nhận
    startTimeRef.current = new Date(); // Lưu thời gian bắt đầu khi cuộc gọi được chấp nhận
    notification.success({
      message: 'Kết nối thành công',
      description: `Đã kết nối với ${inputNumber}`,
    });
  }, [inputNumber]);

  const onCallEnded = useCallback(async () => {
    notification.info({ message: 'Cuộc gọi đã kết thúc' });
    try {
      const token = await getAuthToken();
      await getCallRecord(token); 
    } catch (error) {
      console.error('Lỗi khi lấy bản ghi cuộc gọi:', error);
      notification.error({
        message: 'Lỗi lấy bản ghi',
        description: 'Không thể lấy bản ghi cuộc gọi.'
      });
    }
    closeModal();
  }, [closeModal]);

  const onCallFailed = useCallback((e) => {
    console.error('Cuộc gọi thất bại:', e);
    const message = e?.message?.data || 'Không xác định';
    const cause = e.cause || 'Lỗi không xác định';
    notification.error({
      message: 'Lỗi kết nối',
      description: `Cuộc gọi thất bại: ${cause}. Chi tiết: ${message}`,
    });
    closeModal();
    sessionRef.current?.terminate();
  }, [closeModal]);

  // Cập nhật thời gian gọi
  useEffect(() => {
    if (!startTimeRef.current) return; // Chỉ bắt đầu tính thời gian khi có startTime

    const intervalId = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTimeRef.current]);

  // Khởi tạo cuộc gọi với JsSIP
  useEffect(() => {
    const initiateCall = async () => {
      try {
        const token = await getAuthToken(85, '105');
        if (!token) throw new Error('Không thể lấy token xác thực.');

        const { REACT_APP_SIP_SERVER: sipServer, REACT_APP_SIP_SOCKET_URL: socketUrl, 
                REACT_APP_SIP_USERNAME: username, REACT_APP_SIP_PASSWORD: password } = process.env;

        if (!sipServer || !socketUrl || !username || !password) {
          throw new Error('Thiếu thông tin cấu hình SIP.');
        }

        const extension = process.env.REACT_APP_EXTENSION_ALOHUB; 
        const jsSIPService = new JsSIPService(extension, password, sipServer, socketUrl, inputNumber);

        jsSIPService.start();

        // Đăng ký callback cho các trạng thái
        jsSIPService.onConnectionStatusChanged((status) => {
          logConnectionStatus(status);
          if (status === 'connected') onCallAccepted();
          else if (status === 'ended' || status === 'failed') onCallEnded();
        });

        jsSIPService.makeCall(`sip:${inputNumber}@${sipServer}`); // Sửa đổi để sử dụng inputNumber
        sessionRef.current = jsSIPService;
      } catch (error) {
        notification.error({ message: 'Lỗi', description: error.message });
        closeModal();
      }
    };

    initiateCall();

    return () => {
      sessionRef.current?.isInProgress && sessionRef.current.terminate();
    };
  }, [inputNumber, closeModal, onCallAccepted, onCallEnded, onCallFailed]); // Giữ các hàm callback trong phụ thuộc

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <Modal
      title="Đang gọi..."
      open={true}
      onCancel={() => {
        if (sessionRef.current?.session) {
          sessionRef.current.terminate();
        }
        closeModal();
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => {
              if (sessionRef.current?.session) {
                sessionRef.current.terminate();
              }
              closeModal();
            }}
            style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}
          >
            Huỷ
          </button>
        </div>
      }
    >
      {connecting ? (
        <Spin tip="Đang kết nối...">
          <p>Vui lòng đợi trong giây lát...</p>
        </Spin>
      ) : (
        <>
          <div>Đang gọi đến số {inputNumber}</div>
          <div>Thời gian: {minutes} phút {seconds} giây</div>
        </>
      )}
    </Modal>
  );
};

let root;

// Hàm gọi để hiển thị modal cuộc gọi
export const handleCall = async (inputNumber) => {
  const phoneRegex = /^[0-9]{9,11}$/;

  if (!phoneRegex.test(inputNumber)) {
    return notification.error({ message: 'Lỗi', description: 'Số điện thoại không hợp lệ' });
  }

  const startTime = new Date();

  const closeModal = () => {
    if (root) {
      root.unmount();
      const modalContainer = document.getElementById('call-modal-container');
      if (modalContainer) {
        document.body.removeChild(modalContainer);
      }
      root = null;
    }
  };

  let modalContainer = document.getElementById('call-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'call-modal-container';
    document.body.appendChild(modalContainer);
  }

  if (!root) {
    root = createRoot(modalContainer);
  }

  root.render(<CallModal startTime={startTime} inputNumber={inputNumber} closeModal={closeModal} />);
};
