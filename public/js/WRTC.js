(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.WRTC = factory());
})(this, (function () { 'use strict';

  function log(msg) {
    console.log(msg);
  }

  function warn(msg) {
    console.warn(msg);
  }

  function error(msg, callback = () => {}) {
    console.error(msg);
    callback();
  }

  // fade out

  // fade in

  function fadeIn(el, display) {
    el.style.opacity = 0;
    el.style.display = display || 'block';

    (function fade() {
      var val = parseFloat(el.style.opacity);
      if (!((val += 0.1) > 1)) {
        el.style.opacity = val;
        requestAnimationFrame(fade);
      }
    })();
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  class WHITEBOARD {
    constructor(options) {
      const { dataChanel, whiteboardId } = options;
      this.dataChanel = dataChanel;
      this.drawing = false;
      this.whiteboard = document.getElementById(whiteboardId);
      this.whiteboardContext = this.whiteboard.getContext('2d');
      this.current = {
        color: 'red',
      };
    }

    onMouseDown = (e) => {
      console.log('mouseDown');
      this.drawing = true;
      this.current.x = e.clientX || e.touches[0].clientX;
      this.current.y = e.clientY || e.touches[0].clientY;
    };

    onMouseUp = (e) => {
      if (!this.drawing) {
        return;
      }
      this.drawing = false;
      this.drawLine(
        this.current.x,
        this.current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        this.current.color,
        true
      );
    };

    onMouseMove = (e) => {
      console.log('mouseMove');

      if (!this.drawing) {
        return;
      }
      this.drawLine(
        this.current.x,
        this.current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        this.current.color,
        true
      );
      this.current.x = e.clientX || e.touches[0].clientX;
      this.current.y = e.clientY || e.touches[0].clientY;
    };

    drawLine = (x0, y0, x1, y1, color, emit) => {
      console.log({ x0, y0, x1, y1, color, emit });
      this.whiteboardContext.beginPath();
      this.whiteboardContext.moveTo(x0 - this.whiteboard.offsetLeft, y0 - this.whiteboard.offsetTop);
      this.whiteboardContext.lineTo(x1 - this.whiteboard.offsetLeft, y1 - this.whiteboard.offsetTop);
      this.whiteboardContext.strokeStyle = color;
      this.whiteboardContext.lineWidth = 2;
      this.whiteboardContext.stroke();
      this.whiteboardContext.closePath();

      if (!emit) {
        return;
      }
      var w = this.whiteboard.width;
      var h = this.whiteboard.height;

      if (this.dataChanel) {
        this.dataChanel.send(
          JSON.stringify({
            type: 'whiteboard',
            data: {
              x0: x0 / w,
              y0: y0 / h,
              x1: x1 / w,
              y1: y1 / h,
              color: color,
            },
          })
        );
      }
    };

    toggleWhiteboard = () => {
      if (this.whiteboard.style.display === 'none') {
        fadeIn(this.whiteboard);
        this.whiteboard.addEventListener('mousedown', this.onMouseDown, false);
        this.whiteboard.addEventListener('mouseup', this.onMouseUp, false);
        this.whiteboard.addEventListener('mouseout', this.onMouseUp, false);
        this.whiteboard.addEventListener('mousemove', throttle(this.onMouseMove, 10), false);

        //Touch support for mobile devices
        this.whiteboard.addEventListener('touchstart', this.onMouseDown, false);
        this.whiteboard.addEventListener('touchend', this.onMouseUp, false);
        this.whiteboard.addEventListener('touchcancel', this.onMouseUp, false);
        this.whiteboard.addEventListener('touchmove', throttle(this.onMouseMove, 10), false);
      } else {
        this.whiteboard.removeEventListener('mousedown', this.onMouseDown, false);
        this.whiteboard.removeEventListener('mouseup', this.onMouseUp, false);
        this.whiteboard.removeEventListener('mouseout', this.onMouseUp, false);
        this.whiteboard.removeEventListener('mousemove', throttle(this.onMouseMove, 10), false);

        //Touch support for mobile devices
        this.whiteboard.removeEventListener('touchstart', this.onMouseDown, false);
        this.whiteboard.removeEventListener('touchend', this.onMouseUp, false);
        this.whiteboard.removeEventListener('touchcancel', this.onMouseUp, false);
        this.whiteboard.removeEventListener('touchmove', throttle(this.onMouseMove, 10), false);
        fadeOut(this.whiteboard);
      }
    };
  }

  var WorkerClass = null;

  try {
      var WorkerThreads =
          typeof module !== 'undefined' && typeof module.require === 'function' && module.require('worker_threads') ||
          typeof __non_webpack_require__ === 'function' && __non_webpack_require__('worker_threads') ||
          typeof require === 'function' && require('worker_threads');
      WorkerClass = WorkerThreads.Worker;
  } catch(e) {} // eslint-disable-line

  function decodeBase64$1(base64, enableUnicode) {
      return Buffer.from(base64, 'base64').toString(enableUnicode ? 'utf16' : 'utf8');
  }

  function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
      var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
      var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
      var source = decodeBase64$1(base64, enableUnicode);
      var start = source.indexOf('\n', 10) + 1;
      var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
      return function WorkerFactory(options) {
          return new WorkerClass(body, Object.assign({}, options, { eval: true }));
      };
  }

  function decodeBase64(base64, enableUnicode) {
      var binaryString = atob(base64);
      if (enableUnicode) {
          var binaryView = new Uint8Array(binaryString.length);
          for (var i = 0, n = binaryString.length; i < n; ++i) {
              binaryView[i] = binaryString.charCodeAt(i);
          }
          return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
      }
      return binaryString;
  }

  function createURL(base64, sourcemapArg, enableUnicodeArg) {
      var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
      var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
      var source = decodeBase64(base64, enableUnicode);
      var start = source.indexOf('\n', 10) + 1;
      var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
      var blob = new Blob([body], { type: 'application/javascript' });
      return URL.createObjectURL(blob);
  }

  function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
      var url;
      return function WorkerFactory(options) {
          url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
          return new Worker(url, options);
      };
  }

  var kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

  function isNodeJS() {
      return kIsNodeJS;
  }

  function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
      if (isNodeJS()) {
          return createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg);
      }
      return createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg);
  }

  var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgaW1wb3J0U2NyaXB0cygKICAgICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL0B0ZW5zb3JmbG93L3RmanNAMS4yJywKICAgICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL0B0ZW5zb3JmbG93LW1vZGVscy9ib2R5LXBpeEAyLjAnCiAgKTsKCiAgY29uc3QgaW5pdEJvZHlQaXggPSBhc3luYyAoKSA9PiB7CiAgICBuZXQgPSBhd2FpdCBib2R5UGl4LmxvYWQoewogICAgICBhcmNoaXRlY3R1cmU6ICdNb2JpbGVOZXRWMScsCiAgICAgIG91dHB1dFN0cmlkZTogMTYsCiAgICAgIG11bHRpcGxpZXI6IDAuNzUsCiAgICAgIHF1YW50Qnl0ZXM6IDIsCiAgICB9KTsKICAgIHNlbGYucG9zdE1lc3NhZ2UoeyB0eXBlOiAnaW5pdCcgfSk7CiAgfTsKICBsZXQgbmV0ID0gbnVsbCwKICAgIG1hc2tJbWcgPSBudWxsLAogICAgb2ZmQ2FudmFzID0gbnVsbCwKICAgIG9mZkNhbnZhc0NvbnRleHQgPSBudWxsLAogICAgb2ZmVG1wQ2FudmFzID0gbnVsbCwKICAgIG9mZlRtcENhbnZhc0NvbnRleHQgPSBudWxsOwoKICBpbml0Qm9keVBpeCgpOwoKICBzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyAoZXZ0KSA9PiB7CiAgICBjb25zdCBldnREYXRhID0gZXZ0LmRhdGE7CiAgICBjb25zb2xlLmxvZygnZXZ0RGF0YTogJywgZXZ0RGF0YSk7CgogICAgc3dpdGNoIChldnREYXRhLnR5cGUpIHsKICAgICAgY2FzZSAnb2ZmQ2FudmFzJzoKICAgICAgICBvZmZDYW52YXMgPSBldnREYXRhLmNhbnZhczsKICAgICAgICBvZmZDYW52YXNDb250ZXh0ID0gb2ZmQ2FudmFzLmdldENvbnRleHQoJzJkJyk7CiAgICAgICAgb2ZmVG1wQ2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyhvZmZDYW52YXMud2lkdGgsIG9mZkNhbnZhcy5oZWlnaHQpOwogICAgICAgIG9mZlRtcENhbnZhc0NvbnRleHQgPSBvZmZUbXBDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTsKICAgICAgICBicmVhazsKICAgICAgY2FzZSAnbWFza0ltZyc6CiAgICAgICAgbWFza0ltZyA9IGV2dERhdGEubWFza0ltZ0JpdG1hcDsKICAgICAgICBicmVhazsKICAgICAgY2FzZSAndmlkZW9CaXRNYXAnOgogICAgICAgIGlmIChvZmZDYW52YXNDb250ZXh0ID09PSBudWxsIHx8IG5ldCA9PT0gbnVsbCB8fCBtYXNrSW1nID09PSBudWxsKSB7CiAgICAgICAgICBicmVhazsKICAgICAgICB9CiAgICAgICAgY29uc3QgZXZ0Qml0TWFwID0gZXZ0RGF0YS5iaXRNYXA7CiAgICAgICAgb2ZmVG1wQ2FudmFzQ29udGV4dC5kcmF3SW1hZ2UoCiAgICAgICAgICBldnRCaXRNYXAsCiAgICAgICAgICAwLAogICAgICAgICAgMCwKICAgICAgICAgIGV2dEJpdE1hcC53aWR0aCwKICAgICAgICAgIGV2dEJpdE1hcC5oZWlnaHQsCiAgICAgICAgICAwLAogICAgICAgICAgMCwKICAgICAgICAgIG9mZkNhbnZhcy53aWR0aCwKICAgICAgICAgIG9mZkNhbnZhcy5oZWlnaHQKICAgICAgICApOwoKICAgICAgICBjb25zdCBzZWdtZW50YXRpb24gPSBhd2FpdCBuZXQuc2VnbWVudFBlcnNvbigKICAgICAgICAgIG9mZlRtcENhbnZhc0NvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIG9mZkNhbnZhcy53aWR0aCwgb2ZmQ2FudmFzLmhlaWdodCksCiAgICAgICAgICB7CiAgICAgICAgICAgIGludGVybmFsUmVzb2x1dGlvbjogJ21lZGl1bScsCiAgICAgICAgICAgIHNlZ21lbnRhdGlvblRocmVzaG9sZDogMC43LAogICAgICAgICAgICBtYXhEZXRlY3Rpb25zOiAzLAogICAgICAgICAgICBzY29yZVRocmVzaG9sZDogMC4zLAogICAgICAgICAgICBubXNSYWRpdXM6IDIwLAogICAgICAgICAgfQogICAgICAgICk7CiAgICAgICAgY29uc29sZS5sb2coeyBzZWdtZW50YXRpb24gfSk7CiAgICAgICAgY29uc3QgZm9yZWdyb3VuZENvbG9yID0geyByOiAwLCBnOiAwLCBiOiAwLCBhOiAwIH07CiAgICAgICAgY29uc3QgYmFja2dyb3VuZENvbG9yID0geyByOiAwLCBnOiAwLCBiOiAwLCBhOiAyNTUgfTsKICAgICAgICBjb25zdCBiYWNrZ3JvdW5kRGFya2VuaW5nTWFzayA9IGJvZHlQaXgudG9NYXNrKHNlZ21lbnRhdGlvbiwgZm9yZWdyb3VuZENvbG9yLCBiYWNrZ3JvdW5kQ29sb3IpOwoKICAgICAgICBpZiAoIWJhY2tncm91bmREYXJrZW5pbmdNYXNrKSB7CiAgICAgICAgICBvZmZDYW52YXNDb250ZXh0LmRyYXdJbWFnZShvZmZUbXBDYW52YXMsIDAsIDApOwogICAgICAgICAgcmV0dXJuOwogICAgICAgIH0KICAgICAgICBpZiAoZXZ0RGF0YS5tb2RlID09PSAncmVwbGFjZScpIHsKICAgICAgICAgIG9mZkNhbnZhc0NvbnRleHQucHV0SW1hZ2VEYXRhKGJhY2tncm91bmREYXJrZW5pbmdNYXNrLCAwLCAwKTsKICAgICAgICAgIG9mZkNhbnZhc0NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1pbic7CiAgICAgICAgICBvZmZDYW52YXNDb250ZXh0LmRyYXdJbWFnZSgKICAgICAgICAgICAgbWFza0ltZywKICAgICAgICAgICAgMCwKICAgICAgICAgICAgMCwKICAgICAgICAgICAgbWFza0ltZy53aWR0aCwKICAgICAgICAgICAgbWFza0ltZy5oZWlnaHQsCiAgICAgICAgICAgIDAsCiAgICAgICAgICAgIDAsCiAgICAgICAgICAgIG9mZkNhbnZhcy53aWR0aCwKICAgICAgICAgICAgb2ZmQ2FudmFzLmhlaWdodAogICAgICAgICAgKTsKICAgICAgICAgIG9mZkNhbnZhc0NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW92ZXInOwogICAgICAgICAgb2ZmQ2FudmFzQ29udGV4dC5kcmF3SW1hZ2UoCiAgICAgICAgICAgIGV2dEJpdE1hcCwKICAgICAgICAgICAgMCwKICAgICAgICAgICAgMCwKICAgICAgICAgICAgZXZ0Qml0TWFwLndpZHRoLAogICAgICAgICAgICBldnRCaXRNYXAuaGVpZ2h0LAogICAgICAgICAgICAwLAogICAgICAgICAgICAwLAogICAgICAgICAgICBvZmZDYW52YXMud2lkdGgsCiAgICAgICAgICAgIG9mZkNhbnZhcy5oZWlnaHQKICAgICAgICAgICk7CiAgICAgICAgICBvZmZDYW52YXNDb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7CiAgICAgICAgfSBlbHNlIGlmIChldnREYXRhLm1vZGUgPT09ICd2aXJ0dWFsJykgewogICAgICAgICAgb2ZmQ2FudmFzQ29udGV4dC5wdXRJbWFnZURhdGEoYmFja2dyb3VuZERhcmtlbmluZ01hc2ssIDAsIDApOwogICAgICAgICAgb2ZmQ2FudmFzQ29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWluJzsKICAgICAgICAgIG9mZkNhbnZhc0NvbnRleHQuZmlsdGVyID0gJ2JsdXIoMTBweCknOwogICAgICAgICAgb2ZmQ2FudmFzQ29udGV4dC5kcmF3SW1hZ2Uob2ZmVG1wQ2FudmFzLCAwLCAwKTsKICAgICAgICAgIG9mZkNhbnZhc0NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW92ZXInOwogICAgICAgICAgb2ZmQ2FudmFzQ29udGV4dC5maWx0ZXIgPSAnYmx1cigwcHgpJzsKICAgICAgICAgIG9mZkNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKAogICAgICAgICAgICBldnRCaXRNYXAsCiAgICAgICAgICAgIDAsCiAgICAgICAgICAgIDAsCiAgICAgICAgICAgIGV2dEJpdE1hcC53aWR0aCwKICAgICAgICAgICAgZXZ0Qml0TWFwLmhlaWdodCwKICAgICAgICAgICAgMCwKICAgICAgICAgICAgMCwKICAgICAgICAgICAgb2ZmQ2FudmFzLndpZHRoLAogICAgICAgICAgICBvZmZDYW52YXMuaGVpZ2h0CiAgICAgICAgICApOwogICAgICAgICAgb2ZmQ2FudmFzQ29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInOwogICAgICAgIH0KICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgdHlwZTogJ3N1Y2Nlc3MnIH0pOwogICAgICAgIGJyZWFrOwogICAgfQogIH0pOwoKfSkoKTsKCg==', null, false);
  /* eslint-enable */

  class BackgroundReplacement {
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
        this.worker = new WorkerFactory();
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

  class Recorder {
    constructor(options) {
      const { stream, recorderOptions = { mimeType: 'video/webm;codecs=vp8,opus' } } = options;
      this.recorderOptions = recorderOptions;
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        this.chunks.push(e.data);
      };
      this.timeslice = 1000;
    }

    start = (timeslice) => {
      console.log('start:');
      this.timeslice = timeslice;
      return this.mediaRecorder.start(timeslice);
    };

    stop = () => {
      this.mediaRecorder.stop();
      console.log('data available after MediaRecorder.stop() called.');
      return new Blob(this.chunks, { type: 'video/webm;codecs=vp8,opus' });
    };
  }

  class WRTC {
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

      this.WHITEBOARD = new WHITEBOARD({ dataChanel: this.DataChanel, whiteboardId: this.whiteboardId });
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
      log('Track event: ');
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
      log('收到offer');
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
      log('收到answer');
      await this.RTCPeerConnection.setRemoteDescription(answer).catch(error);
    };

    //  从对等端收到icecandidate
    onIceCandidata = async (icecandidate) => {
      log('从对等端收到icecandidate: ');
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

    // 替换背景 type: 'replace' | 'origin' | 'virtual'
    replaceBackground(type = 'replace') {
      if (!this.BackgroundReplacement) {
        this.BackgroundReplacement = new BackgroundReplacement({
          localVideo: this.localVideo,
          webcamStream: this.webcamStream,
          maskImg: this.maskImg,
          backgroundCanvasId: this.backgroundCanvasId,
        });
      }
      const premode = this.BackgroundReplacement.mode;
      this.BackgroundReplacement.mode = type;
      if (this.BackgroundReplacement.state === 'inactive' && type !== 'origin') {
        this.BackgroundReplacement.restart();
      }
      if ((type === premode || type === 'origin') && this.BackgroundReplacement.state === 'active') {
        this.BackgroundReplacement.stop();
      }
      if (this.RTCPeerConnection && this.RTCPeerConnection.connectionState === 'connected' && type !== 'origin') {
        this.switchStream(this.BackgroundReplacement.stream);
      }
      if (this.RTCPeerConnection && this.RTCPeerConnection.connectionState === 'connected' && type === 'origin') {
        this.switchStream(this.webcamStream);
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

  return WRTC;

}));
