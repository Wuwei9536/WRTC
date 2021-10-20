export default class Recorder {
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
