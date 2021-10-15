import { log, warn, error } from './utils/log';
import WHITEBOARD from './whiteBoard';
import BackgroundReplacement from './backgroundReplacement/index';

export default class WRTC {
  constructor(options) {
    // rtc接口实例
    this.RTCPeerConnection = null;
    // 数据通道实例
    this.DataChanel = null;
    // 白板实例
    this.WHITEBOARD = null;
    // 背景替换实例
    this.BackgroundReplacement = null;

    // 媒体流
    this.webcamStream = null;
    // 视频状态
    this.videoEnabled = true;
    // 音频状态
    this.audioEnabled = true;
    // 模式  用于区分共享屏幕还是普通视频流
    this.mode = 'camera';
    // 处理options
    const {
      localVideoId = 'localVideo',
      remoteVideoId = 'remoteVideo',
      whiteboardId = 'whiteboard',
      backgroundCanvasId = 'localCanvas',
      iceServers = [],
      socket,
      room = location.href,
      mediaConstraint = { video: true, audio: true },
      maskImg,
    } = options;
    // 本地video dom
    this.localVideo = document.getElementById(localVideoId);
    // 远端video dom
    this.remoteVideo = document.getElementById(remoteVideoId);
    // turn服务
    this.iceServers = iceServers;
    // socket链接
    this.socket = socket;
    // 加入的房间号
    this.room = room;
    // 媒体约束
    this.mediaConstraint = mediaConstraint;
    // 白板dom
    this.whiteboardId = whiteboardId;
    // 背景图片dom
    this.maskImg = maskImg;
    // 背景canvas dom id
    this.backgroundCanvasId = backgroundCanvasId;

    // 接受到对等端 『准备完成』的信号, 开始邀请通话
    socket.on('ready', this.invite);
    // 监听offer
    socket.on('offer', this.onOffer);
    // 监听answer
    socket.on('answer', this.onAnswer);
    // 监听ice候选者
    socket.on('icecandidate', this.onIceCandidata);
    // 获取webcam
    this.getUserMedia().then(() => {
      log(`加入房间${this.room}`);
      this.socket.emit('join', this.room);
    });
  }

