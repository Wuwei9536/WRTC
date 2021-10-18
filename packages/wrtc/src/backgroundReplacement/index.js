import WebWorker from 'web-worker:./worker';

export default class BackgroundReplacement {
  constructor(options) {
    const { localVideo, maskImg, webcamStream, backgroundCanvasId, mode } = options;
    const [localVideoTrack] = webcamStream.getVideoTracks();
    this.localVideo = localVideo;
    this.localImageCapture = new ImageCapture(localVideoTrack);

    this.maskImg = maskImg;
    // web worker
    this.worker = null;
    // 背景替换后用canvas代替video
    this.canvas = document.getElementById(backgroundCanvasId);
    this.canvas.width = this.localVideo.clientWidth;
    this.canvas.height = this.localVideo.clientHeight;
    // 画布生成的视频流，用于传输
    this.stream = this.canvas.captureStream();
    // 是否背景替换中
    this.state = 'active';
    this.mode = mode;
    this.initWorker();
  }

  //   是否支持离线画布
  checkSupported = () => {
    if (this.canvas.transferControlToOffscreen) {
      return true;
    }
    return false;
  };

  initWorker = () => {
    if (!this.checkSupported()) {
      return;
    }
    if (!this.worker) {
      this.worker = new WebWorker();
      this.initListener();
    }
    this.transOffscreen();
    this.transMaskImg();
  };

  //   传递离线画布
  transOffscreen = () => {
    const offscreen = this.canvas.transferControlToOffscreen();
    this.worker.postMessage({ type: 'offCanvas', canvas: offscreen }, [offscreen]);
  };

  //   传递蒙版图片
  transMaskImg = () => {
    createImageBitmap(this.maskImg).then((res) => {
      this.worker.postMessage({ type: 'maskImg', maskImgBitmap: res }, [res]);
      this.renderCanvasImg();
    });
  };

  // 渲染canvas
  renderCanvasImg = async () => {
    //  从本地视频track中拿到位图数据给worker线程
    await this.localImageCapture.grabFrame().then((videoBitMap) => {
      this.worker.postMessage({ type: 'videoBitMap', bitMap: videoBitMap, mode: this.mode }, [videoBitMap]);
    });
  };

  //   处理与worker的通信
  handleMessage = (evt) => {
    console.log('evt: ', evt);
    const evtData = evt.data;
    const { type = '' } = evtData;
    if (type === 'init') {
      console.log('init');
      this.renderCanvasImg();
    } else if (type === 'success') {
      console.log('success: ');
      //   渲染成功的时候，替换video => canvas
      this.localVideo.style.display = 'none';
      this.canvas.style.display = 'block';
      this.renderCanvasImg();
    }
  };

  initListener = () => {
    this.worker.addEventListener('message', this.handleMessage);
  };

  //   暂停背景替换，移出listener即可
  stop = () => {
    console.log('stop');
    this.worker.removeEventListener('message', this.handleMessage);
    this.localVideo.style.display = 'block';
    this.canvas.style.display = 'none';
    this.state = 'inactive';
  };

  //   重启背景替换
  restart = () => {
    console.log('restart');
    this.initListener();
    this.renderCanvasImg();
    this.state = 'active';
  };
}

BackgroundReplacement.prototype.onSuccess = () => {
  console.log('success');
};

BackgroundReplacement.prototype.onInit = () => {
  console.log('init');
};
