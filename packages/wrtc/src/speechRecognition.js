export default class Speech {
    constructor(options){
        this.speechRecognition = new webkitSpeechRecognition();
        this.speechRecognition.continuous = true;
        this.speechRecognition.lang = "cmn-Hans-CN";
        this.speechRecognition.interimResults = true;
        this.state = "inactive";
        this.speechRecognition.onresult = (event)=>{
            console.log({event});
        }
        this.speechRecognition.onerror = (error)=>{
            console.log('error: ', error);
        }
        this.speechRecognition.onnomatch = (event)=>{
            console.log('event: ', event);
        }
    }

    start(){
        this.speechRecognition.start();
        this.state = 'active';
    }

    stop(){
        this.speechRecognition.stop();
        this.state = 'inactive';
    }

      // 语音识别
  initSpeechRecognition = () => {
    this.SpeechRecognition = new webkitSpeechRecognition();
    this.SpeechRecognition.continuous = true;
    this.SpeechRecognition.lang = 'cmn-Hans-CN';
    this.SpeechRecognition.interimResults = true;
    this.SpeechRecognition.onresult = (event) => {
      console.log({ event });
      const instruct = event.results[0][0].transcript;
      switch (instruct) {
        case '开启麦克风':
        case '关闭麦克风':
          this.muteMicrophone();
          break;
        // case '开启麦克风':
        //   case '关闭麦克风':
        //       this.muteMicrophone()
        //     break;
        default:
          break;
      }
    };
    this.SpeechRecognition.onerror = (error) => {
      console.log('error: ', error);
    };
    this.SpeechRecognition.onnomatch = (event) => {
      console.log('event: ', event);
    };
  };

  stopSpeechRecognition = () => {
    this.SpeechRecognition.stop();
  };
}

