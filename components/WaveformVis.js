import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const WaveformVisualization = ({ waveformData, sampleRate = 44100 }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (waveformData && waveformData.length > 0) {
      console.log('Waveform data stats:', {
        length: waveformData.length,
        min: Math.min(...waveformData),
        max: Math.max(...waveformData),
        average: waveformData.reduce((a, b) => a + b, 0) / waveformData.length
      });
    }
  }, [waveformData]);

  useEffect(() => {
    if (waveformRef.current && waveformData && waveformData.length > 0) {
      console.log('Waveform data received:', waveformData.length, 'samples');

      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      try {
        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: 'rgb(203, 243, 234)',
          progressColor: 'white',
          cursorColor: 'white',
          height: 200,
          responsive: false,
          normalize: false,
          partialRender: false,
          backend: 'WebAudio',
          cursorWidth: 0,
        });

        // Create a mock audio file from the waveform data
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, waveformData.length, sampleRate);
        const channelData = buffer.getChannelData(0);
        waveformData.forEach((sample, index) => {
          channelData[index] = sample;
        });

        console.log('Audio buffer created:', buffer.duration, 'seconds');

        // Convert AudioBuffer to WAV Blob
        const wavBlob = audioBufferToWav(buffer);

        // Load the Blob
        wavesurferRef.current.loadBlob(wavBlob);

        wavesurferRef.current.on('ready', () => {
          console.log('Waveform is ready');
        });

        wavesurferRef.current.on('error', (err) => {
          console.error('Wavesurfer error:', err);
          setError('Error loading waveform: ' + err.message);
        });

      } catch (err) {
        console.error('Error setting up Wavesurfer:', err);
        setError('Error setting up waveform: ' + err.message);
      }
    } else {
      console.log('Waveform ref or data not available', {
        refExists: !!waveformRef.current,
        dataLength: waveformData ? waveformData.length : 0
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [waveformData, sampleRate]);

  // Helper function to convert AudioBuffer to WAV Blob
  function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new ArrayBuffer(length);
    const view = new DataView(out);
    const channels = [];
    let sample, offset = 0, pos = 0;

    // Get max amplitude for normalization
    let maxAmplitude = 0;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      maxAmplitude = Math.max(maxAmplitude, Math.max(...channelData.map(Math.abs)));
    }

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample / maxAmplitude < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: 'audio/wav' });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }


  return (
    <div>
      <div
        ref={waveformRef}
        className='waveformbox'
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default WaveformVisualization;

// Usage in your main component:
// <WaveformVisualization waveformData={waveformData} sampleRate={48000} />
