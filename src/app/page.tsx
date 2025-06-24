"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

const steps = [
  { key: "foundations", label: "Foundations" },
  { key: "components", label: "Components" },
  { key: "code", label: "Code" },
];

const PREDEFINED_COLORS = [
  { name: 'US-Black', value: '#070600' },
  { name: 'US-White', value: '#FFFFFB' },
  { name: 'US-Yellow', value: '#FCE114' },
  { name: 'US-Purple', value: '#6F00FF' },
  { name: 'US-Grey', value: '#767676' },
  { name: 'US-Light-Grey', value: '#DCDCDC' },
];

function Sidebar({ currentStep, setStep, open, setOpen }: { currentStep: string; setStep: (key: string) => void; open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <nav className={`${styles.sidebar} ${open ? styles.open : ""}`} aria-label="Main navigation">
      <ul className={styles.navList}>
        {steps.map((step) => (
          <li key={step.key}>
            <button
              className={currentStep === step.key ? styles.active : ""}
              onClick={() => {
                setStep(step.key);
                setOpen(false);
              }}
            >
              {step.label}
            </button>
          </li>
        ))}
      </ul>
      <hr className={styles.sidebarSeparator} />
      <div className={styles.sidebarLinks}>
        
        <a
          href="https://usersmart.io/get-in-touch/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: 4, verticalAlign: 'middle' }}>
            <text x="2" y="13" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fill="#070600">@</text>
          </svg>
          Feedback →
        </a>
      </div>
    </nav>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return null;
  const n = parseInt(c, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
  );
}
function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)},${Math.round(s * 100)}%,${Math.round(l * 100)}%)`;
}
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function hexToRgba(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha / 100})`;
}

function ColorPicker({ onSave, initialColor, initialName, mode = 'add', onCancel }: {
  onSave: (color: { name: string; value: string }) => void;
  initialColor?: string;
  initialName?: string;
  mode?: 'add' | 'edit';
  onCancel?: () => void;
}) {
  const [color, setColor] = useState(initialColor || "#3498db");
  const [inputType, setInputType] = useState("hex");
  const [inputValue, setInputValue] = useState(initialColor || "#3498db");
  const [name, setName] = useState(initialName || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setColor(initialColor || "#3498db");
    setInputValue(initialColor || "#3498db");
    setName(initialName || "");
    setInputType("hex");
    setError("");
  }, [initialColor, initialName]);

  // Convert input to hex for color input
  function toHex(val: string, type: string): string {
    try {
      if (type === "hex") {
        if (/^#([0-9a-fA-F]{3,8})$/.test(val)) return val;
      } else if (type === "rgb") {
        const match = val.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
        if (match) {
          const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
          if ([r, g, b].every((v) => v >= 0 && v <= 255)) {
            return rgbToHex(r, g, b);
          }
        }
      } else if (type === "hsl") {
        const match = val.match(/hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/);
        if (match) {
          let h = parseInt(match[1]), s = parseInt(match[2]), l = parseInt(match[3]);
          if (
            h >= 0 && h <= 360 &&
            s >= 0 && s <= 100 &&
            l >= 0 && l <= 100
          ) {
            const { r, g, b } = hslToRgb(h, s, l);
            return rgbToHex(r, g, b);
          }
        }
      }
    } catch {}
    return "";
  }

  // When user picks from color wheel, update inputValue in selected format
  function handleColorWheelChange(val: string) {
    setColor(val);
    let rgb = hexToRgb(val);
    if (!rgb) return;
    if (inputType === "hex") setInputValue(val);
    else if (inputType === "rgb") setInputValue(`rgb(${rgb.r},${rgb.g},${rgb.b})`);
    else if (inputType === "hsl") setInputValue(rgbToHsl(rgb.r, rgb.g, rgb.b));
    setError("");
  }

  // When user types in the field, update color wheel if valid
  function handleInputChange(val: string) {
    setInputValue(val);
    const hex = toHex(val, inputType);
    if (hex) {
      setColor(hex);
      setError("");
    } else {
      setError("Invalid color format");
    }
  }

  function handleTypeChange(type: string) {
    setInputType(type);
    // Convert current color to new format
    let rgb = hexToRgb(color);
    if (!rgb) return;
    if (type === "hex") setInputValue(color);
    else if (type === "rgb") setInputValue(`rgb(${rgb.r},${rgb.g},${rgb.b})`);
    else if (type === "hsl") setInputValue(rgbToHsl(rgb.r, rgb.g, rgb.b));
    setError("");
  }

  function handleSaveOrUpdate() {
    if (!name.trim()) {
      setError("Please name your colour first.");
      return;
    }
    if (!color) {
      setError("Please select a valid color");
      return;
    }
    onSave({ name, value: color });
    setName("");
    setInputValue("");
    setError("");
  }

  return (
    <div className={styles.colorPicker}>
      <h2>Colours</h2>
      <label className={styles.colorLabel}>
        <span>Pick a color:</span>
        <input
          type="color"
          value={color}
          onChange={e => handleColorWheelChange(e.target.value)}
          className={styles.colorWheel}
        />
      </label>
      <div className={styles.inputRow}>
        <select
          value={inputType}
          onChange={e => handleTypeChange(e.target.value)}
          className={styles.inputType}
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
        <input
          type="text"
          placeholder={inputType === "hex" ? "#RRGGBB" : inputType === "rgb" ? "rgb(0,0,0)" : "hsl(0,0%,0%)"}
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          className={styles.colorInput}
        />
      </div>
      <input
        type="text"
        placeholder="Color name"
        value={name}
        onChange={e => setName(e.target.value)}
        className={styles.colorNameInput}
      />
      <button onClick={handleSaveOrUpdate} className={styles.saveButton}>
        {mode === 'edit' ? 'Update Color' : 'Save Colour →'}
      </button>
      {mode === 'edit' && onCancel && (
        <button onClick={onCancel} className={styles.cancelButton} type="button">Cancel</button>
      )}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.colorPreview} style={{ background: color }} />
    </div>
  );
}

