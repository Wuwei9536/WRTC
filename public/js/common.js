// fade out

function fadeOut(el) {
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= 0.1) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

// fade in

function fadeIn(el, display) {
  el.style.opacity = 0;
  el.style.display = display || "block";

  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += 0.1) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
}

function draggable(el) {
  // TODO 处理style没有的情况
  el.onmousedown = function (e) {
    let IsMousedown = true;
    let LEFT = e.clientX - parseInt(el.style.left);
    let TOP = e.clientY - parseInt(el.style.top);

    document.onmousemove = function (e) {
      if (IsMousedown) {
        el.style.left = e.clientX - LEFT + "px";
        el.style.top = e.clientY - TOP + "px";
      }
    };

    document.onmouseup = function () {
      IsMousedown = false;
    };
  };

  el.ontouchstart = function (e) {
    let IsMousedown = true;
    let LEFT = e.touches[0].clientX - parseInt(el.style.left);
    let TOP = e.touches[0].clientY - parseInt(el.style.top);

    document.ontouchmove = function (e) {
      if (IsMousedown) {
        el.style.left = e.touches[0].clientX - LEFT + "px";
        el.style.top = e.touches[0].clientY - TOP + "px";
      }
    };

    document.ontouchend = function () {
      IsMousedown = false;
    };
  };
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

//使用用户代理获取浏览器的名称
function getBrowserName() {
  if (window.navigator.userAgent.indexOf("MSIE") !== -1) {
    return "MSIE";
  } else if (window.navigator.userAgent.indexOf("Firefox") !== -1) {
    return "Firefox";
  } else if (window.navigator.userAgent.indexOf("Opera") !== -1) {
    return "Opera";
  } else if (window.navigator.userAgent.indexOf("Chrome") !== -1) {
    return "Chrome";
  } else if (window.navigator.userAgent.indexOf("Safari") !== -1) {
    return "Safari";
  }
  return "UnKnown";
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isIos() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}
