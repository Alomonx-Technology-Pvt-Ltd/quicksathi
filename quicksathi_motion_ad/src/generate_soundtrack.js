// quicksathi_motion_ad/src/generate_soundtrack.js
// Procedural 30-second high-energy startup ad soundtrack generator (48kHz 16-bit Stereo PCM WAV)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 48000;
const DURATION = 30.0;
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);
const NUM_CHANNELS = 2;

// Output buffers for Left and Right channels (floating point -1.0 to 1.0)
const leftChannel = new Float32Array(TOTAL_SAMPLES);
const rightChannel = new Float32Array(TOTAL_SAMPLES);

console.log(`Generating 30.0s procedural soundtrack at ${SAMPLE_RATE}Hz...`);

// Helper: Mix audio into buffer
function mix(channel, startSec, durationSec, sampleFn) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalIdx = Math.floor(durationSec * SAMPLE_RATE);
  for (let i = 0; i < totalIdx; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;
    const t = i / SAMPLE_RATE;
    channel[idx] += sampleFn(t, i);
  }
}

// 1. Kick Drum (Punchy 808 style pitch-dropped sine wave)
function addKick(time, intensity = 1.0) {
  const dur = 0.45;
  const kickFn = (t) => {
    const env = Math.exp(-t * 12.0) * intensity;
    const freq = 45 + 130 * Math.exp(-t * 35.0);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.85;
  };
  mix(leftChannel, time, dur, kickFn);
  mix(rightChannel, time, dur, kickFn);
}

// 2. Sub Drop (Massive cinematic bass drop)
function addSubDrop(time, duration = 2.5, intensity = 1.0) {
  const subFn = (t) => {
    const env = Math.exp(-t * 1.5) * intensity;
    const freq = 35 + 65 * Math.exp(-t * 2.2);
    return Math.sin(2 * Math.PI * freq * t) * env * 0.9;
  };
  mix(leftChannel, time, duration, subFn);
  mix(rightChannel, time, duration, subFn);
}

// 3. Hi-Hat / Shaker (Crisp noise burst)
function addHiHat(time, isAccent = false) {
  const dur = 0.06;
  const hatFn = (t) => {
    const env = Math.exp(-t * 70.0);
    const noise = (Math.random() * 2 - 1) * 0.25;
    return noise * env * (isAccent ? 1.0 : 0.6);
  };
  mix(leftChannel, time, dur, hatFn);
  mix(rightChannel, time, dur, hatFn);
}

// 4. Snare / Clapper
function addSnare(time, intensity = 0.8) {
  const dur = 0.25;
  const snareFn = (t) => {
    const noiseEnv = Math.exp(-t * 25.0) * intensity * 0.5;
    const noise = (Math.random() * 2 - 1) * noiseEnv;
    const toneEnv = Math.exp(-t * 30.0) * intensity * 0.5;
    const tone = Math.sin(2 * Math.PI * 180 * t) * toneEnv;
    return noise + tone;
  };
  mix(leftChannel, time, dur, snareFn);
  mix(rightChannel, time, dur, snareFn);
}

// 5. Digital UI Chime / Bell (Sparkling tech sound)
function addChime(time, freq = 880, pan = 0.0) {
  const dur = 0.8;
  const chimeFn = (t) => {
    const env = Math.exp(-t * 5.0) * 0.35;
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = Math.sin(2 * Math.PI * freq * 2.01 * t) * 0.4;
    const s3 = Math.sin(2 * Math.PI * freq * 3.02 * t) * 0.15;
    return (s1 + s2 + s3) * env;
  };
  const leftPan = 0.5 - pan * 0.5;
  const rightPan = 0.5 + pan * 0.5;
  mix(leftChannel, time, dur, (t) => chimeFn(t) * leftPan);
  mix(rightChannel, time, dur, (t) => chimeFn(t) * rightPan);
}

