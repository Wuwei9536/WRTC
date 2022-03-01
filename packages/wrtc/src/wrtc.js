import { log, warn, error } from './utils/log';
import WHITEBOARD from './whiteBoard';
import BackgroundReplacement from './backgroundReplacement/index';
import Recorder from './recorder';

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
    // 录制实例
    this.Recorder = null;
    // 媒体流
    this.webcamStream = null;
    // 远端流
    this.remoteStream = null;
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
    this.receivedBuffer = []; //存放数据的数组
    this.receivedSize = 0; //数据大小
    this.fileSize = 0;
    this.fileName = '';
    // 缓存的icecancidate
    this.icecandidateArr = [];

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

    /* --- 数据传输通道 --- */
    //将通用数据通道添加到对等连接，
    //用于文字聊天，字幕和切换发送字幕
    this.DataChanel = this.RTCPeerConnection.createDataChannel('chat', {
      negotiated: true,
      // both peers must have same id
      id: 0,
      ordered: true,
      maxRetransmits: 30,
    });
    //成功打开dataChannel时调用
    this.DataChanel.onopen = (event) => {
      log('dataChannel opened');
    };
    //处理不同的dataChannel类型
    this.DataChanel.onmessage = (event) => {
      console.log('event: ', event);
      if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
        console.log('blob');
        this.receivedBuffer.push(event.data);
        //更新已经收到的数据的长度
        this.receivedSize += event.data.byteLength || event.data.size;
        //如果接收到的字节数与文件大小相同，则创建文件
        if (this.receivedSize === this.fileSize) {
          //创建文件
          const received = new Blob(this.receivedBuffer, { type: 'application/octet-stream' });
          console.log('received: ', received);
          // 通过onRecieveFile抛出文件url给用户自行处理
          this.onRecieveFile({ url: URL.createObjectURL(received), fileName: this.fileName, fileSize: this.fileSize });
          //将buffer和 size 清空，为下一次传文件做准备
          this.receivedBuffer = [];
          this.receivedSize = 0;
          this.fileSize = 0;
          this.fileName = '';
        }
        return;
      }
      const receivedData = JSON.parse(event.data);
      log({ receivedData });
      const dataType = receivedData.type;
      const cleanedMessage = receivedData.data;
      if (dataType === 'whiteboard') {
        this.handleRecieveWhiteboard(cleanedMessage);
      } else if (dataType === 'file') {
        this.fileName = receivedData.fileName;
        this.fileSize = receivedData.fileSize;
      } else {
        this.onRecieveMessage(cleanedMessage);
      }
    };
    /* --- 数据传输通道 --- */

    // 初始化白板
    this.WHITEBOARD = new WHITEBOARD({ dataChanel: this.DataChanel, whiteboardId: this.whiteboardId });
  };

  // 发起呼叫
  invite = () => {
    log('发起呼叫');
    this.createPeerConnection();
    try {
      log('getTracks');
      this.webcamStream.getTracks().forEach((track) => {
        log('addTracks');
        this.RTCPeerConnection.addTrack(track, this.webcamStream);
      });
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
      this.onGetUserMedia();
      return this.webcamStream;
    } catch (err) {
      this.onGetUserMediaError();
      error(err);
    }
  };

  //  获取桌面流
  getDisplayMedia = async () => {
    log('获取桌面流');
    try {
      this.webcamStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      this.localVideo.srcObject = this.webcamStream;
      this.onGetDisplayMedia();
      return this.webcamStream;
    } catch (err) {
      this.onGetDisplayMediaError();
      error(err);
    }
  };

  //  需要协商
  handleNegotiationNeededEvent = async () => {
    log('开始协商');
    try {
      // 如果正处于connecting状态 或者 非stable 状态  推迟协商
      if (
        this.RTCPeerConnection.signalingState != 'stable' ||
        this.RTCPeerConnection.connectionState === 'connecting'
      ) {
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
        if (this.BackgroundReplacement && this.BackgroundReplacement.state === 'active') {
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
    this.remoteStream = event.streams[0];
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

  //  信令状态变更
  handleSignalingStateChange = (event) => {
    log('信令状态变更为: ' + this.RTCPeerConnection.signalingState);
    switch (this.RTCPeerConnection.signalingState) {
      case 'closed':
        this.invite();
        break;
    }
  };

  // ICE收集状态变更
  handleICEGatheringStateChange = (event) => {
    log('ICE收集状态变更为 : ' + this.RTCPeerConnection.iceGatheringState);
  };

  //  收到offer
  onOffer = async (offer) => {
    log('收到offer', offer);
    this.invite();

    if (this.RTCPeerConnection.signalingState != 'stable') {
      log('  - 信令状态非stable, 回滚');
      // Set the local and remove descriptions for rollback; don't proceed
      // until both return.
      await Promise.all([
        this.RTCPeerConnection.setLocalDescription({ type: 'rollback' }),
        this.RTCPeerConnection.setRemoteDescription(new RTCSessionDescription(offer)),
      ]);
      return;
    } else {
      log('setRemoteDescription(设置远端描述)');
      await this.RTCPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    }

    log('创建并发送answer给对等端');
    await this.RTCPeerConnection.setLocalDescription();
    log('将缓存的icecandidate  addIceCandidate');
    this.icecandidateArr.forEach((icecandidate) => {
      console.log('ic: ', icecandidate);
      this.RTCPeerConnection.addIceCandidate(new RTCIceCandidate(icecandidate));
    });
    this.socket.emit('answer', this.RTCPeerConnection.localDescription, this.room);
  };

  //  收到answer
  onAnswer = async (answer) => {
    log('收到answer' + JSON.stringify(answer));
    await this.RTCPeerConnection.setRemoteDescription(new RTCSessionDescription(answer)).catch(error);
  };

  //  从对等端收到icecandidate
  onIceCandidata = async (icecandidate) => {
    log('从对等端收到icecandidate:' + JSON.stringify(icecandidate));
    if (!this.RTCPeerConnection) {
      this.icecandidateArr.push(icecandidate);
      return;
    }
    try {
      await this.RTCPeerConnection.addIceCandidate(new RTCIceCandidate(icecandidate));
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
    if (this.BackgroundReplacement && this.BackgroundReplacement.state === 'active') {
      this.replaceBackground('origin');
    }
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
    if (!this.RTCPeerConnection) {
      return;
    }
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
        this.mode = 'screen';
        this.switchStream(this.webcamStream);
      } catch (err) {
        log(err);
      }
    } else {
      try {
        this.webcamStream = await this.getUserMedia();
        this.mode = 'camera';
        this.switchStream(this.webcamStream);
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

  // 替换背景 type: 'replace' | 'origin' | 'virtual'
  replaceBackground(type = 'replace') {
    if (!this.BackgroundReplacement) {
      this.BackgroundReplacement = new BackgroundReplacement({
        localVideo: this.localVideo,
        webcamStream: this.webcamStream,
        maskImg: this.maskImg,
        backgroundCanvasId: this.backgroundCanvasId,
        mode: type
      });
      if(this.RTCPeerConnection && this.RTCPeerConnection.connectionState === 'connected' ){
        this.switchStream(this.BackgroundReplacement.stream);
      }
      return;
    }
    const premode = this.BackgroundReplacement.mode;
    this.BackgroundReplacement.mode = type;
    if (this.BackgroundReplacement.state === 'inactive' && type !== 'origin') {
      this.BackgroundReplacement.restart();
      if(this.RTCPeerConnection && this.RTCPeerConnection.connectionState === 'connected' ){
        this.switchStream(this.BackgroundReplacement.stream);
      }
    } else if ((type === premode || type === 'origin') && this.BackgroundReplacement.state === 'active') {
      this.BackgroundReplacement.stop();
      if(this.RTCPeerConnection && this.RTCPeerConnection.connectionState === 'connected' ){
        this.switchStream(this.webcamStream);
      }
    }
  }

  sendFile = (file) => {
    let offset = 0; //偏移量
    const chunkSize = 16384; //每次传输的块大小
    const fileReader = new FileReader();
    this.sendData({ type: 'file', fileName: file.name, fileSize: file.size }); //发送数据
    fileReader.onload = (e) => {
      console.log('e: ', e);
      //当数据被加载时触发该事件
      this.DataChanel.send(e.target.result);
      offset += e.target.result.byteLength; //更改已读数据的偏移量
      if (offset < file.size) {
        //如果文件没有被读完
        readSlice(offset); // 读取数据
      }
    };

    var readSlice = (o) => {
      const slice = file.slice(offset, o + chunkSize); //计算数据位置
      fileReader.readAsArrayBuffer(slice); //读取 16K 数据
    };

    readSlice(0); //开始读取数据
  };

  // 截图
  screenshot = () => {
    if (!this.RTCPeerConnection) {
      return;
    }
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = this.remoteVideo.videoWidth;
    tmpCanvas.height = this.remoteVideo.videoHeight;
    const tmpCanvas2D = tmpCanvas.getContext('2d');
    tmpCanvas2D.drawImage(this.remoteVideo, 0, 0);
    return tmpCanvas.toDataURL();
  };

  // 录制
  record = (timeSlice) => {
    if (!this.remoteStream) {
      return;
    }
    this.Recorder = new Recorder({
      stream: this.remoteStream,
    });
    this.Recorder.start(timeSlice);
  };

  // 停止录制
  stopRecord = () => {
    const blob = this.Recorder.stop();
    //生成下载地址
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = '录制文件';
    downloadAnchor.click();
    this.Recorder = null;
  };
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

WRTC.prototype.onRecieveFile = (url) => {
  console.log('url: ', url);
};

WRTC.prototype.onGetDisplayMedia = () => {};

WRTC.prototype.onGetDisplayMediaError = () => {};

WRTC.prototype.onGetUserMedia = () => {};

WRTC.prototype.onGetUserMediaError = () => {};
