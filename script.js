const intro = document.getElementById('intro');
const site = document.getElementById('site');
const creationCard = document.getElementById('creationCard');
const breachCard = document.getElementById('breachCard');
const blackout = document.getElementById('blackout');
const enterSite = document.getElementById('enterSite');
const soundToggle = document.getElementById('soundToggle');

let audioCtx = null;
let soundOn = false;
let ambient = null;

function ensureAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
}

function makeNoise(duration=0.18, gainValue=0.12, highpass=500){
  if(!soundOn) return;
  ensureAudio();
  const length = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<length;i++) data[i] = (Math.random()*2-1) * (1-i/length);
  const src = audioCtx.createBufferSource(); src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter(); filter.type='highpass'; filter.frequency.value=highpass;
  const gain = audioCtx.createGain(); gain.gain.value=gainValue;
  src.connect(filter).connect(gain).connect(audioCtx.destination); src.start();
}

function screamBurst(){
  if(!soundOn) return;
  ensureAudio();
  const now = audioCtx.currentTime;
  [190,253,337,499].forEach((f,i)=>{
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = i%2 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(f*1.8, now+.5);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(.07/(i+1), now+.03);
    gain.gain.exponentialRampToValueAtTime(.0001, now+.7);
    osc.connect(gain).connect(audioCtx.destination); osc.start(now); osc.stop(now+.72);
  });
  makeNoise(.7,.18,1100);
}

function startAmbient(){
  if(!soundOn || ambient) return;
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type='sine'; osc.frequency.value=48; gain.gain.value=.015;
  osc.connect(gain).connect(audioCtx.destination); osc.start();
  ambient={osc,gain};
}
function stopAmbient(){ if(ambient){ambient.osc.stop(); ambient=null;} }

soundToggle.addEventListener('click',()=>{
  soundOn=!soundOn;
  soundToggle.textContent=`SOUND: ${soundOn?'ON':'OFF'}`;
  if(soundOn){ startAmbient(); makeNoise(.1,.08,900); } else stopAmbient();
});

document.body.classList.add('locked');
setTimeout(()=>creationCard.classList.add('visible'),550);
setTimeout(()=>{
  creationCard.classList.remove('visible');
  blackout.classList.add('flash');
  screamBurst();
  intro.classList.add('glitch');
},4300);
setTimeout(()=>{
  intro.classList.remove('glitch');
  breachCard.classList.add('visible');
  makeNoise(.2,.08,700);
},4950);
setTimeout(()=>enterSite.classList.add('visible'),8200);

enterSite.addEventListener('click',()=>{
  makeNoise(.12,.07,700);
  intro.style.transition='opacity .45s ease';
  intro.style.opacity='0';
  setTimeout(()=>{
    intro.remove(); site.classList.remove('hidden'); document.body.classList.remove('locked');
  },450);
});

const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*';
function scramble(el){
  const value=el.dataset.value||el.textContent; let frame=0;
  const timer=setInterval(()=>{
    el.textContent=value.split('').map((ch,i)=> i<frame/2 ? ch : chars[Math.floor(Math.random()*chars.length)]).join('');
    frame++; if(frame>value.length*2){clearInterval(timer);el.textContent=value;}
  },45);
}
setInterval(()=>document.querySelectorAll('.scramble').forEach(scramble),4200);
