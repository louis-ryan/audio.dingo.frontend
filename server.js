import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoAudioProcessor = () => {
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const videoInputRef = useRef(null);
  const ffmpegRef = useRef(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        ffmpegRef.current = new FFmpeg();
        ffmpegRef.current.on('log', ({ message }) => addLog('FFmpeg: ' + message));
        ffmpegRef.current.on('progress', ({ ratio }) => setProgress(Math.round(ratio * 100)));
        
        // Load FFmpeg
        await ffmpegRef.current.load({
          coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
          wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
        });
        
        setIsFFmpegLoaded(true);
        addLog('FFmpeg loaded successfully');
      } catch (error) {
        addLog('Error loading FFmpeg: ' + error.message);
        setStatus('Error loading FFmpeg. Please refresh the page and try again.');
      }
    };
    loadFFmpeg();
  }, []);

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, message]);
    console.log(message);
  };

  const processVideo = async () => {
    if (!isFFmpegLoaded) {
      addLog('FFmpeg is not loaded yet. Please wait and try again.');
      return;
    }

    const file = videoInputRef.current.files[0];
    if (!file) {
      addLog('Please select a video file.');
      return;
    }

    setStatus('Processing...');
    setDownloadUrl('');
    setProgress(0);
    setLogs([]);

    try {
      addLog('Starting video processing');
      
      // Write the input file to FFmpeg's virtual file system
      await ffmpegRef.current.writeFile('input.mp4', await fetchFile(file));
      
      // Run FFmpeg command
      await ffmpegRef.current.exec(['-i', 'input.mp4', '-c:v', 'copy', '-af', 'acompressor=threshold=-20dB:ratio=4:attack=5:release=50', 'output.mp4']);
      
      // Read the output file
      const data = await ffmpegRef.current.readFile('output.mp4');
      
      // Create a download URL
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      setDownloadUrl(url);
      
      setStatus('Processing complete! Click the link below to download.');
      setProgress(100);
    } catch (error) {
      addLog('Error during processing: ' + error.message);
      setStatus('Processing failed. See error log.');
    }
  };

  return (
    <div className="video-processor">
      <h1>Video Audio Processor</h1>
      <input 
        type="file" 
        ref={videoInputRef} 
        accept="video/*" 
        disabled={!isFFmpegLoaded}
      />
      <button onClick={processVideo} disabled={!isFFmpegLoaded}>
        Process Video
      </button>
      {status && (
        <div className="status">
          <h2>Status</h2>
          <p>{status}</p>
        </div>
      )}
      {progress > 0 && progress < 100 && (
        <div className="progress-bar">
          <div className="progress-bar-inner" style={{width: `${progress}%`}}></div>
        </div>
      )}
      {downloadUrl && (
        <a 
          href={downloadUrl} 
          download="processed_video.mp4" 
          className="download-link"
        >
          Download Processed Video (MP4)
        </a>
      )}
      <div className="logs">
        <h2>Processing Logs</h2>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default VideoAudioProcessor;