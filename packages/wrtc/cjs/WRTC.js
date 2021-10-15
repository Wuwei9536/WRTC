"use strict";function e(e){console.log(e)}function t(e){console.warn(e)}function i(e,t=(()=>{})){console.error(e),t()}function n(e,t){var i=(new Date).getTime();return function(){var n=(new Date).getTime();n-i>=t&&(i=n,e.apply(null,arguments))}}class o{constructor(e){const{dataChanel:t,whiteboardId:i}=e;this.dataChanel=t,this.drawing=!1,this.whiteboard=document.getElementById(i),this.whiteboardContext=this.whiteboard.getContext("2d"),this.current={color:"red"}}onMouseDown=e=>{console.log("mouseDown"),this.drawing=!0,this.current.x=e.clientX||e.touches[0].clientX,this.current.y=e.clientY||e.touches[0].clientY};onMouseUp=e=>{this.drawing&&(this.drawing=!1,this.drawLine(this.current.x,this.current.y,e.clientX||e.touches[0].clientX,e.clientY||e.touches[0].clientY,this.current.color,!0))};onMouseMove=e=>{console.log("mouseMove"),this.drawing&&(this.drawLine(this.current.x,this.current.y,e.clientX||e.touches[0].clientX,e.clientY||e.touches[0].clientY,this.current.color,!0),this.current.x=e.clientX||e.touches[0].clientX,this.current.y=e.clientY||e.touches[0].clientY)};drawLine=(e,t,i,n,o,s)=>{if(console.log({x0:e,y0:t,x1:i,y1:n,color:o,emit:s}),this.whiteboardContext.beginPath(),this.whiteboardContext.moveTo(e-this.whiteboard.offsetLeft,t-this.whiteboard.offsetTop),this.whiteboardContext.lineTo(i-this.whiteboard.offsetLeft,n-this.whiteboard.offsetTop),this.whiteboardContext.strokeStyle=o,this.whiteboardContext.lineWidth=2,this.whiteboardContext.stroke(),this.whiteboardContext.closePath(),s){var a=this.whiteboard.width,r=this.whiteboard.height;this.dataChanel&&this.dataChanel.send(JSON.stringify({type:"whiteboard",data:{x0:e/a,y0:t/r,x1:i/a,y1:n/r,color:o}}))}};toggleWhiteboard=()=>{var e,t;"none"===this.whiteboard.style.display?((e=this.whiteboard).style.opacity=0,e.style.display=t||"block",function t(){var i=parseFloat(e.style.opacity);(i+=.1)>1||(e.style.opacity=i,requestAnimationFrame(t))}(),this.whiteboard.addEventListener("mousedown",this.onMouseDown,!1),this.whiteboard.addEventListener("mouseup",this.onMouseUp,!1),this.whiteboard.addEventListener("mouseout",this.onMouseUp,!1),this.whiteboard.addEventListener("mousemove",n(this.onMouseMove,10),!1),this.whiteboard.addEventListener("touchstart",this.onMouseDown,!1),this.whiteboard.addEventListener("touchend",this.onMouseUp,!1),this.whiteboard.addEventListener("touchcancel",this.onMouseUp,!1),this.whiteboard.addEventListener("touchmove",n(this.onMouseMove,10),!1)):(this.whiteboard.removeEventListener("mousedown",this.onMouseDown,!1),this.whiteboard.removeEventListener("mouseup",this.onMouseUp,!1),this.whiteboard.removeEventListener("mouseout",this.onMouseUp,!1),this.whiteboard.removeEventListener("mousemove",n(this.onMouseMove,10),!1),this.whiteboard.removeEventListener("touchstart",this.onMouseDown,!1),this.whiteboard.removeEventListener("touchend",this.onMouseUp,!1),this.whiteboard.removeEventListener("touchcancel",this.onMouseUp,!1),this.whiteboard.removeEventListener("touchmove",n(this.onMouseMove,10),!1),fadeOut(this.whiteboard))}}var s=null;try{var a="undefined"!=typeof module&&"function"==typeof module.require&&module.require("worker_threads")||"function"==typeof __non_webpack_require__&&__non_webpack_require__("worker_threads")||"function"==typeof require&&require("worker_threads");s=a.Worker}catch(e){}function r(e,t,i){var n=void 0===t?null:t,o=function(e,t){return Buffer.from(e,"base64").toString(t?"utf16":"utf8")}(e,void 0!==i&&i),a=o.indexOf("\n",10)+1,r=o.substring(a)+(n?"//# sourceMappingURL="+n:"");return function(e){return new s(r,Object.assign({},e,{eval:!0}))}}function c(e,t,i){var n=void 0===t?null:t,o=function(e,t){var i=atob(e);if(t){for(var n=new Uint8Array(i.length),o=0,s=i.length;o<s;++o)n[o]=i.charCodeAt(o);return String.fromCharCode.apply(null,new Uint16Array(n.buffer))}return i}(e,void 0!==i&&i),s=o.indexOf("\n",10)+1,a=o.substring(s)+(n?"//# sourceMappingURL="+n:""),r=new Blob([a],{type:"application/javascript"});return URL.createObjectURL(r)}var h="[object process]"===Object.prototype.toString.call("undefined"!=typeof process?process:0);var d,l,m,u=(d="Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwohZnVuY3Rpb24oKXsidXNlIHN0cmljdCI7aW1wb3J0U2NyaXB0cygiaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9AdGVuc29yZmxvdy90ZmpzQDEuMiIsImh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vQHRlbnNvcmZsb3ctbW9kZWxzL2JvZHktcGl4QDIuMCIpO2xldCBlPW51bGwsdD1udWxsLHM9bnVsbCxhPW51bGwsbz1udWxsLG49bnVsbDsoYXN5bmMoKT0+e2U9YXdhaXQgYm9keVBpeC5sb2FkKHthcmNoaXRlY3R1cmU6Ik1vYmlsZU5ldFYxIixvdXRwdXRTdHJpZGU6MTYsbXVsdGlwbGllcjouNzUscXVhbnRCeXRlczoyfSksc2VsZi5wb3N0TWVzc2FnZSh7dHlwZToiaW5pdCJ9KX0pKCksc2VsZi5hZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIiwoYXN5bmMgaT0+e2NvbnN0IGw9aS5kYXRhO3N3aXRjaChjb25zb2xlLmxvZygiZXZ0RGF0YTogIixsKSxsLnR5cGUpe2Nhc2Uib2ZmQ2FudmFzIjpzPWwuY2FudmFzLGE9cy5nZXRDb250ZXh0KCIyZCIpLG89bmV3IE9mZnNjcmVlbkNhbnZhcyhzLndpZHRoLHMuaGVpZ2h0KSxuPW8uZ2V0Q29udGV4dCgiMmQiKTticmVhaztjYXNlIm1hc2tJbWciOnQ9bC5tYXNrSW1nQml0bWFwO2JyZWFrO2Nhc2UidmlkZW9CaXRNYXAiOmlmKG51bGw9PT1hfHxudWxsPT09ZXx8bnVsbD09PXQpYnJlYWs7Y29uc3QgaT1sLmJpdE1hcDtuLmRyYXdJbWFnZShpLDAsMCxpLndpZHRoLGkuaGVpZ2h0LDAsMCxzLndpZHRoLHMuaGVpZ2h0KSxjb25zb2xlLmxvZyh7bmV0OmV9KTtjb25zdCByPWF3YWl0IGUuc2VnbWVudFBlcnNvbihuLmdldEltYWdlRGF0YSgwLDAscy53aWR0aCxzLmhlaWdodCkse2ludGVybmFsUmVzb2x1dGlvbjoibWVkaXVtIixzZWdtZW50YXRpb25UaHJlc2hvbGQ6LjcsbWF4RGV0ZWN0aW9uczozLHNjb3JlVGhyZXNob2xkOi4zLG5tc1JhZGl1czoyMH0pO2NvbnNvbGUubG9nKHtzZWdtZW50YXRpb246cn0pO2NvbnN0IGQ9e3I6MCxnOjAsYjowLGE6MH0sZz17cjowLGc6MCxiOjAsYToyNTV9LGg9Ym9keVBpeC50b01hc2socixkLGcpO251bGwhPT1oPyhhLnB1dEltYWdlRGF0YShoLDAsMCksYS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249InNvdXJjZS1pbiIsYS5kcmF3SW1hZ2UodCwwLDAsdC53aWR0aCx0LmhlaWdodCwwLDAscy53aWR0aCxzLmhlaWdodCksYS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249ImRlc3RpbmF0aW9uLW92ZXIiLGEuZHJhd0ltYWdlKGksMCwwLGkud2lkdGgsaS5oZWlnaHQsMCwwLHMud2lkdGgscy5oZWlnaHQpLGEuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPSJzb3VyY2Utb3ZlciIpOmEuZHJhd0ltYWdlKHQsMCwwKSxzZWxmLnBvc3RNZXNzYWdlKHt0eXBlOiJzdWNjZXNzIn0pfX0pKX0oKTsKCg==",l=null,m=!1,h?r(d,l,m):function(e,t,i){var n;return function(o){return n=n||c(e,t,i),new Worker(n,o)}}(d,l,m));class b{constructor(e){const{localVideo:t,maskImg:i,webcamStream:n,backgroundCanvasId:o}=e,[s]=n.getVideoTracks();this.localVideo=t,this.localImageCapture=new ImageCapture(s),this.maskImg=i,this.worker=null,this.canvas=document.getElementById(o),this.canvas.width=this.localVideo.clientWidth,this.canvas.height=this.localVideo.clientHeight,this.stream=this.canvas.captureStream(),this.state="active",this.initWorker()}checkSupported=()=>!!this.canvas.transferControlToOffscreen;initWorker=()=>{this.checkSupported()&&(this.worker||(this.worker=new u,this.initListener()),this.transOffscreen(),this.transMaskImg())};transOffscreen=()=>{const e=this.canvas.transferControlToOffscreen();this.worker.postMessage({type:"offCanvas",canvas:e},[e])};transMaskImg=()=>{createImageBitmap(this.maskImg).then((e=>{this.worker.postMessage({type:"maskImg",maskImgBitmap:e},[e]),this.renderCanvasImg()}))};renderCanvasImg=async()=>{await this.localImageCapture.grabFrame().then((e=>{this.worker.postMessage({type:"videoBitMap",bitMap:e},[e])}))};handleMessage=e=>{console.log("evt: ",e);const t=e.data,{type:i=""}=t;"init"===i?(console.log("init"),this.renderCanvasImg()):"success"===i&&(console.log("success: "),this.localVideo.style.display="none",this.canvas.style.display="block",this.renderCanvasImg())};initListener=()=>{this.worker.addEventListener("message",this.handleMessage)};stop=()=>{this.worker.removeEventListener("message",this.handleMessage),this.localVideo.style.display="block",this.canvas.style.display="none",this.state="inactive"};restart=()=>{this.initListener(),this.renderCanvasImg(),this.state="active"}}class C{constructor(t){this.RTCPeerConnection=null,this.DataChanel=null,this.WHITEBOARD=null,this.webcamStream=null,this.videoEnabled=!0,this.audioEnabled=!0,this.mode="camera";const{localVideoId:i="localVideo",remoteVideoId:n="remoteVideo",whiteboardId:o="whiteboard",backgroundCanvasId:s="localCanvas",iceServers:a=[],socket:r,room:c=location.href,mediaConstraint:h={video:!0,audio:!0},maskImg:d}=t;this.br=null,this.maskImg=d,this.backgroundCanvasId=s,this.localVideo=document.getElementById(i),this.remoteVideo=document.getElementById(n),this.iceServers=a,this.socket=r,this.room=c,this.mediaConstraint=h,this.whiteboardId=o,r.on("ready",this.invite),r.on("offer",this.onOffer),r.on("answer",this.onAnswer),r.on("icecandidate",this.onIceCandidata),this.getUserMedia().then((()=>{e(`加入房间${this.room}`),this.socket.emit("join",this.room)}))}createPeerConnection=()=>{e("创建rtcpeerconnection"),this.RTCPeerConnection=new RTCPeerConnection({iceServers:this.iceServers}),this.RTCPeerConnection.onconnectionstatechange=this.handleConnectionStateChange,this.RTCPeerConnection.onicecandidateerror=i,this.RTCPeerConnection.onicecandidate=this.handleICECandidateEvent,this.RTCPeerConnection.oniceconnectionstatechange=this.handleICEConnectionStateChange,this.RTCPeerConnection.onicegatheringstatechange=this.handleICEGatheringStateChange,this.RTCPeerConnection.onsignalingstatechange=this.handleSignalingStateChange,this.RTCPeerConnection.onnegotiationneeded=this.handleNegotiationNeededEvent,this.RTCPeerConnection.ontrack=this.handleTrackEvent,this.DataChanel=this.RTCPeerConnection.createDataChannel("chat",{negotiated:!0,id:0}),this.DataChanel.onopen=t=>{e("dataChannel opened")},this.DataChanel.onmessage=t=>{const i=JSON.parse(t.data);e({receivedData:i});const n=i.type,o=i.data;"whiteboard"===n?this.handleRecieveWhiteboard(o):this.onRecieveMessage(o)},this.WHITEBOARD=new o({dataChanel:this.DataChanel,whiteboardId:this.whiteboardId})};replaceBackground(e="replace"){this.br||(this.br=new b({localVideo:this.localVideo,webcamStream:this.webcamStream,maskImg:this.maskImg,backgroundCanvasId:this.backgroundCanvasId})),"inactive"===this.br.state&&"replace"===e&&this.br.restart(),"origin"===e&&"active"===this.br.state&&this.br.stop(),this.RTCPeerConnection&&"connected"===this.RTCPeerConnection.connectionState&&"replace"===e&&this.switchStream(this.br.stream),this.RTCPeerConnection&&"connected"===this.RTCPeerConnection.connectionState&&"origin"===e&&this.switchStream(this.webcamStream)}invite=()=>{e("发起呼叫"),this.createPeerConnection();try{this.webcamStream.getTracks().forEach((e=>this.RTCPeerConnection.addTrack(e,this.webcamStream)))}catch(e){i(e)}};getUserMedia=async()=>{e("获取媒体流");try{return this.webcamStream=await navigator.mediaDevices.getUserMedia(this.mediaConstraint),this.localVideo.srcObject=this.webcamStream,this.webcamStream}catch(e){i(e)}};getDisplayMedia=async()=>{e("获取桌面流");try{return this.webcamStream=await navigator.mediaDevices.getDisplayMedia({video:!0,audio:!1}),this.localVideo.srcObject=this.webcamStream,this.webcamStream}catch(e){i(e)}};handleNegotiationNeededEvent=async()=>{e("开始协商");try{if("stable"!=this.RTCPeerConnection.signalingState)return void e("signalingState ！= stable，推迟协商");e("setLocalDescription（设置本地描述）"),await this.RTCPeerConnection.setLocalDescription(),e("发送offer给对等端"),this.socket.emit("offer",this.RTCPeerConnection.localDescription,this.room)}catch(e){i(e)}};handleConnectionStateChange=()=>{switch(t("连接状态变更为: "+this.RTCPeerConnection.connectionState),this.RTCPeerConnection.connectionState){case"connected":const i=this.RTCPeerConnection.getConfiguration();e("*** 连接配置为: "+JSON.stringify(i)),this.br&&this.switchStream(this.br.stream);break;case"disconnected":break;case"failed":t("连接失败，现在开始重新协商"),this.RTCPeerConnection.restartIce(),setTimeout((()=>{"connected"!==this.RTCPeerConnection.iceConnectionState&&(e("重新协商失败，新建rtcpeerconnection,重新呼叫"),this.invite())}),1e4)}};handleTrackEvent=t=>{e("Track event: "),this.remoteVideo.srcObject=t.streams[0],this.onTrack(t)};handleICECandidateEvent=t=>{t.candidate&&(e("发送 ICE candidate: "+t.candidate.candidate),this.socket.emit("icecandidate",t.candidate,this.room))};handleICEConnectionStateChange=t=>{e("ICE连接状态变更为 "+this.RTCPeerConnection.iceConnectionState)};handleSignalingStateChange=t=>{if(e("信令状态变更为: "+this.RTCPeerConnection.signalingState),"closed"===this.RTCPeerConnection.signalingState)this.invite()};handleICEGatheringStateChange=t=>{e("ICE收集状态变更为 : "+this.RTCPeerConnection.iceGatheringState)};onOffer=async t=>{if(e("收到offer"),this.invite(),"stable"!=this.RTCPeerConnection.signalingState)return e("  - But the signaling state isn't stable, so triggering rollback"),void await Promise.all([this.RTCPeerConnection.setLocalDescription({type:"rollback"}),this.RTCPeerConnection.setRemoteDescription(t)]);e("Setting remote description(设置远端描述)"),await this.RTCPeerConnection.setRemoteDescription(t),e("创建并发送answer给对等端"),await this.RTCPeerConnection.setLocalDescription(),this.socket.emit("answer",this.RTCPeerConnection.localDescription,this.room)};onAnswer=async t=>{e("收到answer"),await this.RTCPeerConnection.setRemoteDescription(t).catch(i)};onIceCandidata=async t=>{e("从对等端收到icecandidate: ");try{await this.RTCPeerConnection.addIceCandidate(t)}catch(e){i(e)}};sendData=e=>{console.log("data: ",e),this.DataChanel.send(JSON.stringify(e))};muteMicrophone=()=>{this.webcamStream.getTracks().forEach((e=>{"audio"===e.kind&&(e.enabled=!e.enabled,this.audioEnabled=e.enabled,this.onMuteMicrophone(e.enabled))}))};pauseVideo=()=>{this.webcamStream.getTracks().forEach((e=>{"video"===e.kind&&(e.enabled=!e.enabled,this.videoEnabled=e.enabled,this.onPauseVideo(e.enabled))}))};togglePictureInPicture=()=>{"pictureInPictureEnabled"in document||this.remoteVideo.webkitSetPresentationMode?document.pictureInPictureElement?document.exitPictureInPicture().catch((t=>{e(t)})):"inline"===this.remoteVideo.webkitPresentationMode?this.remoteVideo.webkitSetPresentationMode("picture-in-picture"):"picture-in-picture"===this.remoteVideo.webkitPresentationMode?this.remoteVideo.webkitSetPresentationMode("inline"):this.remoteVideo.requestPictureInPicture().catch((e=>{alert("您必须连接到其他人才能进入画中画模式")})):alert("你的浏览器不支持画中画。考虑使用Chrome或Safari。"),this.onTogglePictureInPicture()};switchStream=e=>{const t=e.getVideoTracks()[0];console.log("videoTrack: ",t);this.RTCPeerConnection.getSenders().find((function(e){return e.track.kind===t.kind})).replaceTrack(t)};swap=async()=>{if("camera"===this.mode)try{this.webcamStream=await this.getDisplayMedia(),this.switchStream(this.webcamStream),this.mode="screen"}catch(t){e(t)}else try{this.webcamStream=await this.getUserMedia(),this.switchStream(this.webcamStream),this.mode="camera"}catch(t){e(t)}};handleRecieveWhiteboard(e){"none"===this.WHITEBOARD.whiteboard.style.display&&this.WHITEBOARD.toggleWhiteboard();const t=this.WHITEBOARD.whiteboard.width,i=this.WHITEBOARD.whiteboard.height;this.WHITEBOARD.drawLine(e.x0*t,e.y0*i,e.x1*t,e.y1*i,e.color)}}C.prototype.onMuteMicrophone=e=>{console.log({enabled:e})},C.prototype.onPauseVideo=e=>{console.log({enabled:e})},C.prototype.onTogglePictureInPicture=()=>{console.log("onTogglePictureInPicture")},C.prototype.onRecieveMessage=e=>{console.log("msg: ",e)},C.prototype.onTrack=e=>{console.log("event: ",e)},module.exports=C;