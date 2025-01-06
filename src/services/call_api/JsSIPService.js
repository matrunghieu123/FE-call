import { EventEmitter } from 'events';
import JsSIP from 'jssip';

class JsSIPService {
  constructor(setRemoteStream) {
    console.log('[JsSIPService] Initializing JsSIPService...');
    this.coolPhone = null;
    this.session = null;
    this.audioRemote = document.createElement('audio');
    this.audioRemote.id = 'audio_remote';
    this.audioRemote.autoplay = true;
    document.body.appendChild(this.audioRemote);
    this.setRemoteStream = setRemoteStream;
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(20);

    const socket = new JsSIP.WebSocketInterface(process.env.REACT_APP_SIP_SOCKET_URL);
    const configuration = {
      sockets: [socket],
      display_name: process.env.REACT_APP_SIP_USERNAME,
      uri: `sip:${process.env.REACT_APP_EXTENSION_ALOHUB}@${process.env.REACT_APP_SIP_SERVER}`,
      password: process.env.REACT_APP_SIP_PASSWORD,
    };

    // Debugging
    JsSIP.debug.enable('JsSIP:*');

    this.coolPhone = new JsSIP.UA(configuration);
    console.log('[JsSIPService] JsSIP UA created with configuration:', configuration);
    this._registerPhoneEvents();

    // Kiểm tra trạng thái kết nối từ localStorage
    const wasConnected = localStorage.getItem('sipConnected') === 'true';
    console.log('[JsSIPService] Was connected:', wasConnected);
    if (wasConnected) {
      console.log('[JsSIPService] Restarting connection...');
      this.start();
    }
  }

  start() {
    console.log('[JsSIPService] Starting JsSIP UA...');
    this.coolPhone.start();
    // Lưu trạng thái kết nối vào localStorage
    localStorage.setItem('sipConnected', 'true');
    console.log('[JsSIPService] Connection status saved to localStorage.');
  }

  _registerPhoneEvents() {
    this.coolPhone.on('connected', () => {
      console.log('[JsSIPService] Connected to SIP server.');
      this.updateConnectionStatus('connected');
      // Lưu trạng thái kết nối vào localStorage
      localStorage.setItem('sipConnected', 'true');
    });

    this.coolPhone.on('disconnected', () => {
      console.log('[JsSIPService] Disconnected from SIP server.');
      this.updateConnectionStatus('disconnected');
      // Xóa trạng thái kết nối khỏi localStorage
      localStorage.removeItem('sipConnected');
      setTimeout(() => {
        console.log('[JsSIPService] Attempting to reconnect...');
        this.coolPhone.start();
      }, 5000);
    });

    this.coolPhone.on('registered', () => {
      console.log('[JsSIPService] Registered successfully.');
      this.updateConnectionStatus('registered');
      this.eventEmitter.emit('registered');
    });

    this.coolPhone.on('unregistered', () => {
      console.log('[JsSIPService] Unregistered.');
      this.updateConnectionStatus('unregistered');
    });

    this.coolPhone.on('registrationFailed', (e) => {
      console.error('[JsSIPService] Registration failed:', e);
      console.error('Response:', e.response);
      console.error('Cause:', e.cause);
      this.updateConnectionStatus('registrationFailed');
    });

    this.coolPhone.on('newRTCSession', (e) => {
      this._handleNewRTCSession(e);
    });
  }

