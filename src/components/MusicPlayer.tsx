import { useState, useEffect, useRef } from 'react';

// 播放列表 - 可以添加更多音乐
const playlist = [
  { title: 'Mystic Cards in Sunlight', src: 'https://media.femres.org/music/ambient-1.mp3' },
  { title: 'Mystic Carousel Spread', src: 'https://media.femres.org/music/ambient-2.mp3' },
  { title: 'Sisterhood in Four Parts', src: 'https://media.femres.org/music/ambient-3.mp3' },
  { title: 'Mystic Cards II', src: 'https://media.femres.org/music/ambient-4.mp3' },
  { title: 'Sisterhood II', src: 'https://media.femres.org/music/ambient-5.mp3' },
];

interface MusicPlayerProps {
  className?: string;
}

export default function MusicPlayer({ className = '' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio(playlist[currentTrack].src);
    audioRef.current.volume = 0.3;
    audioRef.current.loop = false;

    // 当前曲目结束时自动播放下一首
    audioRef.current.addEventListener('ended', handleNext);

    // 音频可以播放时设置就绪状态
    audioRef.current.addEventListener('canplaythrough', () => {
      setIsReady(true);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleNext);
      }
    };
  }, []);

  // 切换曲目时更新音频源
  useEffect(() => {
    if (audioRef.current && hasInteracted) {
      const wasPlaying = isPlaying;
      audioRef.current.src = playlist[currentTrack].src;
      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack]);

  // 监听用户首次交互
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        // 首次交互时自动开始播放
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(console.error);
        }
      }
    };

    // 监听各种用户交互事件
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [hasInteracted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  return (
    <div className={`music-player ${className}`}>
      <div className="music-player-container">
        {/* 播放/暂停按钮 */}
        <button
          onClick={togglePlay}
          className="music-btn play-btn"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* 下一首按钮 */}
        <button
          onClick={handleNext}
          className="music-btn next-btn"
          aria-label="Next track"
          title="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
            <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
          </svg>
        </button>

        {/* 音乐波形动画指示器 */}
        {isPlaying && (
          <div className="music-visualizer">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        )}
      </div>

      <style>{`
        .music-player {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .music-player-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 8px 12px;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .dark .music-player-container {
          background: rgba(31, 41, 55, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .music-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .music-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
        }

        .music-btn:active {
          transform: scale(0.95);
        }

        .music-btn .icon {
          width: 18px;
          height: 18px;
        }

        .next-btn {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
        }

        .next-btn .icon {
          width: 14px;
          height: 14px;
        }

        .music-visualizer {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 20px;
          padding-left: 8px;
        }

        .music-visualizer .bar {
          width: 3px;
          background: linear-gradient(to top, #ec4899, #8b5cf6);
          border-radius: 2px;
          animation: musicBar 0.5s ease-in-out infinite alternate;
        }

        .music-visualizer .bar:nth-child(1) {
          height: 8px;
          animation-delay: 0s;
        }

        .music-visualizer .bar:nth-child(2) {
          height: 16px;
          animation-delay: 0.2s;
        }

        .music-visualizer .bar:nth-child(3) {
          height: 12px;
          animation-delay: 0.4s;
        }

        @keyframes musicBar {
          0% {
            transform: scaleY(0.3);
          }
          100% {
            transform: scaleY(1);
          }
        }

        @media (max-width: 768px) {
          .music-player {
            bottom: 80px;
            right: 12px;
          }

          .music-player-container {
            padding: 6px 10px;
          }

          .music-btn {
            width: 32px;
            height: 32px;
          }

          .next-btn {
            width: 26px;
            height: 26px;
          }
        }
      `}</style>
    </div>
  );
}