  //  创建peerconnection
  createPeerConnection = () => {
    log('创建rtcpeerconnection');
    this.RTCPeerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    });

    this.RTCPeerConnection.onconnectionstatechange = this.handleConnectionStateChange;
    this.RTCPeerConnection.onicecandidateerror = error;
    this.RTCPeerConnection.onicecandidate = this.handleICECandidateEvent;
    this.RTCPeerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChange;
    this.RTCPeerConnection.onicegatheringstatechange = this.handleICEGatheringStateChange;
    this.RTCPeerConnection.onsignalingstatechange = this.handleSignalingStateChange;
    this.RTCPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
    this.RTCPeerConnection.ontrack = this.handleTrackEvent;

    //将通用数据通道添加到对等连接，
    //用于文字聊天，字幕和切换发送字幕
    this.DataChanel = this.RTCPeerConnection.createDataChannel('chat', {
      negotiated: true,
      // both peers must have same id
      id: 0,
    });
    //成功打开dataChannel时调用
    this.DataChanel.onopen = (event) => {
      log('dataChannel opened');
    };
    //处理不同的dataChannel类型
    this.DataChanel.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      log({ receivedData });
      const dataType = receivedData.type;
      const cleanedMessage = receivedData.data;
      if (dataType === 'whiteboard') {
        this.handleRecieveWhiteboard(cleanedMessage);
      } else {
        this.onRecieveMessage(cleanedMessage);
      }
    };

    this.WHITEBOARD = new WHITEBOARD({ dataChanel: this.DataChanel, whiteboardId: this.whiteboardId });
  };

  // 发起呼叫
  invite = () => {
    log('发起呼叫');
    this.createPeerConnection();
    try {
      this.webcamStream.getTracks().forEach((track) => this.RTCPeerConnection.addTrack(track, this.webcamStream));
    } catch (err) {
      error(err);
    }
  };

  //  获取webcam
  getUserMedia = async () => {
    log('获取媒体流');
    try {
      this.webcamStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraint);
      this.localVideo.srcObject = this.webcamStream;
      return this.webcamStream;
    } catch (err) {
      error(err);
    }
  };

  //  获取桌面流
  getDisplayMedia = async () => {
    log('获取桌面流');
    try {
      this.webcamStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      this.localVideo.srcObject = this.webcamStream;
      return this.webcamStream;
    } catch (err) {
      error(err);
    }
  };

  //  需要协商
  handleNegotiationNeededEvent = async () => {
    log('开始协商');
    try {
      if (this.RTCPeerConnection.signalingState != 'stable') {
        log('signalingState ！= stable，推迟协商');
        return;
      }

      log('setLocalDescription（设置本地描述）');
      await this.RTCPeerConnection.setLocalDescription();

      log('发送offer给对等端');
      this.socket.emit('offer', this.RTCPeerConnection.localDescription, this.room);
    } catch (err) {
      error(err);
    }
  };

  //  连接状态变化
  handleConnectionStateChange = () => {
    warn('连接状态变更为: ' + this.RTCPeerConnection.connectionState);
    switch (this.RTCPeerConnection.connectionState) {
      case 'connected':
        const config = this.RTCPeerConnection.getConfiguration();
        log('*** 连接配置为: ' + JSON.stringify(config));
        if (this.BackgroundReplacement) {
          this.switchStream(this.BackgroundReplacement.stream);
        }
        break;
      case 'disconnected':
        break;
      case 'failed':
        warn('连接失败，现在开始重新协商');
        this.RTCPeerConnection.restartIce();
        setTimeout(() => {
          if (this.RTCPeerConnection.iceConnectionState !== 'connected') {
            log('重新协商失败，新建rtcpeerconnection,重新呼叫');
            this.invite();
          }
        }, 10000);
        break;
    }
  };

  // 当媒体流添加到track时触发
  handleTrackEvent = (event) => {
    log('Track event: ', event);
    this.remoteVideo.srcObject = event.streams[0];
    this.onTrack(event);
  };

  //  当收集到ice候选者
  handleICECandidateEvent = (event) => {
    if (event.candidate) {
      log('发送 ICE candidate: ' + event.candidate.candidate);
      this.socket.emit('icecandidate', event.candidate, this.room);
    }
  };

  //  ice连接状态变更
  handleICEConnectionStateChange = (event) => {
    log('ICE连接状态变更为 ' + this.RTCPeerConnection.iceConnectionState);
  };

  handleSignalingStateChange = (event) => {
    log('信令状态变更为: ' + this.RTCPeerConnection.signalingState);
    switch (this.RTCPeerConnection.signalingState) {
      case 'closed':
        this.invite();
        break;
    }
  };

  handleICEGatheringStateChange = (event) => {
    log('ICE收集状态变更为 : ' + this.RTCPeerConnection.iceGatheringState);
  };

  //  收到offer
  onOffer = async (offer) => {
    log('收到offer', offer);
    this.invite();

    if (this.RTCPeerConnection.signalingState != 'stable') {
      log("  - But the signaling state isn't stable, so triggering rollback");

      // Set the local and remove descriptions for rollback; don't proceed
      // until both return.
      await Promise.all([
        this.RTCPeerConnection.setLocalDescription({ type: 'rollback' }),
        this.RTCPeerConnection.setRemoteDescription(offer),
      ]);
      return;
    } else {
      log('Setting remote description(设置远端描述)');
      await this.RTCPeerConnection.setRemoteDescription(offer);
    }

    log('创建并发送answer给对等端');
    await this.RTCPeerConnection.setLocalDescription();
    this.socket.emit('answer', this.RTCPeerConnection.localDescription, this.room);
  };

  //  收到answer
  onAnswer = async (answer) => {
    log('收到answer', answer);
    await this.RTCPeerConnection.setRemoteDescription(answer).catch(error);
  };

  //  从对等端收到icecandidate
  onIceCandidata = async (icecandidate) => {
    log('从对等端收到icecandidate: ', icecandidate);
    try {
      await this.RTCPeerConnection.addIceCandidate(icecandidate);
    } catch (err) {
      error(err);
    }
  };

  //  发送数据
  sendData = (data) => {
    console.log('data: ', data);
    this.DataChanel.send(JSON.stringify(data));
  };

  //  静音
  muteMicrophone = () => {
    this.webcamStream.getTracks().forEach((track) => {
      if (track.kind === 'audio') {
        track.enabled = !track.enabled;
        this.audioEnabled = track.enabled;
        this.onMuteMicrophone(track.enabled);
      }
    });
  };

  //  关闭是视频流
  pauseVideo = () => {
    this.webcamStream.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        track.enabled = !track.enabled;
        this.videoEnabled = track.enabled;
        this.onPauseVideo(track.enabled);
      }
    });
  };

  //画中画
  togglePictureInPicture = () => {
    if ('pictureInPictureEnabled' in document || this.remoteVideo.webkitSetPresentationMode) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch((error) => {
          log(error);
        });
      } else if (this.remoteVideo.webkitPresentationMode === 'inline') {
        this.remoteVideo.webkitSetPresentationMode('picture-in-picture');
      } else if (this.remoteVideo.webkitPresentationMode === 'picture-in-picture') {
        this.remoteVideo.webkitSetPresentationMode('inline');
      } else {
        this.remoteVideo.requestPictureInPicture().catch((error) => {
          alert('您必须连接到其他人才能进入画中画模式');
        });
      }
    } else {
      alert('你的浏览器不支持画中画。考虑使用Chrome或Safari。');
    }
    this.onTogglePictureInPicture();
  };

  //   切换发送流
  switchStream = (stream) => {
    const videoTrack = stream.getVideoTracks()[0];
    console.log('videoTrack: ', videoTrack);
    const sender = this.RTCPeerConnection.getSenders().find(function (s) {
      return s.track.kind === videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  };

  // 切换流类型
  swap = async () => {
    if (this.mode === 'camera') {
      try {
        this.webcamStream = await this.getDisplayMedia();
        this.switchStream(this.webcamStream);
        this.mode = 'screen';
      } catch (err) {
        log(err);
      }
    } else {
      try {
        this.webcamStream = await this.getUserMedia();
        this.switchStream(this.webcamStream);
        this.mode = 'camera';
      } catch (err) {
        log(err);
      }
    }
  };

  //当通过dataChannel接收到消息时调用
  handleRecieveWhiteboard(data) {
    if (this.WHITEBOARD.whiteboard.style.display === 'none') {
      this.WHITEBOARD.toggleWhiteboard();
    }
    const w = this.WHITEBOARD.whiteboard.width;
    const h = this.WHITEBOARD.whiteboard.height;
    this.WHITEBOARD.drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // 替换背景 type: 'replace' | 'origin'
  replaceBackground(type = 'replace') {
    if (!this.BackgroundReplacement) {
      this.BackgroundReplacement = new BackgroundReplacement({
        localVideo: this.localVideo,
        webcamStream: this.webcamStream,
        maskImg: this.maskImg,
        backgroundCanvasId: this.backgroundCanvasId,
      });
    }
    if (this.BackgroundReplacement.state === 'inactive' && type === 'replace') {
      this.BackgroundReplacement.restart();
    }
    if (type === 'origin' && this.BackgroundReplacement.state === 'active') {
      this.BackgroundReplacement.stop();
    }
    if (this.RTCPeerConnection && this.RTCPeerConnection.connectionState === 'connected' && type === 'replace') {
      this.switchStream(this.BackgroundReplacement.stream);
    }
    if (this.RTCPeerConnection && this.RTCPeerConnection.connectionState === 'connected' && type === 'origin') {
      this.switchStream(this.webcamStream);
    }
  }
}

// 触发静音事件时触发
WRTC.prototype.onMuteMicrophone = (enabled) => {
  console.log({ enabled });
};

// 触发关闭视频流事件触发
WRTC.prototype.onPauseVideo = (enabled) => {
  console.log({ enabled });
};

WRTC.prototype.onTogglePictureInPicture = () => {
  console.log('onTogglePictureInPicture');
};

WRTC.prototype.onRecieveMessage = (msg) => {
  console.log('msg: ', msg);
};

WRTC.prototype.onTrack = (event) => {
  console.log('event: ', event);
};
