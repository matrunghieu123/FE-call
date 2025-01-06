import { notification, Modal, Spin } from 'antd';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { getAuthToken, getCallRecord } from '../../../../services/call_api/Callapi';
import JsSIPService from '../../../../services/call_api/JsSIPService';
import JsSIP from 'jssip';

// Hàm tiện ích để ghi log trạng thái kết nối
const logConnectionStatus = (status) => {
  console.log('Connection status:', status);
};

// Component quản lý giao diện cuộc gọi
const CallModal = ({ inputNumber, closeModal }) => {
  const [duration, setDuration] = useState(0);
  const [connecting, setConnecting] = useState(true);
  const sessionRef = useRef(null);
  const startTimeRef = useRef(null);

  const onCallAccepted = useCallback(() => {
    setConnecting(false); // Ngừng hiển thị Spin khi cuộc gọi được chấp nhận
    startTimeRef.current = new Date(); // Lưu thời gian bắt đầu khi cuộc gọi được chấp nhận
    notification.success({
      message: 'Kết nối thành công',
      description: `Đã kết nối với ${inputNumber}`,
    });
  }, [inputNumber]);

  const onCallEnded = useCallback(async () => {
    if (sessionRef.current && sessionRef.current.status !== JsSIP.RTCSession.C.STATUS_TERMINATED) {
        sessionRef.current.terminate();
    }
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

  const onIncomingCall = useCallback((session) => {
    const incomingNumber = session.remote_identity.uri.user;
    
    if (incomingNumber === '0949092908') {
        notification.info({
            message: 'Cuộc gọi đến',
            description: `Có cuộc gọi đến từ số: ${incomingNumber}`,
        });

        // Hiển thị modal với nút Nghe và Hủy
        Modal.confirm({
            title: 'Cuộc gọi đến',
            content: `Có cuộc gọi đến từ số: ${incomingNumber}`,
            okText: 'Nghe',
            cancelText: 'Hủy',
            onOk: () => {
                session.answer();
                onCallAccepted();
                // Hiển thị giao diện nghe
                // Ví dụ: set một state để hiển thị phần nghe
            },
            onCancel: () => {
                session.terminate();
                closeModal();
            },
        });
    } else {
        console.log(`Cuộc gọi từ số không mong muốn: ${incomingNumber}`);
        session.terminate(); // Từ chối cuộc gọi nếu không phải số mong muốn
    }
  }, [onCallAccepted, closeModal]);

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

        // Đăng ký xử lý cuộc gọi đến
        jsSIPService.onIncomingCall(onIncomingCall);

        jsSIPService.makeCall(`sip:${inputNumber}@${sipServer}`);
        sessionRef.current = jsSIPService?.session;
      } catch (error) {
        notification.error({ message: 'Lỗi', description: error.message });
        closeModal();
      }
    };

    initiateCall();

    return () => {
      if (sessionRef.current?.isInProgress) {
        sessionRef.current.terminate();
      }
    };
  }, [inputNumber, closeModal, onCallAccepted, onCallEnded, onCallFailed, onIncomingCall]);

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

  if (root && modalContainer) {
    root.render(<CallModal inputNumber={inputNumber} closeModal={closeModal} />);
  }
};
