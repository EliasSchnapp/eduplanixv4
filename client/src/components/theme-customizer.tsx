import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Palette, 
  Eye, 
  Sparkles, 
  Moon, 
  Sun,
  Zap,
  Settings,
  Wand2
} from "lucide-react";

export default function ThemeCustomizer() {
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#67e8f9',
    secondaryColor: '#a78bfa',
    animationsEnabled: true,
    glowEffects: true,
    backgroundParticles: true,
    cardGradients: true,
    brightness: 100,
    contrast: 100,
    blur: 20
  });

  const colorPresets = [
    { name: 'Cyan Dream', primary: '#67e8f9', secondary: '#a78bfa' },
    { name: 'Purple Haze', primary: '#a78bfa', secondary: '#f472b6' },
    { name: 'Green Matrix', primary: '#34d399', secondary: '#67e8f9' },
    { name: 'Orange Sunset', primary: '#fbbf24', secondary: '#f87171' },
    { name: 'Blue Ocean', primary: '#60a5fa', secondary: '#34d399' },
    { name: 'Pink Neon', primary: '#f472b6', secondary: '#a78bfa' }
  ];

  const applyTheme = (settings: typeof themeSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);
    root.style.setProperty('--brightness', `${settings.brightness}%`);
    root.style.setProperty('--contrast', `${settings.contrast}%`);
    root.style.setProperty('--blur', `${settings.blur}px`);
    
    // Apply body classes for effects
    document.body.classList.toggle('animations-disabled', !settings.animationsEnabled);
    document.body.classList.toggle('glow-disabled', !settings.glowEffects);
    document.body.classList.toggle('particles-disabled', !settings.backgroundParticles);
    document.body.classList.toggle('gradients-disabled', !settings.cardGradients);
  };

  const handleColorPreset = (preset: typeof colorPresets[0]) => {
    const newSettings = {
      ...themeSettings,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    };
    setThemeSettings(newSettings);
    applyTheme(newSettings);
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...themeSettings, [key]: value };
    setThemeSettings(newSettings);
    applyTheme(newSettings);
  };

  const resetToDefault = () => {
    const defaultSettings = {
      primaryColor: '#67e8f9',
      secondaryColor: '#a78bfa',
      animationsEnabled: true,
      glowEffects: true,
      backgroundParticles: true,
      cardGradients: true,
      brightness: 100,
      contrast: 100,
      blur: 20
    };
    setThemeSettings(defaultSettings);
    applyTheme(defaultSettings);
  };

  return (
    <div className="space-y-6">
      {/* Theme Header */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Anpassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cyan-100 text-sm">
            Personalisiere dein EDUPLANIX-Erlebnis mit verschiedenen Farbschemata und Effekten.
          </p>
        </CardContent>
      </Card>

      {/* Color Presets */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Farbpaletten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="flex items-center gap-2 p-3 h-auto bg-black/50 border-purple-500/30 hover:border-purple-400/50"
                onClick={() => handleColorPreset(preset)}
              >
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-xs text-purple-100">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Effects */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-300 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visuelle Effekte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="animations" className="text-green-100">
                Animationen
              </Label>
              <Switch
                id="animations"
                checked={themeSettings.animationsEnabled}
                onCheckedChange={(checked) => handleSettingChange('animationsEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="glow" className="text-green-100">
                Glow-Effekte
              </Label>
              <Switch
                id="glow"
                checked={themeSettings.glowEffects}
                onCheckedChange={(checked) => handleSettingChange('glowEffects', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="particles" className="text-green-100">
                Hintergrund-Partikel
              </Label>
              <Switch
                id="particles"
                checked={themeSettings.backgroundParticles}
                onCheckedChange={(checked) => handleSettingChange('backgroundParticles', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="gradients" className="text-green-100">
                Karten-Verläufe
              </Label>
              <Switch
                id="gradients"
                checked={themeSettings.cardGradients}
                onCheckedChange={(checked) => handleSettingChange('cardGradients', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-300 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-yellow-100">
                Helligkeit: {themeSettings.brightness}%
              </Label>
              <Slider
                value={[themeSettings.brightness]}
                onValueChange={(value) => handleSettingChange('brightness', value[0])}
                min={50}
                max={150}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-yellow-100">
                Kontrast: {themeSettings.contrast}%
              </Label>
              <Slider
                value={[themeSettings.contrast]}
                onValueChange={(value) => handleSettingChange('contrast', value[0])}
                min={50}
                max={150}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-yellow-100">
                Unschärfe: {themeSettings.blur}px
              </Label>
              <Slider
                value={[themeSettings.blur]}
                onValueChange={(value) => handleSettingChange('blur', value[0])}
                min={0}
                max={50}
                step={2}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-300 flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Schnellaktionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={resetToDefault}
              variant="outline"
              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
            >
              Zurücksetzen
            </Button>
            <Button
              onClick={() => handleColorPreset(colorPresets[1])}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              Purple Mode
            </Button>
            <Button
              onClick={() => handleColorPreset(colorPresets[2])}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
            >
              Matrix Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}