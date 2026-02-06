import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Maximize,
  Filter,
  User,
  Globe,
  Clock,
  MousePointer,
  Eye
} from 'lucide-react';

interface SessionRecording {
  id: string;
  userId: string;
  duration: number; // seconds
  timestamp: Date;
  device: 'desktop' | 'tablet' | 'mobile';
  location: string;
  browser: string;
  pageViews: number;
  interactions: number;
  hasErrors: boolean;
  converted: boolean;
}

export function SessionRecordings() {
  const [selectedSession, setSelectedSession] = useState<SessionRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [filter, setFilter] = useState<'all' | 'converted' | 'errors' | 'long'>('all');

  const recordings: SessionRecording[] = [
    {
      id: '1',
      userId: 'user_abc123',
      duration: 245,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      device: 'desktop',
      location: 'New York, US',
      browser: 'Chrome',
      pageViews: 8,
      interactions: 24,
      hasErrors: false,
      converted: true,
    },
    {
      id: '2',
      userId: 'user_def456',
      duration: 128,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      device: 'mobile',
      location: 'London, UK',
      browser: 'Safari',
      pageViews: 5,
      interactions: 12,
      hasErrors: true,
      converted: false,
    },
    {
      id: '3',
      userId: 'user_ghi789',
      duration: 456,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      device: 'tablet',
      location: 'Tokyo, JP',
      browser: 'Firefox',
      pageViews: 12,
      interactions: 38,
      hasErrors: false,
      converted: true,
    },
    {
      id: '4',
      userId: 'user_jkl012',
      duration: 89,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      device: 'desktop',
      location: 'Paris, FR',
      browser: 'Chrome',
      pageViews: 3,
      interactions: 7,
      hasErrors: false,
      converted: false,
    },
  ];

  const filteredRecordings = recordings.filter((r) => {
    if (filter === 'converted') return r.converted;
    if (filter === 'errors') return r.hasErrors;
    if (filter === 'long') return r.duration > 180;
    return true;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In real implementation, this would control video playback
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    setCurrentTime(time);
    // In real implementation, this would seek the video
  };

  return (
    <div className="space-y-6">
      {/* Recordings List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Session Recordings</h3>
            <p className="text-sm text-muted-foreground">
              {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
            >
              <option value="all">All Sessions</option>
              <option value="converted">Converted</option>
              <option value="errors">With Errors</option>
              <option value="long">Long Sessions (3+ min)</option>
            </select>
          </div>
        </div>

        {/* Recording Cards */}
        <div className="space-y-3">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              onClick={() => setSelectedSession(recording)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedSession?.id === recording.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Play Icon */}
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Play className="h-6 w-6 text-primary" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">Session {recording.id}</p>
                    {recording.converted && (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded">
                        Converted
                      </span>
                    )}
                    {recording.hasErrors && (
                      <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded">
                        Errors
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {recording.userId.slice(0, 12)}...
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(recording.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {recording.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {recording.pageViews} pages
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3" />
                      {recording.interactions} clicks
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-sm text-muted-foreground text-right">
                  {formatTimestamp(recording.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Player */}
      {selectedSession && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-lg">Session Replay</h3>
            <p className="text-sm text-muted-foreground">
              Session {selectedSession.id} • {selectedSession.location}
            </p>
          </div>

          {/* Video Preview Area */}
          <div className="mb-4 bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <div className="relative h-full flex items-center justify-center">
              {/* Mock browser viewport */}
              <div className="w-full h-full bg-white p-8">
                <div className="mb-6 h-12 bg-gray-200 rounded animate-pulse" />
                <div className="mb-4 h-8 w-3/4 bg-gray-300 rounded animate-pulse" />
                <div className="mb-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="mb-4 h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="mb-6 h-32 bg-gray-300 rounded animate-pulse" />
                
                {/* Simulated cursor */}
                <div
                  className="absolute h-6 w-6 pointer-events-none"
                  style={{
                    left: '40%',
                    top: '30%',
                    transition: 'all 2s ease-in-out',
                  }}
                >
                  <MousePointer className="h-6 w-6 text-primary drop-shadow-lg" />
                </div>
              </div>

              {/* Overlay when paused */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <button
                    onClick={handlePlayPause}
                    className="h-20 w-20 rounded-full bg-primary flex items-center justify-center hover:bg-primary-hover transition-colors"
                  >
                    <Play className="h-10 w-10 text-white ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Timeline */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground min-w-[45px]">
                {formatDuration(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={selectedSession.duration}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-[45px]">
                {formatDuration(selectedSession.duration)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentTime(Math.min(selectedSession.duration, currentTime + 10))
                  }
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                <Button size="sm" variant="outline">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Device</p>
              <p className="font-medium capitalize">{selectedSession.device}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Browser</p>
              <p className="font-medium">{selectedSession.browser}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Page Views</p>
              <p className="font-medium">{selectedSession.pageViews}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interactions</p>
              <p className="font-medium">{selectedSession.interactions}</p>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="mt-6">
            <h4 className="font-bold mb-3 text-sm">Event Timeline</h4>
            <div className="space-y-2">
              {[
                { time: 0, event: 'Session started', icon: Play },
                { time: 5, event: 'Clicked CTA button', icon: MousePointer },
                { time: 12, event: 'Scrolled to products', icon: Eye },
                { time: 24, event: 'Added item to cart', icon: MousePointer },
                { time: 45, event: 'Completed checkout', icon: MousePointer },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentTime(item.time)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1">{item.event}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(item.time)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
