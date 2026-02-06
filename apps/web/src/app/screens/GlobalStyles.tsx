import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { ArrowLeft, Palette, Type, Sparkles } from 'lucide-react';

interface GlobalStylesProps {
  projectId: string;
  onBack: () => void;
}

export function GlobalStyles({ projectId, onBack }: GlobalStylesProps) {
  const [primaryColor, setPrimaryColor] = useState('#1E40AF');
  const [secondaryColor, setSecondaryColor] = useState('#111827');
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [buttonRadius, setButtonRadius] = useState(8);
  const [spacing, setSpacing] = useState(20);

  const colorPalettes = [
    {
      name: 'Blue Professional',
      primary: '#1E40AF',
      secondary: '#111827',
    },
    {
      name: 'Green Fresh',
      primary: '#10B981',
      secondary: '#064E3B',
    },
    {
      name: 'Purple Modern',
      primary: '#8B5CF6',
      secondary: '#1F2937',
    },
    {
      name: 'Orange Energetic',
      primary: '#F59E0B',
      secondary: '#78350F',
    },
    {
      name: 'Pink Creative',
      primary: '#EC4899',
      secondary: '#831843',
    },
    {
      name: 'Teal Calm',
      primary: '#14B8A6',
      secondary: '#134E4A',
    },
  ];

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Playfair Display',
    'Merriweather',
  ];

  const handleApplyTheme = () => {
    toast.success('Theme applied successfully!');
    setTimeout(() => onBack(), 500);
  };

  const handleApplyPalette = (palette: typeof colorPalettes[0]) => {
    setPrimaryColor(palette.primary);
    setSecondaryColor(palette.secondary);
    toast.success(`Applied ${palette.name} palette`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </button>
          </div>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Global Styles</h1>
          <p className="text-muted-foreground">Customize your site's design system and theme</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Colors */}
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <h2 className="font-bold text-lg">Colors</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 rounded-md border border-input cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 h-10 rounded-md border border-input bg-background font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-10 rounded-md border border-input cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 h-10 rounded-md border border-input bg-background font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Suggested Palettes</label>
                  <div className="grid grid-cols-3 gap-3">
                    {colorPalettes.map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() => handleApplyPalette(palette)}
                        className="p-3 border border-border rounded-lg hover:border-primary transition-colors text-left"
                      >
                        <div className="flex gap-2 mb-2">
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: palette.primary }}
                          />
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: palette.secondary }}
                          />
                        </div>
                        <p className="text-xs font-medium">{palette.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Typography */}
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  <h2 className="font-bold text-lg">Typography</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Heading Font</label>
                    <select
                      value={headingFont}
                      onChange={(e) => setHeadingFont(e.target.value)}
                      className="w-full px-3 h-10 rounded-md border border-input bg-background"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Body Font</label>
                    <select
                      value={bodyFont}
                      onChange={(e) => setBodyFont(e.target.value)}
                      className="w-full px-3 h-10 rounded-md border border-input bg-background"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: headingFont }}>
                    This is a heading
                  </h3>
                  <p style={{ fontFamily: bodyFont }}>
                    This is body text. The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </Card>

            {/* Spacing & Border Radius */}
            <Card>
              <div className="p-6 border-b border-border">
                <h2 className="font-bold text-lg">Spacing & Borders</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Button Border Radius: {buttonRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={buttonRadius}
                    onChange={(e) => setButtonRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex gap-4 mt-3">
                    <div
                      className="px-6 py-2 bg-primary text-white font-medium"
                      style={{ borderRadius: `${buttonRadius}px` }}
                    >
                      Button Preview
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Section Spacing: {spacing}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={spacing}
                    onChange={(e) => setSpacing(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div>
            <Card className="sticky top-6">
              <div className="p-6 border-b border-border">
                <h3 className="font-bold">Live Preview</h3>
              </div>
              <div className="p-6 space-y-4">
                <div
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: primaryColor,
                    color: 'white',
                  }}
                >
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: headingFont }}>
                    Hero Section
                  </h3>
                  <p className="text-sm opacity-90" style={{ fontFamily: bodyFont }}>
                    This is how your primary color looks with text
                  </p>
                  <div
                    className="mt-4 px-4 py-2 bg-white text-center font-medium inline-block"
                    style={{
                      borderRadius: `${buttonRadius}px`,
                      color: primaryColor,
                    }}
                  >
                    Call to Action
                  </div>
                </div>

                <div className="p-6 bg-muted rounded-lg">
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ fontFamily: headingFont, color: secondaryColor }}
                  >
                    Content Section
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: bodyFont }}>
                    Body text appears in your chosen font with proper hierarchy
                  </p>
                </div>

                <div className="space-y-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="h-2 rounded-full opacity-75"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="h-2 rounded-full opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={handleApplyTheme}>
            <Sparkles className="h-4 w-4" />
            Apply Theme
          </Button>
        </div>
      </div>
    </div>
  );
}