function generateButtonCode({
  buttonText,
  buttonBg,
  buttonTextColor,
  buttonFocusColor,
  componentStyle,
  glassAlpha,
  glassBlur,
  glassBgType,
  gradientStartAlpha,
  showFocus,
}: {
  buttonText: string;
  buttonBg: string;
  buttonTextColor: string;
  buttonFocusColor: string;
  componentStyle: 'flat' | 'glass';
  glassAlpha: number;
  glassBlur: number;
  glassBgType: 'static' | 'gradient';
  gradientStartAlpha: number;
  showFocus: boolean;
}) {
  // HTML
  const html = `<button class="custom-btn"><span class="btn-text">${buttonText}</span></button>`;
  // CSS
  const background = componentStyle === 'glass'
    ? glassBgType === 'gradient'
      ? `linear-gradient(to bottom, rgba(255,255,255,${gradientStartAlpha/100}), rgba(0,0,0,0)), ${hexToRgba(buttonBg || '#3498db', glassAlpha)}`
      : hexToRgba(buttonBg || '#3498db', glassAlpha)
    : buttonBg || '#3498db';
  const backgroundBlendMode = componentStyle === 'glass' && glassBgType === 'gradient' ? 'overlay, normal' : undefined;
  const boxShadow = componentStyle === 'glass' && glassBgType === 'gradient'
    ? `inset 0px 0px 10px 0px ${hexToRgba(buttonBg || '#3498db', glassAlpha)}, 0 4px 32px 0 rgba(0,0,0,0.12), 0 1.5px 4px 0 rgba(0,0,0,0.10)`
    : componentStyle === 'glass'
    ? '0 4px 32px 0 rgba(0,0,0,0.12), 0 1.5px 4px 0 rgba(0,0,0,0.10)'
    : undefined;
  let css = `.custom-btn {
  background: ${background};
  ${backgroundBlendMode ? `background-blend-mode: ${backgroundBlendMode};` : ''}
  color: ${buttonTextColor || '#fff'};
  font-family: 'Roboto', Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 26px;
  ${componentStyle === 'glass' ? 'border: 1px solid rgba(255,255,255,0.25);' : 'border: none;'}
  ${componentStyle === 'glass' ? 'border-left: none; border-right: none;' : ''}
  ${boxShadow ? `box-shadow: ${boxShadow};` : ''}
  ${componentStyle === 'glass' ? `backdrop-filter: blur(${glassBlur}px);` : ''}
  transition: background 0.2s;
}
.custom-btn .btn-text {
  display: inline-block;
}
${buttonFocusColor ? `.custom-btn:focus {
  outline: 2px solid ${buttonFocusColor};
  outline-offset: 1px;
}` : showFocus ? `.custom-btn:focus {
  outline: 2px solid #222;
  outline-offset: 1px;
}` : ''}
`;
  const js = '';
  return { html, css, js };
}

