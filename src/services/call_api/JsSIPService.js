import { EventEmitter } from 'events';
import JsSIP from 'jssip';

class JsSIPService {
  constructor(extension, setRemoteStream) {
    this.coolPhone = null;
    this.session = null;
    this.audioRemote = document.getElementById('audio_remote');
    this.setRemoteStream = setRemoteStream;
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(20);

    const socket = new JsSIP.WebSocketInterface(process.env.REACT_APP_SIP_SOCKET_URL);
    const configuration = {
      sockets: [socket],
      display_name: extension,
      uri: `sip:${extension}@${process.env.REACT_APP_SIP_SERVER}`,
      password: process.env.REACT_APP_SIP_PASSWORD,
    };

    JsSIP.debug.enable('JsSIP:*');
    this.coolPhone = new JsSIP.UA(configuration);
    this._registerPhoneEvents();
  }

  start() {
    this.coolPhone.start();
  }

  _registerPhoneEvents() {
    this.coolPhone.on('connected', () => {
      console.log('Connected');
      this.updateConnectionStatus('connected');
    });

    this.coolPhone.on('disconnected', () => {
      console.log('Disconnected');
      this.updateConnectionStatus('disconnected');
      // Thử kết nối lại sau 5 giây
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.coolPhone.start();
      }, 5000);
    });

    this.coolPhone.on('registered', () => {
      console.log('Registered');
      this.updateConnectionStatus('registered');
      this.eventEmitter.emit('registered');
    });

    this.coolPhone.on('unregistered', () => {
      console.log('Unregistered');
      this.updateConnectionStatus('unregistered');
    });

    this.coolPhone.on('registrationFailed', (e) => {
      console.error('Registration failed:', e);
      this.updateConnectionStatus('registrationFailed');
    });

    this.coolPhone.on('newRTCSession', (e) => this._handleNewRTCSession(e));
  }

  _handleNewRTCSession(e) {
    console.log('===newRTCSession===');
    const newSession = e.session;

    if (this.session) {
      this.session.terminate();
    }

    this.session = newSession;

    this.session.on('ended', () => {
      console.log('===ended===');
      this.session = null;
    });

    this.session.on('failed', (e) => {
      console.log('===failed===');
      console.log(e);
      this.session = null;
    });

    this.session.on('peerconnection', (e) => {
      console.log('===peerconnection===');
      const peerconnection = e.peerconnection;

      peerconnection.onicecandidate = (event) => {
        console.log('===icecandidate===');
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          if (candidate.includes('::')) {
            return;
          }
          peerconnection.addIceCandidate(event.candidate);
        }

        if (event.candidate.type === 'srflx' &&
            event.candidate.relatedAddress !== null &&
            event.candidate.relatedPort !== null) {
          event.ready();
        }
      };

      peerconnection.onaddstream = (e) => {
        const audioElement = this.audioRemote;
        if (audioElement) {
          audioElement.srcObject = e.stream;
          audioElement.play();
        } else {
          console.error('Audio element not found');
        }
      };

      const remoteStream = new MediaStream();

      peerconnection.getReceivers().forEach(function (receiver) {
        remoteStream.addTrack(receiver.track);
      });
    });

    this.session.on('sdp', (e) => {
      console.log(e);
      e.sdp = this.filterSDP(e.sdp);
    });

    if (this.session.direction === 'incoming') {
      // Handle incoming session
    } else {
      this.session.connection.addEventListener('addstream', (e) => {
        const audioElement = this.audioRemote;
        if (audioElement) {
          audioElement.srcObject = e.stream;
          audioElement.play();
        } else {
          console.error('Audio element not found');
        }
      });
    }
  }

  filterSDP(sdp) {
    console.log('test', sdp);
    return sdp
      .split('\r\n')
      .filter(line => !/^a=candidate:\d+ \d+ \w+ \d+ [0-9a-fA-F:]+ .*/.test(line))
      .join('\r\n');
  }

  updateConnectionStatus(status) {
    this.eventEmitter.emit('connectionStatusChanged', status);
  }

  disconnect() {
    if (this.coolPhone) {
      this.coolPhone.terminateSessions();
      this.coolPhone.stop();
    }
  }

  makeCall(number) {
    const callOptions = {
      pcConfig: {
        rtcpMuxPolicy: 'negotiate',
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      },
      mediaConstraints: {
        audio: true,
        video: false,
      },
      sessionTimersExpires: 1800,
    };

    try {
      this.coolPhone.call(number, callOptions);
    } catch (error) {
      console.error('Error making call:', error);
    }
  }

  cancelCall() {
    if (this.session) {
      this.session.terminate(); // Kết thúc session hiện tại
    }
    if (this.coolPhone) {
      this.coolPhone.terminateSessions(); // Kết thúc tất cả các session
    }
  }

  onConnectionStatusChanged(listener) {
    this.eventEmitter.on('connectionStatusChanged', listener);
  }

  onRegister(listener) {
    this.eventEmitter.on('registered', listener);
  }
}

export default JsSIPService;
