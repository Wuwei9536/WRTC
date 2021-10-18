importScripts(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0'
);

const initBodyPix = async () => {
  net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });
  self.postMessage({ type: 'init' });
};
let net = null,
  maskImg = null,
  offCanvas = null,
  offCanvasContext = null,
  offTmpCanvas = null,
  offTmpCanvasContext = null;

initBodyPix();

self.addEventListener('message', async (evt) => {
  const evtData = evt.data;
  console.log('evtData: ', evtData);

  switch (evtData.type) {
    case 'offCanvas':
      offCanvas = evtData.canvas;
      offCanvasContext = offCanvas.getContext('2d');
      offTmpCanvas = new OffscreenCanvas(offCanvas.width, offCanvas.height);
      offTmpCanvasContext = offTmpCanvas.getContext('2d');
      break;
    case 'maskImg':
      maskImg = evtData.maskImgBitmap;
      break;
    case 'videoBitMap':
      if (offCanvasContext === null || net === null || maskImg === null) {
        break;
      }
      const evtBitMap = evtData.bitMap;
      offTmpCanvasContext.drawImage(
        evtBitMap,
        0,
        0,
        evtBitMap.width,
        evtBitMap.height,
        0,
        0,
        offCanvas.width,
        offCanvas.height
      );

      const segmentation = await net.segmentPerson(
        offTmpCanvasContext.getImageData(0, 0, offCanvas.width, offCanvas.height),
        {
          internalResolution: 'medium',
          segmentationThreshold: 0.7,
          maxDetections: 3,
          scoreThreshold: 0.3,
          nmsRadius: 20,
        }
      );
      console.log({ segmentation });
      const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
      const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
      const backgroundDarkeningMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);

      if (!backgroundDarkeningMask) {
        offCanvasContext.drawImage(offTmpCanvas, 0, 0);
        return;
      }
      if (evtData.mode === 'replace') {
        offCanvasContext.putImageData(backgroundDarkeningMask, 0, 0);
        offCanvasContext.globalCompositeOperation = 'source-in';
        offCanvasContext.drawImage(
          maskImg,
          0,
          0,
          maskImg.width,
          maskImg.height,
          0,
          0,
          offCanvas.width,
          offCanvas.height
        );
        offCanvasContext.globalCompositeOperation = 'destination-over';
        offCanvasContext.drawImage(
          evtBitMap,
          0,
          0,
          evtBitMap.width,
          evtBitMap.height,
          0,
          0,
          offCanvas.width,
          offCanvas.height
        );
        offCanvasContext.globalCompositeOperation = 'source-over';
      } else if (evtData.mode === 'virtual') {
        offCanvasContext.putImageData(backgroundDarkeningMask, 0, 0);
        offCanvasContext.globalCompositeOperation = 'source-in';
        offCanvasContext.filter = 'blur(10px)';
        offCanvasContext.drawImage(offTmpCanvas, 0, 0);
        offCanvasContext.globalCompositeOperation = 'destination-over';
        offCanvasContext.filter = 'blur(0px)';
        offCanvasContext.drawImage(
          evtBitMap,
          0,
          0,
          evtBitMap.width,
          evtBitMap.height,
          0,
          0,
          offCanvas.width,
          offCanvas.height
        );
        offCanvasContext.globalCompositeOperation = 'source-over';
      }
      self.postMessage({ type: 'success' });
      break;
    default:
      break;
  }
});
