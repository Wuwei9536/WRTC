import { fadeIn, throttle } from './utils/common';

export default class WHITEBOARD {
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
