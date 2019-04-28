/**
 * Created by sanchez 
 */
'use strict';

//check the environment
// if (process.env.NODE_ENV !== 'production') {
//     console.log('Looks like we are in development mode!');
// }
import * as dat from 'dat.gui';
// import CSS

import css from '../css/css.css';


//ES6 Module
import 'pixi.js';
import BufferLoader from './entities/BufferLoader.js';


// var player = new Tone.Player({
//     "url": "/assets/media/bgm1.mp3",
//     "loop": true
// }).toMaster();

// var fft = new Tone.Analyser('fft', 64);
// player.fan(fft);
// var fftArray = fft.getValue()


window.AudioContext = (function() {
    return window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();

// Global Variables for Audio
var audioContext;
var audioBuffer;
var sourceNode;
var analyserNode;
var javascriptNode;
var source;
var audioData = null;
var audioPlaying = false;
var sampleSize = 1024; // number of samples to collect before analyzing data
var dataArray; // array to hold time-domain/byte-frequency data
var startedAt;
var pausedAt;
var audioUrl = './assets/media/bgm1.mp3';

function setupAudioNodes() {
    sourceNode = audioContext.createBufferSource();
    analyserNode = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);
    // Create the array for the data values
    dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    // Now connect the nodes together
    sourceNode.connect(audioContext.destination);
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
}

try {
    audioContext = new AudioContext();
} catch (e) {
    alert('Your browser does not support AudioContext!');
    console.error(e);
}

function onError(e) {
    console.log(e);
}

//Load the audio from the URL via Ajax and store it in global variable audioData
//Note that the audio load is asynchronous
var bufferLoader;
function loadSound(urlList) {
    bufferLoader = new BufferLoader(audioContext, urlList, function(bufferlist) {
        audioData = bufferlist[0];
        playSound(audioData);
    })
    bufferLoader.load();

    // var request = new XMLHttpRequest();
    // request.open('GET', url, true);
    // request.responseType = 'arraybuffer';
    // // When loaded, decode the data and play the sound
    // request.onload = function() {
    //     audioContext.decodeAudioData(request.response, function(buffer) {
    //         audioData = buffer;
    //         playSound(audioData);
    //     }, onError);
    // }
    // request.send();
}
//Play the audio and loop until stopped
function playSound(buffer) {
    sourceNode.buffer = buffer;

    if (pausedAt) {
        startedAt = Date.now() - pausedAt;
        sourceNode.start(0, pausedAt / 1000);
    } else {
        startedAt = Date.now();
        sourceNode.start(0); // Play the sound now
    }

    sourceNode.loop = true;
    audioPlaying = true;
}



var audioLoaded = false;
window.h5 = {
    FizzyText: {
        drawBar: false,
        drawWave: true,
        barColor: 0xFFFFFF,
        waveColor: 0xFFFFFF,
        play: function() {
            if (audioPlaying) return;

            // var audio = document.getElementById('audio');
            // audio.play();
            //Set up the audio Analyser, the Source Buffer and javascriptNode
            setupAudioNodes();
            //setup the event handler that is triggered every time enough samples have been collected
            //trigger the audio analysis and draw the results
            javascriptNode.onaudioprocess = function() {

                //draw the display if the audio is playing
                if (audioPlaying == true) {
                    // requestAnimFrame(drawTimeDomain);
                    // console.log(window.h5.ticker)
                    window.h5.ticker.start();

                }
            }
            //Load the Audio the first time through, otherwise play it from the buffer
            if (audioData == null) {
                loadSound([audioUrl]);
            } else {
                playSound(audioData);
            }

            //tone.js
            // player.load('/assets/media/bgm1.mp3',function(){
            //     player.start();
            //     audioLoaded=true
            // })
        },
        pause: function() {
            sourceNode.stop(0);
            audioPlaying = false;
            pausedAt = Date.now() - startedAt;
            // var audio = document.getElementById('audio');
            // audio.pause();
        }
    },
    initGUI: function() {
        var that = this;
        var gui = new dat.GUI();
        var f1 = gui.addFolder('SineWave');

        function setChecked(prop) {
            var n = that.FizzyText[prop];
            if (n) {
                that.FizzyText['drawBar'] = false;
                that.FizzyText['drawWave'] = false;
            }
            that.FizzyText[prop] = n;
        }
        f1.add(that.FizzyText, 'drawWave').listen().onChange(function() {
            setChecked('drawWave')
        });
        f1.addColor(that.FizzyText, 'waveColor');

        var f2 = gui.addFolder('Frequency Bar')
        f2.add(that.FizzyText, 'drawBar').listen().onChange(function() {
            setChecked('drawBar')
        });;
        f2.addColor(that.FizzyText, 'barColor');

        gui.add(that.FizzyText, 'play');
        gui.add(that.FizzyText, 'pause');

    },
    initAudioCanvas: function() {
        var that = this;




        // var analyser = audioCtx.createAnalyser();
        // // analyser.connect(audioCtx.destination);
        // //确定频域的FFT的大小
        // analyser.fftSize = 2048;
        // //fftSize一半，用于可视化的数据量的数量
        // var bufferLength = analyser.frequencyBinCount;
        // //创建无符号字节数组
        // var dataArray = new Uint8Array(bufferLength);
        // var audio = document.getElementById('audio');
        // source = audioCtx.createMediaElementSource(audio);
        // source.connect(analyser);

        // audio.addEventListener('canplaythrough', function() {
        //     audio.removeEventListener('canplaythrough', this);
        //     source = audioCtx.createMediaElementSource(audio);
        //     source.connect(analyser);
        //     analyser.connect(audioCtx.destination);
        //     audioLoaded = true;
        // })



        //当前频域数据
        // analyser.getByteFrequencyData(dataArray)

        //将当前波形，或者时域数据拷贝
        // analyser.getByteTimeDomainData(dataArray);

        //Create a Pixi Application
        var app = new PIXI.Application({ width: 800, height: 600 });
        //Add the canvas that Pixi automatically created for you to the HTML document
        document.getElementById('canvas-wrapper').appendChild(app.view);
        var w = 800;
        var h = 600;
        var graphics = new PIXI.Graphics();

        var basicText = new PIXI.Text('Note: Mobile for now too!!!', { fill: '#FFF' });
        basicText.x = 10;
        basicText.y = 10;

        app.stage.addChild(basicText);


        graphics.clear();

        app.stage.addChild(graphics);

        function drawBar() {

            //tone.js
            // var fftValues = fft.getValue ();
            //get frequency data and put it into the array created above
            //当前频域数据
            analyserNode.getByteFrequencyData(dataArray);
            // console.log(dataArray)
            var bufferLength = analyserNode.frequencyBinCount;

            graphics.clear();
            graphics.beginFill(that.FizzyText.barColor);

            var barWidth = (w / bufferLength) * 10;
            var barHeight = 0;
            var x = 0;

            for (var i = 0; i < bufferLength; i++) {
                //tone.js
                // barHeight = fftValues[i]/255 * h;
                barHeight = dataArray[i];
                graphics.drawRect(x, h / 2 - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }

        }

        function drawWave() {

            //get waveform data and put it into the array created above
            //将当前波形，或者时域数据拷贝
            analyserNode.getByteTimeDomainData(dataArray);

            var bufferLength = analyserNode.frequencyBinCount;
            graphics.clear();
            var sliceWidth = w * 1.0 / bufferLength;
            var x = 0;
            graphics.beginFill();
            graphics.lineStyle(2, that.FizzyText.waveColor, 1);
            // console.log(dataArray)
            for (var i = 0; i < bufferLength; i++) {
                var v = dataArray[i] / 128.0;
                var y = v * h / 2;

                if (i === 0) {
                    // graphics.clear();
                    graphics.moveTo(x, y);
                } else {
                    graphics.lineTo(x, y);
                }
                x += sliceWidth;
            }
            graphics.lineTo(w, h / 2);
            graphics.endFill();
        }

        that.ticker = new PIXI.ticker.Ticker();
        that.ticker.stop();
        that.ticker.add((deltaTime) => {

            if (that.FizzyText.drawWave) {
                drawWave();
                return;
            }
            if (that.FizzyText.drawBar) {
                drawBar();
                return;
            }
        });
        // ticker.start();
        // audio.play();
        // audio.addEventListener('play', function() {
        //     console.log('play');
        //     ticker.start();
        // })
        // audio.addEventListener('pause', function() {
        //     console.log('pause');
        //     // ticker.stop();
        // })

    },
    isPc: function() {
        var userAgentInfo = navigator.userAgent;
        var Agents = new Array('Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod');
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
        }
        return flag;
    },
    rootResize: function() {
        var wFsize;

        //iphone6/6s/7/8 orientation=portrait screen.width=750px screen.height=1334px / WeChat window.innerWidth=750px window.innerHeight=1206px 
        var wWidth = (window.screen.width > 0) ? (window.innerWidth >= window.screen.width || window.innerWidth == 0) ? screen.width :
            window.innerWidth : window.innerWidth;
        var wHeight = (window.screen.height > 0) ? (window.innerHeight >= window.screen.height || window.innerHeight == 0) ?
            window.screen.height : window.innerHeight : window.innerHeight;
        // var wWidth = window.innerWidth;
        // var wHeight = window.innerHeight;

        if (wWidth > wHeight) {
            wFsize = wHeight / 750 * 100;
        } else {
            wFsize = wWidth / 750 * 100;
        }
        document.getElementsByTagName('html')[0].style.fontSize = wFsize + 'px';
    },
    eventInit: function() {
        var that = this;
        document.addEventListener('touchstart', function(e) {}, { passive: false });
        document.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
        return that;
    },
    cssInit: function() {
        var that = this;
        var noChangeCountToEnd = 100,
            noEndTimeout = 1000;
        that.rootResize();
        window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', function() {
            var interval,
                timeout,
                end,
                lastInnerWidth,
                lastInnerHeight,
                noChangeCount;
            end = function() {
                // "orientationchangeend"
                clearInterval(interval);
                clearTimeout(timeout);
                interval = null;
                timeout = null;
                that.rootResize();
            };
            interval = setInterval(function() {
                if (window.innerWidth === lastInnerWidth && window.innerHeight === lastInnerHeight) {
                    noChangeCount++;
                    if (noChangeCount === noChangeCountToEnd) {
                        // The interval resolved the issue first.
                        end();
                    }
                } else {
                    lastInnerWidth = window.innerWidth;
                    lastInnerHeight = window.innerHeight;
                    noChangeCount = 0;
                }
            });
            timeout = setTimeout(function() {
                // The timeout happened first.
                end();
            }, noEndTimeout);
        });

        return that;
    },
    init: function() {
        var that = this;
        that.cssInit().eventInit();
        that.initGUI()
        that.initAudioCanvas();
    }
};
window.onload = function() {
    window.h5.init();
};

//Stats JavaScript Performance Monitor

//import Stats from 'stats.js';
//showStats();
// function showStats() {
//     var stats = new Stats();
//     stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//     var fs = document.createElement('div');
//     fs.style.position = 'absolute';
//     fs.style.left = 0;
//     fs.style.top = 0;
//     fs.style.zIndex = 999;
//     fs.appendChild(stats.domElement);
//     document.body.appendChild(fs);

//     function animate() {
//         stats.begin();
//         // monitored code goes here
//         stats.end();
//         requestAnimationFrame(animate);
//     }
//     requestAnimationFrame(animate);
// }