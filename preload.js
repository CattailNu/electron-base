/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

var JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);
require('jzz-synth-tiny')(JZZ);


let player;
let playing = false;

// Register Web Audio synth to have at least one MIDI-Out port
JZZ.synth.Tiny.register('Web Audio');

require('jazz-midi-electron')().then(function() {
  var midiout = JZZ.gui.SelectMidiOut({ at: 'selectmidiout', none: 'No MIDI Out' });
  player.connect(midiout);
  // Open the default MIDI Out port:
  midiout.select();
});


function load(data, title) {
  console.log('load data');
  try {
    player = JZZ.MIDI.SMF(data).player();
    // console.log(player);
    player.connect(midiout);
    player.onEnd = function() {
      playing = false;
      console.log('ending');
    }
    playing = true;
    player.play();
    console.log('should play')
  }
  catch (e) {
    console.log(e);
  }
}

function midiPlay(f) {
  /*
  var data = "TVRoZAAAAAYAAAABAGBNVHJrAAADKQD/ASMuL3R0LnBsIGF0IFdlZCBOb3YgMzAgMDk6MzM6MTAgMjAxNgD/UQMDDUCDAJkpcAArcBiJKwAAmSpwGIkqADApAGCZKWAYKnAYiSoAMCkAYJkpcAArcBiJKwAAmSpwGIkqADApAGCZKWAYKnAYiSoAMCkAYJkncBiJJwAAmSdwGIknAIJQmSdwGIknAACZJ3AYiScAglCZKXAAK3AAJ3AYiSsAAJkqcACJJwAAmSdwGIkqAAAnADApAGCZKWAYKnAYiSoAMCkAYJkpcAArcAAncBiJKwAAmSpwAIknAACZJ3AYiSoAACcAMCkAYJkpYBgqcBiJKgAwKQBgmSdwGIknAACZJ3AYiScAglCZJ3AYiScAAJkncBiJJwCCUJkpcAArcAAncBiJKwAAmSpwAIknAACZJ3AYiSoAACcAMCkAYJkpYBgqcBiJKgAwKQBgmSlwACtwACdwGIkrAACZKnAAiScAAJkncBiJKgAAJwAwKQBgmSlgGCpwGIkqADApAGCZJ3AYiScAAJkncBiJJwCCUJkncBiJJwAAmSdwGIknAIJQmSlwACtwACdwGIkrAACZKnAAiScAAJkncBiJKgAAJwAwKQBgmSlgGCpwGIkqADApAGCZKXAAK3AAJ3AYiSsAAJkqcACJJwAAmSdwGIkqAAAnADApAGCZKWAYKnAYiSoAMCkAYJkncBiJJwAAmSdwGIknAIJQmSdwGIknAACZJ3AYiScAglCZKXAAK3AAJ3AYiSsAAJkqcACJJwAAmSdwGIkqAAAnADApAGCZKWAYKnAYiSoAMCkAYJkpcAArcAAncBiJKwAAmSpwAIknAACZJ3AYiSoAACcAMCkAYJkpYBgqcBiJKgAwKQBgmSdwGIknAACZJ3AYiScAglCZJ3AYiScAAJkncBiJJwCCUJkpcAArcAAncBiJKwAAmSpwAIknAACZJ3AYiSoAACcAMCkAYJkpYBgqcBiJKgAwKQBgmSlwACtwACdwGIkrAACZKnAAiScAAJkncBiJKgAAJwAwKQBgmSlgGCpwGIkqADApAGCZJ3AYiScAAJkncBiJJwAA/y8A";
  load(JZZ.lib.fromBase64(data), 'Base64 data');
  */

  var data = fs.readFileSync('/Users/tford/gui/base/example.midi', 'binary');
  load(data,'title');

}



window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["getData"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["fileData"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);