// 6. Riser / Transition Whoosh
function addRiser(time, duration = 2.0) {
  const riserFn = (t) => {
    const progress = t / duration;
    const env = Math.pow(progress, 2.5) * 0.4;
    const freq = 120 + Math.pow(progress, 3) * 1200;
    const tone = Math.sin(2 * Math.PI * freq * t);
    const noise = (Math.random() * 2 - 1) * progress * 0.3;
    return (tone + noise) * env;
  };
  mix(leftChannel, time, duration, riserFn);
  mix(rightChannel, time, duration, riserFn);
}

// 7. Atmospheric Synth Pad / Bass Note (Harmonic rich saw/triangle)
function addSynthChord(time, duration, freqs, volume = 0.25) {
  const synthFn = (t) => {
    // Attack-Decay-Sustain-Release envelope
    let env = 1.0;
    if (t < 0.2) env = t / 0.2;
    else if (t > duration - 0.4) env = Math.max(0, (duration - t) / 0.4);
    
    let sum = 0;
    freqs.forEach((f, idx) => {
      // slight detuning for rich stereo unison
      const detuneL = 1.0 + (idx % 2 === 0 ? 0.002 : -0.002);
      const s1 = Math.sin(2 * Math.PI * f * detuneL * t);
      const s2 = Math.sin(2 * Math.PI * f * 2 * t) * 0.3;
      sum += (s1 + s2);
    });
    return (sum / freqs.length) * env * volume;
  };
  mix(leftChannel, time, duration, synthFn);
  mix(rightChannel, time, duration, synthFn);
}

// ── COMPOSING THE 30-SECOND TRACK ──

// Section 1: 0.0s - 5.0s (The Tension & Curiosity)
// Low mysterious drone in F minor (F2: 87.31Hz, C3: 130.81Hz)
addSynthChord(0.0, 4.8, [87.31, 130.81], 0.3);
// Periodic ticking clock (urgency)
for (let t = 0.5; t < 4.5; t += 0.5) {
  addChime(t, 1200, (t % 1.0 === 0) ? -0.3 : 0.3);
}
// Scene 1 Build-up riser into the big drop
addRiser(3.0, 1.8);

// Sudden cut at 4.8s, then Scene 2 BIG IMPACT DROP at 5.0s!
addSubDrop(5.0, 3.5, 1.2);
addKick(5.0, 1.3);
addChime(5.0, 523.25, 0); // High C
addChime(5.15, 659.25, 0.4); // E
addChime(5.3, 783.99, -0.4); // G

// Section 2: 5.0s - 11.0s (The Reveal - Groovy Driving Tech Beat)
// 120 BPM: beats at every 0.5s
const chordProgression = [
  { time: 5.0, dur: 3.0, freqs: [174.61, 220.0, 261.63, 349.23] }, // F Maj / D Min
  { time: 8.0, dur: 3.0, freqs: [196.0, 246.94, 293.66, 392.0] },  // G Maj
  { time: 11.0, dur: 3.0, freqs: [130.81, 164.81, 196.0, 261.63] }, // C Maj
  { time: 14.0, dur: 3.0, freqs: [146.83, 174.61, 220.0, 293.66] }, // D Min
  { time: 17.0, dur: 3.0, freqs: [174.61, 220.0, 261.63, 349.23] }, // F Maj
  { time: 20.0, dur: 3.0, freqs: [196.0, 246.94, 293.66, 392.0] },  // G Maj
  { time: 23.0, dur: 4.0, freqs: [220.0, 261.63, 329.63, 440.0] },  // A Min / Energetic Rise
  { time: 27.0, dur: 3.0, freqs: [130.81, 164.81, 196.0, 261.63, 523.25] }, // Grand C Maj Climax
];

chordProgression.forEach(c => addSynthChord(c.time, c.dur, c.freqs, 0.28));

