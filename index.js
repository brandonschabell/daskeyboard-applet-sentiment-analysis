const InputEvent = require('input-event');
const Sentiment = require('sentiment');
const Color = require('color')

// Library to send signal to Q keyboards
const q = require('daskeyboard-applet');

const sentiment = new Sentiment();

const logger = q.logger;

logger.info('logger started');

const keyDictionary = {
    16: 'q',
    17: 'w',
    18: 'e',
    19: 'r',
    20: 't',
    21: 'y',
    22: 'u',
    23: 'i',
    24: 'o',
    25: 'p',
    30: 'a',
    31: 's',
    32: 'd',
    33: 'f',
    34: 'g',
    35: 'h',
    36: 'j',
    37: 'k',
    38: 'l',
    44: 'z',
    45: 'x',
    46: 'c',
    47: 'v',
    48: 'b',
    49: 'n',
    50: 'm',
    57: ' ', // Spacebar
    28: ' ', // Enter
    14: 'backspace'
};

var keyBuffer = [];

class SentimentAnalysis extends q.DesktopApp {
    constructor() {
        super();
        this.pollingInterval = 3000; // run every 3 seconds
        const input = new InputEvent('/dev/input/by-id/usb-Das_Keyboard_5Q_RGB_Mechanical_Keyboard_0000000000000000-event-kbd');
        const keyboard = new InputEvent.Keyboard(input);
        keyboard.on('keypress', function(data) {
            var letter = keyDictionary[data.code]
            if (letter != undefined) {
                if (letter === 'backspace') {
                    if (keyBuffer.length > 0) {
                        keyBuffer.pop()
                    }
                } else {
                    keyBuffer.push(letter)
                    while (keyBuffer.length > 50) {
                        keyBuffer.shift()
                    }
                }
            }
        });
    }

    // 

    // call this function every pollingInterval
    async run() {
        var result = sentiment.analyze(keyBuffer.join(""));
        return new q.Signal({
            points: [this.generateColor(result.comparative)],
            name: "Sentiment Score",
            message: "Sentiment Score: " + result.comparative,
            isMuted: true, // don't flash the Q button on each signal
        });
    }

    generateColor(score) {
        let color =[];

        var red = 0;
        var green = 0;
        if (score < 0) {
            red = score * -255 * 4
            green = 255 * (0.25 + score)
        } else {
            red = 255 * (0.25 - score)
            green = 255
        }
        if (red > 255) {
            red = 255
        } else if (red < 0) {
            red = 0
        }
        if (green < 0) {
            green = 0
        }
        color.push(new q.Point(Color.rgb(red, green, 0).hex()))

        return color;
    }

}

module.exports = {
    SentimentAnalysis: SentimentAnalysis
};

const applet = new SentimentAnalysis();