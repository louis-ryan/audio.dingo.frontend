import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import WaveformVisualization from './WaveformVis';

const VideoProcessor = ({ userSub }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [originalWaveform, setOriginalWaveform] = useState(null);
  const [processedWaveform, setProcessedWaveform] = useState(null);
  const originalCanvasRef = useRef(null);
  const processedCanvasRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (taskId) {
      intervalId = setInterval(checkStatus, 1000);
    }
    return () => clearInterval(intervalId);
  }, [taskId]);

  useEffect(() => {
    if (originalWaveform && originalWaveform.length > 0) {
      drawWaveform(originalCanvasRef.current, originalWaveform);
    }
  }, [originalWaveform]);

  useEffect(() => {
    if (processedWaveform && processedWaveform.length > 0) {
      drawWaveform(processedCanvasRef.current, processedWaveform);
    }
  }, [processedWaveform]);

  const drawWaveform = (canvas, waveformData) => {
    if (!canvas || !waveformData) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const step = Math.ceil(waveformData.length / width);
    const amp = height / 2;

    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      const min = Math.min(...waveformData.slice(i * step, (i + 1) * step));
      const max = Math.max(...waveformData.slice(i * step, (i + 1) * step));
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.stroke();
  };

  const handleFileInput = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setStatus('');
    setDownloadUrl('');
    setIsDownloaded(false);
    setTaskId(null);
    setProgress(0);
    setProcessedWaveform(null);

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await axios.post('http://localhost:5000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setOriginalWaveform(response.data.original_waveform);
      } catch (error) {
        console.error('Input error:', error);
        setStatus(`Error: ${error.response?.data?.error || 'Unknown server error'}`);
      }
    }
  };

  const handleFileProcess = async () => {

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`http://localhost:5000/process/${userSub}/${file.name}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setTaskId(response.data.task_id);
        setStatus('Processing...');
      } catch (error) {
        console.error('Processing error:', error);
        setStatus(`Error: ${error.response?.data?.error || 'Unknown server error'}`);
      }
    }
  };

  const checkStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/status/${taskId}`);
      console.log('Received status response:', response.data);

      if (response.data.state === 'PROGRESS') {
        setProgress(response.data.meta.progress);
        setStatus(`Processing: ${response.data.meta.progress}% complete`);
      } else if (response.data.state === 'SUCCESS') {
        console.log('Task succeeded. Result:', response.data.result);
        if (response.data.result.filename) {
          setDownloadUrl(`http://localhost:5000/download/${response.data.result.filename}`);
          setProcessedWaveform(response.data.result.processed_waveform);
          setTaskId(null);
          setProgress(100);
          setStatus('Processing complete! Click the link below to download.');
        } else {
          console.error('Missing filename in result:', response.data.result);
          setStatus('Processing complete, but no file was returned. Please try again.');
        }
      } else if (response.data.state === 'FAILURE') {
        console.error('Task failed:', response.data);
        setStatus('Processing failed');
        setTaskId(null);
      }
    } catch (error) {
      console.error('Status check error:', error);
      setStatus('Error checking status');
      setTaskId(null);
    }
  };

  const handleDownload = (e) => {
    if (!downloadUrl) {
      e.preventDefault();
      setStatus('Download link is not ready yet. Please wait for processing to complete.');
    } else {
      setIsDownloaded(true);
      setStatus('File downloaded. It is no longer available on the server.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Video Audio Processor</h1>
      <input
        type="file"
        onChange={handleFileInput}
        accept="video/*"
        style={styles.fileInput}
      />



      {originalWaveform && (
        <>
          <h3>Original Audio</h3>

          <WaveformVisualization waveformData={originalWaveform} />

          <button onClick={handleFileProcess} style={styles.downloadLink}>
            Process
          </button>
        </>

      )}

      {processedWaveform && (
        <>
          <h3>Processed Audio</h3>

          <WaveformVisualization waveformData={processedWaveform} />

          {downloadUrl && !isDownloaded && (
            <a
              href={downloadUrl}
              download
              onClick={handleDownload}
              style={styles.downloadLink}
            >
              Download Processed Video (One-time download)
            </a>
          )}
        </>
      )}

    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  fileInput: {
    marginBottom: '20px',
  },
  status: {
    marginTop: '20px',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    margin: '10px 0',
  },
  progressBar: {
    height: '20px',
    backgroundColor: '#4CAF50',
    borderRadius: '5px',
    transition: 'width 0.5s ease-in-out',
  },
  waveform: {
    border: '1px solid #ccc',
  },
  downloadLink: {
    display: 'block',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    width: '100%'
  },
};

export default VideoProcessor;