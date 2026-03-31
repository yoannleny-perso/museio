import { useState, useEffect, useRef } from 'react';
import { Check, Smartphone, ArrowLeft, Palette, RotateCcw, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockPortfolioV3 } from '../../../data/mockPortfolioV3';
import { ThemePreset, CTAPersonality, MediaTreatment, MotionIntensity, themePresets, PortfolioTheme } from '../../../types/portfolio-v3';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import artistPhoto from 'figma:asset/955703e49fcbf25216ca19f63d51755d531a4505.png';

export function ThemeStudio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(mockPortfolioV3);
  const [currentTheme, setCurrentTheme] = useState<PortfolioTheme>(portfolio.theme);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCustomColors, setShowCustomColors] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  
  // Floating miniature preview state
  const [showMiniature, setShowMiniature] = useState(false);
  const [miniaturePosition, setMiniaturePosition] = useState({ x: 20, y: window.innerHeight - 280 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(currentTheme) !== JSON.stringify(portfolio.theme);
    setHasChanges(changed);
    if (changed) {
      setShowNotification(true); // Show notification when changes are detected
    }
  }, [currentTheme, portfolio.theme]);

  // Intersection Observer for Live Preview section
  useEffect(() => {
    if (!previewRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show miniature when user has changes AND is NOT viewing the preview section
        if (hasChanges && !entry.isIntersecting) {
          setShowMiniature(true);
        } else {
          setShowMiniature(false);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the preview is visible
        rootMargin: '-100px 0px', // Add some buffer
      }
    );

    observer.observe(previewRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasChanges]);

  // Drag start handler
  const handleMiniatureDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragOffset({
      x: clientX - miniaturePosition.x,
      y: clientY - miniaturePosition.y,
    });
    
    setIsDragging(true);
  };

  // Drag handlers for miniature
  useEffect(() => {
    if (!isDragging) return;

    const handleDrag = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      setMiniaturePosition(prev => {
        const newX = Math.max(0, Math.min(window.innerWidth - 169, clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 225, clientY - dragOffset.y));
        return { x: newX, y: newY };
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('touchend', handleDragEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  const themes: Array<{ preset: ThemePreset; name: string; description: string; mood: string }> = [
    {
      preset: 'muse-light',
      name: 'Muse Light',
      description: 'Soft ivory, lilac & plum with glassy cards',
      mood: 'Elegant, dreamy, sophisticated',
    },
    {
      preset: 'midnight-stage',
      name: 'Midnight Stage',
      description: 'Deep charcoal with spotlight gradients',
      mood: 'Dramatic, powerful, nocturnal',
    },
    {
      preset: 'editorial-mono',
      name: 'Editorial Mono',
      description: 'Black, white & warm gray minimal luxury',
      mood: 'Clean, timeless, professional',
    },
    {
      preset: 'electric-club',
      name: 'Electric Club',
      description: 'Inky background with neon accent glows',
      mood: 'Vibrant, energetic, nightlife',
    },
    {
      preset: 'sunset-luxe',
      name: 'Sunset Luxe',
      description: 'Warm sand, rose, bronze & soft cream',
      mood: 'Warm, inviting, premium',
    },
  ];

  const handlePresetChange = (preset: ThemePreset) => {
    setCurrentTheme({
      ...currentTheme,
      preset: preset,
      customColors: undefined, // Reset custom colors when changing preset
    });
  };

  const handleCTAPersonalityChange = (personality: CTAPersonality) => {
    setCurrentTheme({
      ...currentTheme,
      ctaPersonality: personality,
    });
  };

  const handleMediaTreatmentChange = (treatment: MediaTreatment) => {
    setCurrentTheme({
      ...currentTheme,
      mediaTreatment: treatment,
    });
  };

  const handleMotionIntensityChange = (intensity: MotionIntensity) => {
    setCurrentTheme({
      ...currentTheme,
      motionIntensity: intensity,
    });
  };

  const handleAccentColorChange = (color: string) => {
    setCurrentTheme({
      ...currentTheme,
      accentColor: color,
    });
  };

  const handleCustomColorChange = (key: string, value: string) => {
    setCurrentTheme({
      ...currentTheme,
      customColors: {
        ...currentTheme.customColors,
        [key]: value,
      },
    });
  };

  const applyTheme = () => {
    setPortfolio({
      ...portfolio,
      theme: currentTheme,
    });
    
    // In production, this would save to backend
    localStorage.setItem('museio-portfolio-theme', JSON.stringify(currentTheme));
    
    setHasChanges(false);
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slide-in';
    toast.textContent = '✓ Theme applied successfully!';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const resetToDefault = () => {
    if (confirm('Reset theme to default settings?')) {
      const defaultTheme: PortfolioTheme = {
        preset: 'midnight-stage',
        ctaPersonality: 'bold',
        mediaTreatment: 'edge-to-edge',
        motionIntensity: 'expressive',
      };
      setCurrentTheme(defaultTheme);
    }
  };

  const saveAndReturn = () => {
    if (hasChanges) {
      applyTheme();
    }
    navigate('/app/portfolio');
  };

  // Get effective colors (custom colors override preset colors)
  const getEffectiveColors = () => {
    const presetColors = themePresets[currentTheme.preset];
    if (currentTheme.customColors) {
      return {
        ...presetColors,
        ...currentTheme.customColors,
        accent: currentTheme.accentColor || currentTheme.customColors.accent || presetColors.accent,
      };
    }
    return {
      ...presetColors,
      accent: currentTheme.accentColor || presetColors.accent,
    };
  };

  const effectiveColors = getEffectiveColors();

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 md:pb-6">
      {/* Unsaved Changes Notification */}
      {hasChanges && showNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 px-4 py-3 flex items-center gap-3 min-w-[200px]">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="font-semibold text-orange-700">Unsaved Changes</span>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="p-1 hover:bg-orange-50 rounded-lg transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#DDDCE7] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (hasChanges && !confirm('Discard unsaved changes?')) {
                  return;
                }
                navigate('/app/portfolio');
              }}
              className="flex items-center gap-2 text-[#7A42E8] font-medium hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-[#1F2430]">Theme Studio</h1>
          </div>

          <button
            onClick={saveAndReturn}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">Save & Close</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Theme Options */}
          <div className="space-y-6">
            {/* Theme Presets */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
              <h2 className="font-bold text-[#1F2430] mb-4">Theme Presets</h2>
              <p className="text-sm text-[#7A7F8C] mb-4">
                Choose a base theme to get started. You can customize colors below.
              </p>
              <div className="space-y-3">
                {themes.map(theme => {
                  const colors = themePresets[theme.preset];
                  const isSelected = currentTheme.preset === theme.preset;
                  return (
                    <button
                      key={theme.preset}
                      onClick={() => handlePresetChange(theme.preset)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#7A42E8] bg-[#F4EEFD] shadow-md'
                          : 'border-[#DDDCE7] hover:border-[#B8ACE8] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Color Swatches */}
                        <div className="flex gap-1 mt-1">
                          <div
                            className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                            style={{ background: colors.background }}
                          />
                          <div
                            className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                            style={{ background: colors.accent }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[#1F2430]">{theme.name}</h3>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#7A42E8] flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-[#7A7F8C] mb-1">{theme.description}</p>
                          <p className="text-xs text-[#7A42E8] font-medium">{theme.mood}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Accent Color */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1F2430]">Accent Color</h2>
                {currentTheme.accentColor && (
                  <button
                    onClick={() => handleAccentColorChange('')}
                    className="text-sm text-[#7A42E8] font-medium hover:underline"
                  >
                    Reset to theme default
                  </button>
                )}
              </div>
              <p className="text-sm text-[#7A7F8C] mb-4">
                Customize the primary accent color for buttons and highlights.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.accentColor || themePresets[currentTheme.preset].accent}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="w-16 h-16 rounded-xl border-2 border-[#DDDCE7] cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentTheme.accentColor || themePresets[currentTheme.preset].accent}
                    onChange={(e) => handleAccentColorChange(e.target.value)}
                    placeholder="#7A42E8"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Custom Colors */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1F2430]">Advanced Color Customization</h2>
                <button
                  onClick={() => setShowCustomColors(!showCustomColors)}
                  className="text-sm text-[#7A42E8] font-medium hover:underline"
                >
                  {showCustomColors ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showCustomColors && (
                <div className="space-y-4">
                  <p className="text-sm text-[#7A7F8C] mb-4">
                    Fine-tune individual color values. These will override the theme preset.
                  </p>
                  
                  {[
                    { key: 'background', label: 'Background' },
                    { key: 'surface', label: 'Surface' },
                    { key: 'text', label: 'Text' },
                    { key: 'textSecondary', label: 'Text Secondary' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-[#7A7F8C] mb-2">
                        {label}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={currentTheme.customColors?.[key] || themePresets[currentTheme.preset][key as keyof typeof themePresets['muse-light']]}
                          onChange={(e) => handleCustomColorChange(key, e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-[#DDDCE7] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={currentTheme.customColors?.[key] || themePresets[currentTheme.preset][key as keyof typeof themePresets['muse-light']]}
                          onChange={(e) => handleCustomColorChange(key, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  {currentTheme.customColors && (
                    <button
                      onClick={() => setCurrentTheme({ ...currentTheme, customColors: undefined })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
                    >
                      Clear Custom Colors
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CTA Personality */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
              <h2 className="font-bold text-[#1F2430] mb-4">CTA Personality</h2>
              <p className="text-sm text-[#7A7F8C] mb-4">
                Choose the style and tone for your call-to-action buttons.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['elegant', 'bold', 'minimal', 'club', 'luxe', 'playful'] as CTAPersonality[]).map(personality => (
                  <button
                    key={personality}
                    onClick={() => handleCTAPersonalityChange(personality)}
                    className={`px-4 py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                      currentTheme.ctaPersonality === personality
                        ? 'border-[#7A42E8] bg-[#F4EEFD] text-[#7A42E8] shadow-md'
                        : 'border-[#DDDCE7] text-[#7A7F8C] hover:border-[#B8ACE8]'
                    }`}
                  >
                    {personality}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Treatment */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
              <h2 className="font-bold text-[#1F2430] mb-4">Media Treatment</h2>
              <p className="text-sm text-[#7A7F8C] mb-4">
                Choose how images and videos are displayed in your portfolio.
              </p>
              <div className="space-y-2">
                {([
                  { value: 'clean-crop', label: 'Clean Crop', desc: 'Sharp edges, minimal styling' },
                  { value: 'soft-rounded', label: 'Soft Rounded Poster', desc: 'Gentle rounded corners' },
                  { value: 'edge-to-edge', label: 'Edge-to-Edge', desc: 'Full-bleed images' },
                  { value: 'layered-collage', label: 'Layered Collage', desc: 'Overlapping composition' },
                  { value: 'blurred-backdrop', label: 'Blurred Backdrop Card', desc: 'Glassmorphism effect' },
                  { value: 'framed-editorial', label: 'Framed Editorial Tile', desc: 'Magazine-style frames' },
                  { value: 'glass-overlay', label: 'Glass Overlay Card', desc: 'Translucent overlays' },
                ] as Array<{ value: MediaTreatment; label: string; desc: string }>).map(treatment => (
                  <button
                    key={treatment.value}
                    onClick={() => handleMediaTreatmentChange(treatment.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-left transition-all ${
                      currentTheme.mediaTreatment === treatment.value
                        ? 'border-[#7A42E8] bg-[#F4EEFD] shadow-md'
                        : 'border-[#DDDCE7] hover:border-[#B8ACE8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold ${currentTheme.mediaTreatment === treatment.value ? 'text-[#7A42E8]' : 'text-[#1F2430]'}`}>
                          {treatment.label}
                        </div>
                        <div className="text-xs text-[#7A7F8C] mt-0.5">{treatment.desc}</div>
                      </div>
                      {currentTheme.mediaTreatment === treatment.value && (
                        <Check className="w-5 h-5 text-[#7A42E8]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Motion Intensity */}
            <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
              <h2 className="font-bold text-[#1F2430] mb-4">Motion Intensity</h2>
              <p className="text-sm text-[#7A7F8C] mb-4">
                Control the level of animation and transitions in your portfolio.
              </p>
              <div className="space-y-2">
                {([
                  { value: 'calm', label: 'Calm', desc: 'Subtle, minimal motion' },
                  { value: 'expressive', label: 'Expressive', desc: 'Balanced animations' },
                  { value: 'performance', label: 'Performance', desc: 'Dynamic, energetic' },
                ] as Array<{ value: MotionIntensity; label: string; desc: string }>).map(intensity => (
                  <button
                    key={intensity.value}
                    onClick={() => handleMotionIntensityChange(intensity.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-left transition-all ${
                      currentTheme.motionIntensity === intensity.value
                        ? 'border-[#7A42E8] bg-[#F4EEFD] shadow-md'
                        : 'border-[#DDDCE7] hover:border-[#B8ACE8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold capitalize ${currentTheme.motionIntensity === intensity.value ? 'text-[#7A42E8]' : 'text-[#1F2430]'}`}>
                          {intensity.label}
                        </div>
                        <div className="text-xs text-[#7A7F8C] mt-0.5">{intensity.desc}</div>
                      </div>
                      {currentTheme.motionIntensity === intensity.value && (
                        <Check className="w-5 h-5 text-[#7A42E8]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Apply Button (Mobile) */}
            <button
              onClick={applyTheme}
              disabled={!hasChanges}
              className="md:hidden w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>{hasChanges ? 'Apply Changes' : 'No Changes'}</span>
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="space-y-6">
            <div className="sticky top-24" ref={previewRef}>
              <div className="bg-white rounded-2xl p-6 border border-[#DDDCE7]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#7A42E8]" />
                    <h2 className="font-bold text-[#1F2430]">Live Preview</h2>
                  </div>
                  {hasChanges && (
                    <button
                      onClick={applyTheme}
                      className="px-4 py-2 rounded-lg bg-[#7A42E8] text-white font-medium hover:bg-[#6816B0] transition-colors text-sm flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply</span>
                    </button>
                  )}
                </div>

                <p className="text-sm text-[#7A7F8C] mb-4">
                  See how your theme looks in real-time. Changes are instant!
                </p>

                {/* Phone Frame */}
                <div className="bg-[#F8F9FB] rounded-3xl p-4">
                  <div
                    className="rounded-2xl shadow-2xl overflow-hidden mx-auto transition-all duration-300"
                    style={{
                      maxWidth: '375px',
                      background: effectiveColors.background,
                    }}
                  >
                    {/* Hero Preview */}
                    <div
                      className="p-8 text-center transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${effectiveColors.gradient[0]}, ${effectiveColors.accent})`,
                        color: effectiveColors.text,
                      }}
                    >
                      <div
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 overflow-hidden transition-all duration-300"
                        style={{
                          borderColor: `${effectiveColors.surface}40`,
                          background: `${effectiveColors.surface}20`,
                        }}
                      >
                        <ImageWithFallback src={artistPhoto} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: effectiveColors.surface }}>Your Name</h3>
                      <p className="opacity-90 text-sm mb-4" style={{ color: effectiveColors.surface }}>Your creative title</p>
                      <button
                        className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                        style={{
                          background: effectiveColors.surface,
                          color: effectiveColors.accent,
                          borderRadius: currentTheme.ctaPersonality === 'minimal' ? '8px' : currentTheme.ctaPersonality === 'bold' ? '16px' : '12px',
                          fontWeight: currentTheme.ctaPersonality === 'bold' ? '700' : currentTheme.ctaPersonality === 'elegant' ? '500' : '600',
                          textTransform: currentTheme.ctaPersonality === 'club' ? 'uppercase' : 'none',
                          letterSpacing: currentTheme.ctaPersonality === 'club' ? '0.05em' : 'normal',
                        }}
                      >
                        Book Me
                      </button>
                    </div>

                    {/* Content Preview */}
                    <div className="p-6 space-y-4">
                      <div
                        className="p-4 rounded-xl transition-all duration-300"
                        style={{
                          background: effectiveColors.surface,
                          border: `1px solid ${effectiveColors.border}`,
                          borderRadius: currentTheme.mediaTreatment === 'soft-rounded' ? '16px' : currentTheme.mediaTreatment === 'clean-crop' ? '8px' : '12px',
                        }}
                      >
                        <div
                          className="font-semibold mb-2 transition-all duration-300"
                          style={{ color: effectiveColors.text }}
                        >
                          About Section
                        </div>
                        <div
                          className="text-sm opacity-75 transition-all duration-300"
                          style={{ color: effectiveColors.textSecondary }}
                        >
                          Sample content preview showing your theme colors and typography in action.
                        </div>
                      </div>

                      <div
                        className="p-4 rounded-xl transition-all duration-300"
                        style={{
                          background: effectiveColors.surface,
                          border: `1px solid ${effectiveColors.border}`,
                        }}
                      >
                        <div
                          className="font-semibold mb-2 transition-all duration-300"
                          style={{ color: effectiveColors.text }}
                        >
                          Gallery
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map(i => (
                            <div
                              key={i}
                              className="aspect-square rounded-lg transition-all duration-300"
                              style={{
                                background: effectiveColors.overlay,
                                borderRadius: currentTheme.mediaTreatment === 'soft-rounded' ? '12px' : currentTheme.mediaTreatment === 'clean-crop' ? '4px' : '8px',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div
                        className="p-4 rounded-xl text-center transition-all duration-300"
                        style={{
                          background: effectiveColors.overlay,
                        }}
                      >
                        <button
                          className="px-6 py-3 rounded-xl font-semibold w-full transition-all duration-300"
                          style={{
                            background: effectiveColors.accent,
                            color: effectiveColors.surface,
                            borderRadius: currentTheme.ctaPersonality === 'minimal' ? '8px' : currentTheme.ctaPersonality === 'bold' ? '16px' : '12px',
                            fontWeight: currentTheme.ctaPersonality === 'bold' ? '700' : currentTheme.ctaPersonality === 'elegant' ? '500' : '600',
                            textTransform: currentTheme.ctaPersonality === 'club' ? 'uppercase' : 'none',
                            letterSpacing: currentTheme.ctaPersonality === 'club' ? '0.05em' : 'normal',
                          }}
                        >
                          Check Availability
                        </button>
                      </div>

                      {/* Motion Intensity Indicator */}
                      <div
                        className="p-3 rounded-lg text-center text-xs transition-all duration-300"
                        style={{
                          background: effectiveColors.accentLight,
                          color: effectiveColors.accent,
                        }}
                      >
                        <div className="font-semibold mb-1">Motion: {currentTheme.motionIntensity}</div>
                        <div className="opacity-75">
                          {currentTheme.motionIntensity === 'calm' && 'Subtle transitions, minimal animation'}
                          {currentTheme.motionIntensity === 'expressive' && 'Balanced motion with smooth easing'}
                          {currentTheme.motionIntensity === 'performance' && 'Dynamic animations, bold transitions'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Info */}
                <div className="mt-4 p-4 bg-[#F8F9FB] rounded-xl">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A7F8C]">Current Theme:</span>
                      <span className="font-semibold text-[#1F2430]">
                        {themes.find(t => t.preset === currentTheme.preset)?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A7F8C]">CTA Style:</span>
                      <span className="font-semibold text-[#1F2430] capitalize">
                        {currentTheme.ctaPersonality}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A7F8C]">Media:</span>
                      <span className="font-semibold text-[#1F2430]">
                        {currentTheme.mediaTreatment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                    {currentTheme.accentColor && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#7A7F8C]">Custom Accent:</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-black/10"
                            style={{ background: currentTheme.accentColor }}
                          />
                          <span className="font-mono text-xs text-[#1F2430]">
                            {currentTheme.accentColor}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Miniature Preview */}
      {showMiniature && (
        <div
          className={`fixed z-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} overflow-hidden`}
          style={{
            left: `${miniaturePosition.x}px`,
            top: `${miniaturePosition.y}px`,
            width: '169px',
            height: '225px',
          }}
        >
          {/* Miniature Preview Content - Direct preview without wrapper */}
          <div
            className="rounded-xl shadow-2xl overflow-hidden transition-all duration-300 relative"
            style={{
              background: effectiveColors.background,
              transform: 'scale(0.45)',
              transformOrigin: 'top left',
              width: '375px',
              height: '500px',
            }}
            onMouseDown={handleMiniatureDragStart}
            onTouchStart={handleMiniatureDragStart}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowMiniature(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <X className="w-4 h-4 text-[#7A7F8C]" />
            </button>

            {/* Hero Preview */}
            <div
              className="p-8 text-center transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${effectiveColors.gradient[0]}, ${effectiveColors.accent})`,
                color: effectiveColors.text,
              }}
            >
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 overflow-hidden transition-all duration-300"
                style={{
                  borderColor: `${effectiveColors.surface}40`,
                  background: `${effectiveColors.surface}20`,
                }}
              >
                <ImageWithFallback src={artistPhoto} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: effectiveColors.surface }}>Your Name</h3>
              <p className="opacity-90 text-sm mb-4" style={{ color: effectiveColors.surface }}>Your creative title</p>
              <button
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                style={{
                  background: effectiveColors.surface,
                  color: effectiveColors.accent,
                  borderRadius: currentTheme.ctaPersonality === 'minimal' ? '8px' : currentTheme.ctaPersonality === 'bold' ? '16px' : '12px',
                  fontWeight: currentTheme.ctaPersonality === 'bold' ? '700' : currentTheme.ctaPersonality === 'elegant' ? '500' : '600',
                  textTransform: currentTheme.ctaPersonality === 'club' ? 'uppercase' : 'none',
                  letterSpacing: currentTheme.ctaPersonality === 'club' ? '0.05em' : 'normal',
                }}
              >
                Book Me
              </button>
            </div>

            {/* Content Preview */}
            <div className="p-6 space-y-4">
              <div
                className="p-4 rounded-xl transition-all duration-300"
                style={{
                  background: effectiveColors.surface,
                  border: `1px solid ${effectiveColors.border}`,
                  borderRadius: currentTheme.mediaTreatment === 'soft-rounded' ? '16px' : currentTheme.mediaTreatment === 'clean-crop' ? '8px' : '12px',
                }}
              >
                <div
                  className="font-semibold mb-2 transition-all duration-300"
                  style={{ color: effectiveColors.text }}
                >
                  About Section
                </div>
                <div
                  className="text-sm opacity-75 transition-all duration-300"
                  style={{ color: effectiveColors.textSecondary }}
                >
                  Sample content preview
                </div>
              </div>

              <div
                className="p-4 rounded-xl transition-all duration-300"
                style={{
                  background: effectiveColors.surface,
                  border: `1px solid ${effectiveColors.border}`,
                }}
              >
                <div
                  className="font-semibold mb-2 transition-all duration-300"
                  style={{ color: effectiveColors.text }}
                >
                  Gallery
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg transition-all duration-300"
                      style={{
                        background: effectiveColors.overlay,
                        borderRadius: currentTheme.mediaTreatment === 'soft-rounded' ? '12px' : currentTheme.mediaTreatment === 'clean-crop' ? '4px' : '8px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}