  _handleNewRTCSession(e) {
    const newSession = e.session;

    if (!newSession) {
        console.error('[JsSIPService] New session is undefined.');
        return;
    }

    if (newSession.direction === 'incoming') {
        console.log('[JsSIPService] Incoming call from:', newSession.remote_identity.uri.user);
        this.eventEmitter.emit('incomingCall', newSession);
    }

    newSession.on('ended', () => {
        console.log('[JsSIPService] Call ended.');
        this.eventEmitter.emit('callEnded');
    });

    newSession.on('failed', (e) => {
        console.log('[JsSIPService] Call failed:', e);
        this.eventEmitter.emit('callEnded');
    });

    // Đảm bảo trạng thái phiên được kiểm tra chính xác
    if (this.session && this.session.status !== JsSIP.RTCSession?.C?.STATUS_TERMINATED && this.session.status !== JsSIP.RTCSession?.C?.STATUS_NULL) {
        console.log('[JsSIPService] Terminating existing session.');
        this.session.terminate();
    }

    this.session = newSession;

    this.session.on('peerconnection', (e) => {
      console.log('[JsSIPService] Peer connection established.');
      const peerconnection = e.peerconnection;

      peerconnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[JsSIPService] ICE candidate:', event.candidate.candidate);
        }
      };

      peerconnection.ontrack = (event) => {
        console.log('[JsSIPService] Track received.');
        const [remoteStream] = event.streams;
        this.audioRemote.srcObject = remoteStream;
        this.audioRemote.play();

        if (this.setRemoteStream) {
          this.setRemoteStream(remoteStream);
        }
      };
    });

    this.session.on('sdp', (e) => {
      console.log('[JsSIPService] Modifying SDP.');
      e.sdp = this._filterSDP(e.sdp);
    });
  }

  _filterSDP(sdp) {
    return sdp
      .split('\r\n')
      .filter(line => !/^a=candidate:\d+ \d+ \w+ \d+ [0-9a-fA-F:]+ .*/.test(line))
      .join('\r\n');
  }

  updateConnectionStatus(status) {
    console.log(`[JsSIPService] Connection status updated: ${status}`);
    this.eventEmitter.emit('connectionStatusChanged', status);
  }

  makeCall(number) {
    const callOptions = {
      pcConfig: {
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      },
      mediaConstraints: {
        audio: true,
        video: false,
      },
    };

    try {
      console.log(`[JsSIPService] Making call to: ${number}`);
      this.coolPhone.call(number, callOptions);
    } catch (error) {
      console.error('[JsSIPService] Error making call:', error);
    }
  }

  cancelCall() {
    if (this.session) {
      console.log('[JsSIPService] Canceling call.');
      this.session.terminate();
    }
  }

  disconnect() {
    if (this.coolPhone) {
      console.log('[JsSIPService] Disconnecting SIP client.');
      this.coolPhone.terminateSessions();
      this.coolPhone.stop();
      // Xóa trạng thái kết nối khỏi localStorage
      localStorage.removeItem('sipConnected');
    }
  }

  onConnectionStatusChanged(listener) {
    this.eventEmitter.on('connectionStatusChanged', listener);
  }

  onRegister(listener) {
    this.eventEmitter.on('registered', listener);
  }

  onIncomingCall(listener) {
    this.eventEmitter.on('incomingCall', listener);
  }

  // Phương thức để khởi tạo và kết nối JsSIP
  initializeAndConnect() {
    console.log('[JsSIPService] Initializing and connecting...');
    this.start();
  }

  // Phương thức để đăng ký sự kiện
  registerEventHandlers() {
    this.onConnectionStatusChanged((status) => {
      console.log('[JsSIPService] Connection status changed:', status);
    });

    this.onIncomingCall((session) => {
      console.log('[JsSIPService] Incoming call:', session);
      this.handleIncomingCall(session);
    });
  }

  handleIncomingCall(session) {
    // Logic xử lý cuộc gọi đến
    console.log('[JsSIPService] Handling incoming call from:', session.remote_identity.uri.user);
    // Ví dụ: Hiển thị thông báo hoặc modal cho người dùng
  }

  endCall() {
    if (this.session) {
      console.log('[JsSIPService] Ending call.');
      this.session.terminate();
    }
  }

  onCallEnded(listener) {
    this.eventEmitter.on('callEnded', listener);
  }
}

export default JsSIPService;
