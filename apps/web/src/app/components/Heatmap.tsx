import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Mouse, Eye, Navigation, Smartphone, Monitor, Tablet } from 'lucide-react';

type HeatmapType = 'click' | 'scroll' | 'move';
type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function Heatmap() {
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('click');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [selectedPage, setSelectedPage] = useState('/home');

  const pages = [
    { path: '/home', name: 'Homepage' },
    { path: '/products', name: 'Products' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
  ];

  // Simulate click data (x, y, intensity)
  const clickData = [
    { x: 50, y: 20, intensity: 0.9, label: 'CTA Button' },
    { x: 30, y: 40, intensity: 0.7, label: 'Navigation Link' },
    { x: 70, y: 60, intensity: 0.8, label: 'Product Image' },
    { x: 45, y: 80, intensity: 0.6, label: 'Footer Link' },
    { x: 60, y: 35, intensity: 0.5, label: 'Secondary Button' },
  ];

  // Simulate scroll depth data
  const scrollData = [
    { depth: 0, percentage: 100, label: 'Above fold' },
    { depth: 25, percentage: 85, label: '25% scrolled' },
    { depth: 50, percentage: 65, label: '50% scrolled' },
    { depth: 75, percentage: 40, label: '75% scrolled' },
    { depth: 100, percentage: 15, label: 'Bottom reached' },
  ];

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return 'rgba(255, 0, 0, 0.7)'; // Hot - Red
    if (intensity >= 0.6) return 'rgba(255, 165, 0, 0.7)'; // Warm - Orange
    if (intensity >= 0.4) return 'rgba(255, 255, 0, 0.7)'; // Medium - Yellow
    return 'rgba(0, 255, 0, 0.5)'; // Cool - Green
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-4">Heatmaps</h3>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Page Selector */}
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            {pages.map((page) => (
              <option key={page.path} value={page.path}>
                {page.name}
              </option>
            ))}
          </select>

          {/* Heatmap Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setHeatmapType('click')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                heatmapType === 'click'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              <Mouse className="h-4 w-4" />
              Clicks
            </button>
            <button
              onClick={() => setHeatmapType('scroll')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                heatmapType === 'scroll'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              <Navigation className="h-4 w-4" />
              Scroll
            </button>
            <button
              onClick={() => setHeatmapType('move')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                heatmapType === 'move'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              <Eye className="h-4 w-4" />
              Movement
            </button>
          </div>

          {/* Device Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setDeviceType('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                deviceType === 'desktop'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
              aria-label="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceType('tablet')}
              className={`p-2 rounded-lg transition-colors ${
                deviceType === 'tablet'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
              aria-label="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceType('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                deviceType === 'mobile'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
              aria-label="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            {/* Mock page preview with heatmap overlay */}
            <div className="relative bg-white" style={{ aspectRatio: deviceType === 'mobile' ? '9/16' : '16/9' }}>
              {/* Mock page content */}
              <div className="p-8">
                <div className="mb-6 h-12 bg-gray-200 rounded" />
                <div className="mb-4 h-8 w-3/4 bg-gray-300 rounded" />
                <div className="mb-4 h-4 bg-gray-200 rounded" />
                <div className="mb-4 h-4 w-5/6 bg-gray-200 rounded" />
                <div className="mb-6 h-32 bg-gray-300 rounded" />
                <div className="mb-4 h-8 w-1/2 bg-gray-200 rounded" />
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="h-24 bg-gray-200 rounded" />
                  <div className="h-24 bg-gray-200 rounded" />
                  <div className="h-24 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Heatmap Overlay */}
              {heatmapType === 'click' && (
                <div className="absolute inset-0 pointer-events-none">
                  {clickData.map((point, index) => (
                    <div
                      key={index}
                      className="absolute rounded-full blur-xl animate-pulse"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: `${point.intensity * 100}px`,
                        height: `${point.intensity * 100}px`,
                        backgroundColor: getHeatmapColor(point.intensity),
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>
              )}

              {heatmapType === 'scroll' && (
                <div className="absolute inset-0 pointer-events-none">
                  {scrollData.map((section, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0 border-b-2 border-dashed"
                      style={{
                        top: `${section.depth}%`,
                        borderColor: getHeatmapColor(section.percentage / 100),
                        backgroundColor: `${getHeatmapColor(section.percentage / 100).replace('0.7', '0.2')}`,
                        height: index < scrollData.length - 1 ? `${scrollData[index + 1].depth - section.depth}%` : 'auto',
                      }}
                    />
                  ))}
                </div>
              )}

              {heatmapType === 'move' && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Simulate mouse movement trails */}
                  <svg className="w-full h-full">
                    <path
                      d="M 10,10 Q 30,50 50,30 T 90,80"
                      stroke="rgba(139, 92, 246, 0.5)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20,80 Q 40,60 60,70 T 80,20"
                      stroke="rgba(6, 182, 212, 0.5)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-bold mb-3 text-sm">Top Interactions</h4>
            <div className="space-y-2">
              {heatmapType === 'click' ? (
                clickData
                  .sort((a, b) => b.intensity - a.intensity)
                  .map((point, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{point.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${point.intensity * 100}%`,
                              backgroundColor: getHeatmapColor(point.intensity),
                            }}
                          />
                        </div>
                        <span className="font-medium">{Math.round(point.intensity * 100)}%</span>
                      </div>
                    </div>
                  ))
              ) : (
                scrollData.map((section, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{section.label}</span>
                    <span className="font-medium">{section.percentage}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-bold mb-3 text-sm">Heat Legend</h4>
            <div className="space-y-2">
              {[
                { color: 'rgba(255, 0, 0, 0.7)', label: 'Very High (80-100%)', range: '80-100%' },
                { color: 'rgba(255, 165, 0, 0.7)', label: 'High (60-80%)', range: '60-80%' },
                { color: 'rgba(255, 255, 0, 0.7)', label: 'Medium (40-60%)', range: '40-60%' },
                { color: 'rgba(0, 255, 0, 0.5)', label: 'Low (0-40%)', range: '0-40%' },
              ].map((item) => (
                <div key={item.range} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <Button fullWidth variant="outline">
            Export Heatmap
          </Button>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-bold mb-2 text-sm">Key Insights</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {heatmapType === 'click' && (
            <>
              <li>• CTA button receives 90% of clicks</li>
              <li>• Product images are highly engaging (80%)</li>
              <li>• Footer links get minimal interaction</li>
            </>
          )}
          {heatmapType === 'scroll' && (
            <>
              <li>• 85% of users scroll past the fold</li>
              <li>• Only 15% reach the bottom of the page</li>
              <li>• Consider moving important content higher</li>
            </>
          )}
          {heatmapType === 'move' && (
            <>
              <li>• Users focus on the left side of the page</li>
              <li>• Hero section gets most attention</li>
              <li>• Navigation is frequently scanned</li>
            </>
          )}
        </ul>
      </div>
    </Card>
  );
}