export default function Home() {
  const [step, setStep] = useState(steps[0].key);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedColors, setSavedColors] = useState<{ name: string; value: string }[]>(() => [...PREDEFINED_COLORS]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editColor, setEditColor] = useState<{ name: string; value: string } | null>(null);

  // Component section state
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  const [componentStyle, setComponentStyle] = useState<'flat' | 'glass'>('flat');
  const [buttonBg, setButtonBg] = useState<string>("#070600");
  const [buttonText, setButtonText] = useState<string>("Button");
  const [buttonTextColor, setButtonTextColor] = useState<string>("#fffffb");
  const [buttonFocusColor, setButtonFocusColor] = useState<string>("");
  const [glassAlpha, setGlassAlpha] = useState<number>(60); // default 60% transparency
  const [glassBlur, setGlassBlur] = useState<number>(4); // default 4px blur
  const [showFocus, setShowFocus] = useState<boolean>(false);
  const [glassBgType, setGlassBgType] = useState<'static' | 'gradient'>('static');
  const [gradientStartAlpha, setGradientStartAlpha] = useState<number>(20); // default 20%

  // Preview area state
  const [previewBgType, setPreviewBgType] = useState<'color' | 'image' | 'video'>('color');
  const [previewBgColor, setPreviewBgColor] = useState<string>("");
  const [picsumSeed, setPicsumSeed] = useState<string>(Math.random().toString(36).substring(2, 10));
  const [videoPaused, setVideoPaused] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [code, setCode] = useState<{ html: string; css: string; js: string } | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  // Contrast calculation utility
  function luminance(r: number, g: number, b: number) {
    const a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }) {
    const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  // Add refs and state for canvas and sampled color
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sampledBgColors, setSampledBgColors] = useState<{r: number, g: number, b: number}[]>([]);

  // Loading state for preview image
  const [imageLoading, setImageLoading] = useState(false);
  // Loading state for preview video
  const [videoLoading, setVideoLoading] = useState(false);

  // Helper to sample a 3x3 grid of pixels around the center of the preview background
  function sampleImageRegion(url: string) {
    setImageLoading(true);
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const cx = Math.floor(img.width / 2);
      const cy = Math.floor(img.height / 2);
      const region: {r: number, g: number, b: number}[] = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = cx + dx;
          const y = cy + dy;
          const data = ctx.getImageData(x, y, 1, 1).data;
          region.push({ r: data[0], g: data[1], b: data[2] });
        }
      }
      setSampledBgColors(region);
      setImageLoading(false);
    };
    img.onerror = function() {
      setImageLoading(false);
    };
    img.src = url;
  }

  // For static color, just fill the array with the same color
  useEffect(() => {
    if (previewBgType === 'color') {
      const rgb = hexToRgb(previewBgColor || '#f0f0f0');
      setSampledBgColors(rgb ? Array(9).fill(rgb) : []);
    }
  }, [previewBgType, previewBgColor]);

  // For image, sample region
  useEffect(() => {
    if (previewBgType === 'image') {
      const url = `https://picsum.photos/seed/${picsumSeed}/800/300`;
      sampleImageRegion(url);
    }
  }, [previewBgType, picsumSeed]);

  // For video, keep previous logic or use a single color for now
  // ...

  // Calculate the minimum contrast ratio from the sampled region
  let minContrast = null;
  if (componentStyle === 'glass' && glassBgType === 'gradient' && sampledBgColors.length) {
    const textRgb = hexToRgb(buttonTextColor || '#fff');
    if (textRgb) {
      minContrast = Math.min(...sampledBgColors.map(bg => {
        // Blend glass gradient start color over sampled background
        const gradRgb = {
          r: Math.round(255 * (gradientStartAlpha/100) + bg.r * (1 - gradientStartAlpha/100)),
          g: Math.round(255 * (gradientStartAlpha/100) + bg.g * (1 - gradientStartAlpha/100)),
          b: Math.round(255 * (gradientStartAlpha/100) + bg.b * (1 - gradientStartAlpha/100)),
        };
        // Blend glass layer over background using current glassAlpha
        const blend = (a: number, b: number, alpha: number) => Math.round(a * (glassAlpha/100) + b * (1-alpha/100));
        const glassOverBg = {
          r: blend(gradRgb.r, bg.r, glassAlpha),
          g: blend(gradRgb.g, bg.g, glassAlpha),
          b: blend(gradRgb.b, bg.b, glassAlpha),
        };
        return contrast(textRgb, glassOverBg);
      }));
    }
  }

  // Use default colors if buttonBg or buttonTextColor is not set
  const effectiveButtonBg = buttonBg || '#3498db';
  const effectiveButtonTextColor = buttonTextColor || '#fff';

  // Calculate contrast for flat style
  let flatContrast = null;
  if (componentStyle === 'flat') {
    const textRgb = hexToRgb(effectiveButtonTextColor);
    const bgRgb = hexToRgb(effectiveButtonBg);
    if (textRgb && bgRgb) {
      flatContrast = contrast(textRgb, bgRgb);
    }
  }
  // Calculate contrast for glass style with static surface
  let staticGlassContrast = null;
  if (componentStyle === 'glass' && glassBgType === 'static' && sampledBgColors.length) {
    const textRgb = hexToRgb(effectiveButtonTextColor);
    const btnBgRgb = hexToRgb(effectiveButtonBg);
    if (textRgb && btnBgRgb) {
      staticGlassContrast = Math.min(...sampledBgColors.map(bg => {
        const blend = (a: number, b: number, alpha: number) => Math.round(a * (glassAlpha/100) + b * (1-glassAlpha/100));
        const glassOverBg = {
          r: blend(btnBgRgb.r, bg.r, glassAlpha),
          g: blend(btnBgRgb.g, bg.g, glassAlpha),
          b: blend(btnBgRgb.b, bg.b, glassAlpha),
        };
        return contrast(textRgb, glassOverBg);
      }));
    }
  }
  // Calculate contrast for glass style with gradient surface (same as static: blend button color with sampled background using glassAlpha, then compare to text color)
  let gradientGlassContrast = null;
  if (componentStyle === 'glass' && glassBgType === 'gradient' && sampledBgColors.length) {
    const textRgb = hexToRgb(effectiveButtonTextColor);
    const btnBgRgb = hexToRgb(effectiveButtonBg);
    if (textRgb && btnBgRgb) {
      gradientGlassContrast = Math.min(...sampledBgColors.map(bg => {
        const blend = (a: number, b: number, alpha: number) => Math.round(a * (glassAlpha/100) + b * (1-glassAlpha/100));
        const glassOverBg = {
          r: blend(btnBgRgb.r, bg.r, glassAlpha),
          g: blend(btnBgRgb.g, bg.g, glassAlpha),
          b: blend(btnBgRgb.b, bg.b, glassAlpha),
        };
        return contrast(textRgb, glassOverBg);
      }));
    }
  }

  useEffect(() => {
    if (previewBgType === 'image') {
      setPicsumSeed(Math.random().toString(36).substring(2, 10));
    }
    if (previewBgType === 'video') {
      setVideoLoading(true);
    }
  }, [previewBgType]);

  useEffect(() => {
    if (videoRef.current) {
      if (videoPaused) videoRef.current.pause();
      else videoRef.current.play();
    }
  }, [videoPaused, previewBgType]);

  function randomizePicsum() {
    setPicsumSeed(Math.random().toString(36).substring(2, 10));
  }

  function handleSaveColor(color: { name: string; value: string }) {
    setSavedColors([...savedColors, color]);
  }

  function handleDeleteColor(idx: number) {
    setSavedColors(savedColors.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditColor(null);
    }
  }

  function handleEditColor(idx: number) {
    setEditingIndex(idx);
    setEditColor(savedColors[idx]);
  }

  function handleUpdateColor(color: { name: string; value: string }) {
    if (editingIndex === null) return;
    setSavedColors(savedColors.map((c, i) => (i === editingIndex ? color : c)));
    setEditingIndex(null);
    setEditColor(null);
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditColor(null);
  }

  function handleGenerateCode() {
    setCode(generateButtonCode({
      buttonText,
      buttonBg,
      buttonTextColor,
      buttonFocusColor,
      componentStyle,
      glassAlpha,
      glassBlur,
      glassBgType,
      gradientStartAlpha,
      showFocus,
    }));
    setStep('code');
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopyMsg('The code was copied to the clipboard');
    setTimeout(() => setCopyMsg(null), 1800);
  }

  useEffect(() => {
    if (step === 'code' && selectedComponent) {
      setCode(generateButtonCode({
        buttonText,
        buttonBg,
        buttonTextColor,
        buttonFocusColor,
        componentStyle,
        glassAlpha,
        glassBlur,
        glassBgType,
        gradientStartAlpha,
        showFocus,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, buttonText, buttonBg, buttonTextColor, buttonFocusColor, componentStyle, glassAlpha, glassBlur, glassBgType, gradientStartAlpha, showFocus, selectedComponent]);

  return (
    <div className={styles.container}>
      <button
        className={styles.menuButton}
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle menu"
        style={{ position: "fixed", right: 12, top: 12, zIndex: 30 }}
      >
        ☰
      </button>
      <Sidebar currentStep={step} setStep={setStep} open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className={styles.content}>
        {step === "foundations" && (
          <section>
            <h1>Foundations</h1>
            <p>When you start designing components, you&apos;ll need to set up some foundations first. This is where you&apos;ll define your brand colours, typography, and spacing. At the moment, you can only define colours, but more will be added soon.</p>
            <div className={styles.foundationsLayout}>
              <div className={styles.colorCreatorPanel}>
                
                <ColorPicker
                  key={editingIndex !== null ? `edit-${editingIndex}` : 'new'}
                  onSave={editingIndex !== null ? handleUpdateColor : handleSaveColor}
                  initialColor={editColor?.value}
                  initialName={editColor?.name}
                  mode={editingIndex !== null ? 'edit' : 'add'}
                  onCancel={editingIndex !== null ? handleCancelEdit : undefined}
                />
              </div>
              <div className={styles.savedColorsPanel}>
                {savedColors.length > 0 && (
                  <div className={styles.savedColors}>
                    <h2>Saved Colors</h2>
                    <div style={{ marginTop: -8, marginBottom: 12, fontSize: '0.97em', color: '#666' }}>
                      These colours are pre-defined, but you can edit them and create new ones.
                    </div>
                    <ul>
                      {savedColors.map((c, i) => (
                        <li key={i}>
                          <span className={styles.colorSwatch} style={{ background: c.value }} />
                          {c.name} <span className={styles.colorCode}>{c.value}</span>
                          <button className={styles.editBtn} onClick={() => handleEditColor(i)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteColor(i)}>Delete</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {savedColors.length > 0 && (
              <button className={styles.mainCta} onClick={() => setStep('components')}>
                Create components →
              </button>
            )}
            {copyMsg && <div className={styles.copyMsg}>{copyMsg}</div>}
          </section>
        )}
        {step === "components" && (
          <>
            <section>
              <h1>Component Selection</h1>
              <label className={styles.comingSoonLabel}>
                Only button is available for now. More components are coming soon
              </label>
              <select
                className={styles.componentDropdown}
                value={selectedComponent}
                onChange={e => setSelectedComponent(e.target.value)}
              >
                <option value="">Select a component</option>
                <option value="button">Button</option>
              </select>
              {selectedComponent === "button" && (
                <div className={styles.componentsLayout}>
                  <div className={styles.buttonConfigSection}>
                    <h2>Button Characteristics</h2>
                    <div className={styles.configRow}>
                      <label>Style</label>
                      <select
                        className={styles.colorSelect}
                        value={componentStyle}
                        onChange={e => setComponentStyle(e.target.value as 'flat' | 'glass')}
                      >
                        <option value="flat">Flat</option>
                        <option value="glass">Glass</option>
                      </select>
                    </div>
                    <div className={styles.subText} style={{ marginTop: -8, marginBottom: 12, fontSize: '0.97em', color: '#666' }}>
                      Flat style uses solid background colour. Glass style uses translucent background.
                    </div>
                    <div className={styles.configRow}>
                      <label>Colour</label>
                      <select
                        className={styles.colorSelect}
                        value={buttonBg}
                        onChange={e => setButtonBg(e.target.value)}
                      >
                        <option value="">Select colour</option>
                        {savedColors.map((c, i) => (
                          <option value={c.value} key={i}>{c.name} ({c.value})</option>
                        ))}
                      </select>
                    </div>
                    {componentStyle === 'glass' && (
                      <>
                        <div className={styles.configRow}>
                          <label>Surface</label>
                          <select
                            className={styles.colorSelect}
                            value={glassBgType}
                            onChange={e => setGlassBgType(e.target.value as 'static' | 'gradient')}
                          >
                            <option value="static">Matte</option>
                            <option value="gradient">Glossy</option>
                          </select>
                        </div>
                        <div className={styles.subText} style={{ marginTop: -8, marginBottom: 12, fontSize: '0.97em', color: '#666' }}>
                          Matte surface has a translucent background with a solid background colour to simulate a frosted glass. Glossy surface has an additional overlay to simulate a shiny glass.
                        </div>
                        <div className={styles.configRow}>
                          <label>Transparency</label>
                          <input
                            type="range"
                            min={1}
                            max={100}
                            value={glassAlpha}
                            onChange={e => setGlassAlpha(Math.max(1, Number(e.target.value)))}
                            className={styles.transparencySlider}
                            style={{ flex: 1, marginRight: 8 }}
                          />
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={glassAlpha}
                            onChange={e => setGlassAlpha(Math.max(1, Number(e.target.value)))}
                            className={styles.transparencyInput}
                            style={{ width: 60 }}
                          />
                          <span>%</span>
                        </div>
                        {glassBgType === 'gradient' && (
                          <div className={styles.configRow}>
                            <label>Gradient Overlay</label>
                            <input
                              type="range"
                              min={1}
                              max={100}
                              value={gradientStartAlpha}
                              onChange={e => setGradientStartAlpha(Math.max(1, Number(e.target.value)))}
                              className={styles.transparencySlider}
                              style={{ flex: 1, marginRight: 8 }}
                            />
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={gradientStartAlpha}
                              onChange={e => setGradientStartAlpha(Math.max(1, Number(e.target.value)))}
                              className={styles.transparencyInput}
                              style={{ width: 60 }}
                            />
                            <span>%</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className={styles.configRow}>
                      <label>Text</label>
                      <input
                        className={styles.buttonTextInput}
                        type="text"
                        value={buttonText}
                        onChange={e => setButtonText(e.target.value)}
                      />
                    </div>
                    <div className={styles.configRow}>
                      <label>Text Colour</label>
                      <select
                        className={styles.colorSelect}
                        value={buttonTextColor}
                        onChange={e => setButtonTextColor(e.target.value)}
                      >
                        <option value="">Select colour</option>
                        {savedColors.map((c, i) => (
                          <option value={c.value} key={i}>{c.name} ({c.value})</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.configRow}>
                      <label>Focus Colour</label>
                      <select
                        className={styles.colorSelect}
                        value={buttonFocusColor}
                        onChange={e => setButtonFocusColor(e.target.value)}
                      >
                        <option value="">Select colour</option>
                        {savedColors.map((c, i) => (
                          <option value={c.value} key={i}>{c.name} ({c.value})</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.configRow}>
                      <label>Show Focus Indicator</label>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={showFocus}
                          onChange={e => setShowFocus(e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                    {/* Only show Background Blur if Glass style is selected */}
                    {componentStyle === 'glass' && (
                      <div className={styles.configRow}>
                        <label>Background Blur</label>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          value={glassBlur}
                          onChange={e => setGlassBlur(Math.max(1, Number(e.target.value)))}
                          className={styles.transparencySlider}
                          style={{ flex: 1, marginRight: 8 }}
                        />
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={glassBlur}
                          onChange={e => setGlassBlur(Math.max(1, Number(e.target.value)))}
                          className={styles.transparencyInput}
                          style={{ width: 60 }}
                        />
                        <span>px</span>
                      </div>
                    )}
                    {/* Start of Fixed foundations group */}
                    <div style={{ marginTop: 24, marginBottom: 12, padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1.05em', marginBottom: 8 }}>Fixed foundations</div>
                      <div className={styles.configRow}>
                        <label>Typography</label>
                        <span className={styles.predefinedValue}>Roboto, 16px, bold</span>
                      </div>
                      <div className={styles.configRow}>
                        <label>Spacing</label>
                        <span className={styles.predefinedValue}>32px left/right, 16px top/bottom</span>
                      </div>
                      <div className={styles.configRow}>
                        <label>Border Radius</label>
                        <span className={styles.predefinedValue}>26px</span>
                      </div>
                      <div className={styles.configRow}>
                        <label>Focus Indicator</label>
                        <span className={styles.predefinedValue}>2px outline, 1px offset</span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: '0.97em', color: '#666' }}>
                        These foundations are locked at the moment. Functionality to edit these are coming soon.
                      </div>
                    </div>
                    {/* End of Fixed foundations group */}
                  </div>
                  <section className={styles.previewSection}>
                    <h2>Preview Area</h2>
                    <div className={styles.previewTabs}>
                      <button
                        type="button"
                        className={previewBgType === 'color' ? styles.activeTab : styles.tab}
                        onClick={() => setPreviewBgType('color')}
                      >
                        Static Colour
                      </button>
                      <button
                        type="button"
                        className={previewBgType === 'image' ? styles.activeTab : styles.tab}
                        onClick={() => setPreviewBgType('image')}
                      >
                        Background image
                      </button>
                      <button
                        type="button"
                        className={previewBgType === 'video' ? styles.activeTab : styles.tab}
                        onClick={() => setPreviewBgType('video')}
                      >
                        Video background
                      </button>
                    </div>
                    <div className={styles.previewBgControls}>
                      {previewBgType === 'color' && (
                        <select
                          className={styles.colorSelect}
                          value={previewBgColor}
                          onChange={e => setPreviewBgColor(e.target.value)}
                        >
                          <option value="">Select background colour</option>
                          {savedColors.map((c, i) => (
                            <option value={c.value} key={i}>{c.name} ({c.value})</option>
                          ))}
                        </select>
                      )}
                      {previewBgType === 'image' && (
                        <button className={styles.randomBgBtn} onClick={randomizePicsum} type="button">
                          Randomize Image
                        </button>
                      )}
                      {previewBgType === 'video' && (
                        <button className={styles.randomBgBtn} onClick={() => setVideoPaused(p => !p)} type="button">
                          {videoPaused ? 'Resume Video' : 'Pause Video'}
                        </button>
                      )}
                    </div>
                    <div
                      key={previewBgType === 'image' ? picsumSeed : previewBgType === 'video' ? 'video' : previewBgColor}
                      className={styles.previewArea}
                      style={{
                        minHeight: 120,
                        background:
                          previewBgType === 'color'
                            ? previewBgColor || '#f0f0f0'
                            : previewBgType === 'image'
                            ? `url('https://picsum.photos/seed/${picsumSeed}/800/300') center/cover no-repeat, #f0f0f0`
                            : undefined,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {previewBgType === 'image' && imageLoading && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.6)',
                          zIndex: 2
                        }}>
                          <div className={styles.spinner} style={{ marginTop: 32 }} />
                        </div>
                      )}
                      {previewBgType === 'video' && videoLoading && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.6)',
                          zIndex: 2
                        }}>
                          <div className={styles.spinner} style={{ marginTop: 32 }} />
                        </div>
                      )}
                      {previewBgType === 'video' && (
                        <video
                          ref={videoRef}
                          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                          width={800}
                          height={400}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 0,
                          }}
                          loop
                          muted
                          autoPlay
                          playsInline
                          onCanPlayThrough={() => setVideoLoading(false)}
                          onLoadedData={() => setVideoLoading(false)}
                        />
                      )}
                      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <button
                          className={styles.buttonPreview}
                          style={{
                            background:
                              componentStyle === 'glass'
                                ? glassBgType === 'gradient'
                                  ? `linear-gradient(to bottom, rgba(255,255,255,${gradientStartAlpha/100}), rgba(0,0,0,0)), ${hexToRgba(buttonBg || '#3498db', glassAlpha)}`
                                  : hexToRgba(buttonBg || '#3498db', glassAlpha)
                                : buttonBg || '#3498db',
                            backgroundBlendMode:
                              componentStyle === 'glass' && glassBgType === 'gradient'
                                ? 'overlay, normal'
                                : undefined,
                            color: buttonTextColor || '#fff',
                            fontFamily: 'Roboto, Arial, sans-serif',
                            fontSize: 16,
                            fontWeight: 700,
                            padding: '16px 32px',
                            borderRadius: 26,
                            outline: showFocus ? (buttonFocusColor ? `2px solid ${buttonFocusColor}` : '2px solid #222') : 'none',
                            outlineOffset: showFocus ? 1 : undefined,
                            boxShadow:
                              componentStyle === 'glass' && glassBgType === 'gradient'
                                ? `inset 0px 0px 10px 0px ${hexToRgba(buttonBg || '#3498db', glassAlpha)}, 0 4px 32px 0 rgba(0,0,0,0.12), 0 1.5px 4px 0 rgba(0,0,0,0.10)`
                                : componentStyle === 'glass'
                                ? '0 4px 32px 0 rgba(0,0,0,0.12), 0 1.5px 4px 0 rgba(0,0,0,0.10)'
                                : undefined,
                            backdropFilter: componentStyle === 'glass' ? `blur(${glassBlur}px)` : undefined,
                            border: componentStyle === 'glass'
                              ? '1px solid rgba(255,255,255,0.25)'
                              : 'none',
                            borderLeft: componentStyle === 'glass' ? 'none' : undefined,
                            borderRight: componentStyle === 'glass' ? 'none' : undefined,
                            transition: 'background 0.2s',
                          }}
                        >
                          <span
                            className={styles.btnText}
                          >
                            {buttonText}
                          </span>
                        </button>
                      </div>
                    </div>
                    {/* Contrast ratio message below preview area */}
                    {previewBgType === 'video' ? (
                      <span style={{ color: '#B22222', fontWeight: 600, marginLeft: 16 }}>
                        Contrast ratio is disabled during video
                      </span>
                    ) : componentStyle === 'glass' && glassBgType === 'gradient' && typeof gradientGlassContrast === 'number' ? (
                      <span style={{ marginLeft: 16, fontWeight: 600, color: gradientGlassContrast > 4.5 ? (gradientGlassContrast > 7.0 ? '#006400' : '#228B22') : '#B22222' }}>
                        Contrast: {gradientGlassContrast.toFixed(2)}{' '}
                        {gradientGlassContrast > 7.0 ? 'Pass AAA' : gradientGlassContrast > 4.5 ? 'Pass AA' : 'Fail'}
                        {gradientGlassContrast <= 4.5 && (
                          <span style={{ color: '#B22222', fontWeight: 500, marginLeft: 8 }}>
                            Contrast ratio is below 4.5. Try adjusting transparency or text colour.
                          </span>
                        )}
                      </span>
                    ) : componentStyle === 'glass' && glassBgType === 'static' && typeof staticGlassContrast === 'number' ? (
                      <span style={{ marginLeft: 16, fontWeight: 600, color: staticGlassContrast > 4.5 ? (staticGlassContrast > 7.0 ? '#006400' : '#228B22') : '#B22222' }}>
                        Contrast: {staticGlassContrast.toFixed(2)}{' '}
                        {staticGlassContrast > 7.0 ? 'Pass AAA' : staticGlassContrast > 4.5 ? 'Pass AA' : 'Fail'}
                        {staticGlassContrast <= 4.5 && (
                          <span style={{ color: '#B22222', fontWeight: 500, marginLeft: 8 }}>
                            Contrast ratio is below 4.5. Try adjusting transparency or text colour.
                          </span>
                        )}
                      </span>
                    ) : componentStyle === 'flat' && typeof flatContrast === 'number' ? (
                      <span style={{ marginLeft: 16, fontWeight: 600, color: flatContrast > 4.5 ? (flatContrast > 7.0 ? '#006400' : '#228B22') : '#B22222' }}>
                        Contrast: {flatContrast.toFixed(2)}{' '}
                        {flatContrast > 7.0 ? 'Pass AAA' : flatContrast > 4.5 ? 'Pass AA' : 'Fail'}
                        {flatContrast <= 4.5 && (
                          <span style={{ color: '#B22222', fontWeight: 500, marginLeft: 8 }}>
                            Contrast ratio is below 4.5. Try adjusting transparency or text colour.
                          </span>
                        )}
                      </span>
                    ) : typeof minContrast === 'number' && (
                      <span style={{ marginLeft: 16, fontWeight: 600, color: minContrast > 4.5 ? (minContrast > 7.0 ? '#006400' : '#228B22') : '#B22222' }}>
                        Contrast: {minContrast.toFixed(2)}{' '}
                        {minContrast > 7.0 ? 'Pass AAA' : minContrast > 4.5 ? 'Pass AA' : 'Fail'}
                        {minContrast <= 4.5 && (
                          <span style={{ color: '#B22222', fontWeight: 500, marginLeft: 8 }}>
                            Contrast ratio is below 4.5. Try adjusting transparency or text colour.
                          </span>
                        )}
                      </span>
                    )}
                  </section>
                </div>
              )}
            </section>
            {selectedComponent && (
              <button className={styles.mainCta} onClick={handleGenerateCode}>
                Generate code →
              </button>
            )}
            {copyMsg && <div className={styles.copyMsg}>{copyMsg}</div>}
          </>
        )}
        {step === "code" && code && (
          <section>
            <h1>Code Generation</h1>
            <div style={{ marginTop: -8, marginBottom: 18, fontSize: '0.97em', color: '#666' }}>
              This code is only to give indication how the component can be implemented using HTML and CSS. You might need to translate this to other coding language, check browser compatibility and make sure it fits to your code structure.
            </div>
            <div className={styles.codePanels}>
              <div className={styles.codePanel}>
                <div className={styles.codePanelTitle}>HTML</div>
                <button className={styles.copyBtn} onClick={() => handleCopy(code.html)}>Copy</button>
                <pre>{code.html}</pre>
              </div>
              <div className={styles.codePanel}>
                <div className={styles.codePanelTitle}>CSS</div>
                <button className={styles.copyBtn} onClick={() => handleCopy(code.css)}>Copy</button>
                <pre>{code.css}</pre>
              </div>
              <div className={styles.codePanel}>
                <div className={styles.codePanelTitle}>JS</div>
                <button className={styles.copyBtn} onClick={() => handleCopy(code.js)}>Copy</button>
                <pre>{code.js || '// No JS required for this button.'}</pre>
              </div>
            </div>
            {copyMsg && <div className={styles.copyMsg}>{copyMsg}</div>}
          </section>
        )}
      </main>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
