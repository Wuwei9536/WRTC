const lv = document.getElementById("local_video");
console.log("lv: ", lv);

const canvas = document.createElement("canvas");
canvas.width = lv.clientWidth;
canvas.height = lv.clientHeight;
const canvas2d = canvas.getContext("2d");
document.body.appendChild(canvas);

const tempCanvas = document.createElement("canvas");
tempCanvas.width = lv.clientWidth;
tempCanvas.height = lv.clientHeight;
const tempCanvas2d = tempCanvas.getContext("2d");
// document.body.appendChild(tempCanvas);

const maskImg = document.getElementById("maskImg");
async function changeBackground() {
  const net = await bodyPix.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });
  const oriStream = lv.captureStream();
  const [oriVideoTrack] = oriStream.getVideoTracks();
  const oriImageCapture = new ImageCapture(oriVideoTrack);

  async function requestChange() {
    const videoBitmap = await oriImageCapture.grabFrame();
    // tempCanvas2d.drawImage(
    //   videoBitmap,
    //   0,
    //   0,
    //   lv.videoWidth,
    //   lv.videoHeight,
    //   0,
    //   0,
    //   lv.clientWidth,
    //   lv.clientHeight
    // );
    const segmentation = await net.segmentPerson(lv, {
      internalResolution: "medium",
      segmentationThreshold: 0.7,
      maxDetections: 3,
      scoreThreshold: 0.3,
      nmsRadius: 20,
    });
    const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
    const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
    const backgroundDarkeningMask = bodyPix.toMask(
      segmentation,
      foregroundColor,
      backgroundColor
    );

    if (backgroundDarkeningMask !== null) {
      console.log("backgroundDarkeningMask: ", backgroundDarkeningMask);
      // bodyPix.drawMask(canvas, maskImg, backgroundDarkeningMask);
      canvas2d.putImageData(backgroundDarkeningMask, 0, 0);
      canvas2d.globalCompositeOperation = "source-in";
      canvas2d.drawImage(
        maskImg,
        0,
        0,
        maskImg.width,
        maskImg.height,
        0,
        0,
        lv.clientWidth,
        lv.clientHeight
      );
      canvas2d.globalCompositeOperation = "destination-over";
      canvas2d.drawImage(
        videoBitmap,
        0,
        0,
        lv.videoWidth,
        lv.videoHeight,
        0,
        0,
        lv.clientWidth,
        lv.clientHeight
      );
      canvas2d.globalCompositeOperation = "source-over";
      requestAnimationFrame(requestChange);
    } else {
      // offCanvasContext.drawImage(maskImg, 0, 0);
    }
  }

  requestAnimationFrame(requestChange);
  const stream = canvas.captureStream();
  lv.srcObject = stream;
}
window.changeBackground = changeBackground;