// Driving Beat from 5.0s to 27.0s
for (let t = 5.0; t < 27.0; t += 0.5) {
  const beatNum = Math.round((t - 5.0) / 0.5) % 4; // 0, 1, 2, 3
  
  // Kick on 1 and 3 (every 1.0s) + syncopations
  if (beatNum === 0 || beatNum === 2) {
    addKick(t, 1.0);
  }
  // Snare / Clapper on 2 and 4
  if (beatNum === 1 || beatNum === 3) {
    addSnare(t, 0.85);
  }
  
  // Hi-hats on 8th notes and 16th notes
  addHiHat(t, beatNum === 0);
  addHiHat(t + 0.25, false);

  // Syncopated melodic bass pulses
  if (t >= 11.0 && t <= 26.5) {
    const bassFreq = 65.41; // C2
    mix(leftChannel, t + 0.125, 0.2, (tau) => Math.sin(2 * Math.PI * bassFreq * tau) * Math.exp(-tau * 10) * 0.35);
    mix(rightChannel, t + 0.125, 0.2, (tau) => Math.sin(2 * Math.PI * bassFreq * tau) * Math.exp(-tau * 10) * 0.35);
  }
}

// Scene Transition Accents:
// Transition to Scene 3 (11.0s):
addRiser(9.5, 1.5);
addChime(11.0, 659.25, -0.3);
addChime(11.15, 880.0, 0.3);

// Transition to Scene 4 (17.0s):
addRiser(15.5, 1.5);
addSubDrop(17.0, 2.0, 0.8);
addChime(17.0, 783.99, 0.2);

// Transition to Scene 5 (23.0s):
addRiser(21.5, 1.5);
// Snare build roll into climax (24.0s - 27.0s)
for (let t = 24.0; t < 27.0; t += 0.25) {
  const progress = (t - 24.0) / 3.0;
  addSnare(t, 0.4 + progress * 0.6);
  addHiHat(t + 0.125, true);
}
addRiser(24.5, 2.5);

// Grand Finale Drop (27.0s - 30.0s):
addSubDrop(27.0, 3.0, 1.3);
addKick(27.0, 1.4);
addChime(27.0, 1046.5, 0); // High C6
addChime(27.2, 1318.5, 0.3);
addChime(27.4, 1567.98, -0.3);

// Master Soft Limiter & Normalization
let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  maxPeak = Math.max(maxPeak, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
}
console.log(`Peak audio amplitude: ${maxPeak.toFixed(3)}`);
const normFactor = maxPeak > 0 ? (0.92 / maxPeak) : 1.0;

// Convert to 16-bit PCM WAV format
const wavHeaderSize = 44;
const byteLength = TOTAL_SAMPLES * NUM_CHANNELS * 2;
const buffer = Buffer.alloc(wavHeaderSize + byteLength);

// RIFF chunk descriptor
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + byteLength, 4);
buffer.write('WAVE', 8);

// fmt sub-chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
buffer.writeUInt16LE(NUM_CHANNELS, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * 2, 28); // byte rate
buffer.writeUInt16LE(NUM_CHANNELS * 2, 32); // block align
buffer.writeUInt16LE(16, 34); // bits per sample

// data sub-chunk
buffer.write('data', 36);
buffer.writeUInt32LE(byteLength, 40);

// Write interleaved 16-bit PCM samples with soft knee curve
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  // Soft saturation (tanh)
  const l = Math.tanh(leftChannel[i] * normFactor);
  const r = Math.tanh(rightChannel[i] * normFactor);

  const intL = Math.max(-32768, Math.min(32767, Math.floor(l * 32767)));
  const intR = Math.max(-32768, Math.min(32767, Math.floor(r * 32767)));

  buffer.writeInt16LE(intL, wavHeaderSize + i * 4);
  buffer.writeInt16LE(intR, wavHeaderSize + i * 4 + 2);
}

const outPath = path.join(__dirname, '..', 'assets', 'soundtrack_30s.wav');
fs.writeFileSync(outPath, buffer);
console.log(`Audio soundtrack successfully written to: ${outPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
