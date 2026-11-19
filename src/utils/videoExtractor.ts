/**
 * Client-Side Hardware-Accelerated Video Keyframe Extractor
 * Uses HTML5 <video> and <canvas> to extract decoded video keyframes.
 * Zero external dependencies; works 100% locally and offline in any modern browser.
 */

export interface ExtractedFrame {
  frameNumber: number;
  timestamp: string;
  dataUrl: string; // Base64 JPEG data URL
}

export interface VideoExtractionResult {
  duration: string; // "MM:SS"
  durationSeconds: number;
  resolution: string;
  fps: number;
  frames: ExtractedFrame[];
}

export async function extractVideoFrames(
  file: File,
  targetFrameCount: number = 6
): Promise<VideoExtractionResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    // MUST attach to DOM (hidden offscreen) for Chromium / Edge hardware video decoders to render frames to canvas
    video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:320px;height:180px;opacity:0;pointer-events:none;z-index:-1;';
    document.body.appendChild(video);

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      try {
        if (video.parentNode) {
          document.body.removeChild(video);
        }
        URL.revokeObjectURL(objectUrl);
      } catch (e) {
        // ignore cleanup errors
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error(`Failed to decode video file: ${file.name}`));
    };

    video.onloadeddata = async () => {
      try {
        const durSec = video.duration || 10;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 360;
        
        const mm = Math.floor(durSec / 60);
        const ss = Math.floor(durSec % 60);
        const durationStr = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
        const resolutionStr = `${width}x${height}`;

        const canvas = document.createElement('canvas');
        // Standard forensic analysis scale (640 max width)
        const scale = Math.min(1.0, 640 / width);
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          cleanup();
          reject(new Error("Unable to obtain 2D canvas context"));
          return;
        }

        const frames: ExtractedFrame[] = [];
        const interval = durSec / Math.max(1, targetFrameCount);

        for (let i = 0; i < targetFrameCount; i++) {
          const seekTime = Math.min(durSec - 0.05, Math.max(0.1, i * interval + 0.15));
          
          await new Promise<void>((seekResolve) => {
            let resolved = false;
            const onSeeked = () => {
              if (!resolved) {
                resolved = true;
                video.removeEventListener('seeked', onSeeked);
                // Allow browser compositor to paint the video frame to hardware buffer
                requestAnimationFrame(() => {
                  setTimeout(seekResolve, 60);
                });
              }
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = seekTime;
            // Timeout fallback in case seeked doesn't fire
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                video.removeEventListener('seeked', onSeeked);
                seekResolve();
              }
            }, 500);
          });

          // Draw decoded frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          const frameMm = Math.floor(seekTime / 60);
          const frameSs = Math.floor(seekTime % 60);
          const frameMs = Math.floor((seekTime % 1) * 100);
          const timestampStr = `${String(frameMm).padStart(2, '0')}:${String(frameSs).padStart(2, '0')}.${String(frameMs).padStart(2, '0')}`;

          frames.push({
            frameNumber: i + 1,
            timestamp: timestampStr,
            dataUrl: dataUrl
          });
        }

        cleanup();
        resolve({
          duration: durationStr,
          durationSeconds: durSec,
          resolution: resolutionStr,
          fps: 30,
          frames: frames
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };
  });
}
