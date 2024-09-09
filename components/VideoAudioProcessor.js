import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Audio } from 'react-loader-spinner'
import WaveformVisualization from './WaveformVis';
import FileUploader from './FileUploader';

const VideoProcessor = ({ userSub, getVideos, credits, setCredits }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Init');
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [originalWaveform, setOriginalWaveform] = useState(null);
  const [processedWaveform, setProcessedWaveform] = useState(null);
  const [currentVideoCost, setCurrentVideoCost] = useState(null);

  useEffect(() => {
    let intervalId;
    if (taskId) {
      intervalId = setInterval(checkStatus, 1000);
    }
    return () => clearInterval(intervalId);
  }, [taskId]);

  const fileSizeToCredits = (bytes) => {
    const creditVal = Math.floor(bytes / 150000000)
    if (creditVal === 0) { creditVal = 1 }
    return creditVal
  }

  const patchUserCredits = async (userSub, newCreditsVal) => {
    try {
      const res = await fetch(`api/updateCredits/${userSub}`, {
        method: 'PATCH',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ credits: newCreditsVal })
      })
      const resJSON = await res.json()
      if (resJSON.data) {
        setCredits(resJSON.data.credits)
      } else {
        console.log('There was a problem setting a new credits value')
      }
    } catch (error) {
      console.log("issue patching credits: ", error)
    }
  }

  const handleFileInput = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setStatus('Uploading');
    setDownloadUrl('');
    setIsDownloaded(false);
    setTaskId(null);
    setProgress(0);
    setProcessedWaveform(null);
    setCurrentVideoCost(fileSizeToCredits(selectedFile.size))

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
        setStatus('Original')
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
        setStatus('Processing');
      } else if (response.data.state === 'SUCCESS') {
        if (response.data.result.filename) {
          setDownloadUrl(`http://localhost:5000/download/${response.data.result.filename}`);
          getVideos(userSub)
          setProcessedWaveform(response.data.result.processed_waveform);
          setTaskId(null);
          setProgress(100);
          setStatus('Processing complete! Click the link below to download.');
          patchUserCredits(userSub, credits - fileSizeToCredits(file.size))
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
    <div className='processcontainer'>
      <h1>Video Audio Processor</h1>

      {status === 'Init' && (
        <FileUploader handleFileInput={handleFileInput} />
      )}

      {status === 'Uploading' && (
        <div className='loadercontainer'>
          <div>
            <Audio
              height="80"
              width="80"
              radius="8"
              color="lightgrey"
              ariaLabel="loading"
              wrapperStyle
              wrapperClass
            />
            <h4>Uploading Original Audio</h4>
          </div>
        </div>
      )}

      {status === 'Original' && (
        <>
          <WaveformVisualization waveformData={originalWaveform} />

          <h3>This is your original audio</h3>

          <h4>Processing this video will cost {currentVideoCost} credits</h4>

          <button onClick={handleFileProcess}>
            Process
          </button>
        </>

      )}

      {status === 'Processing' && (
        <h2>Progress {progress}%</h2>
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
            >
              Download Processed Video
            </a>
          )}
        </>
      )}

    </div>
  );
};

const styles = {
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
  }
};

export default VideoProcessor;