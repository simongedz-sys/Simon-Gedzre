import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Moon, Sunrise, Sunset } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WeatherBanner({ weather: weatherProp, children }) {
    const weather = weatherProp;
    const isLoading = false;
    const error = null;

    // Determine time of day
    const timeOfDay = useMemo(() => {
        const now = new Date();
        const hours = now.getHours();
        
        if (weather?.sunrise && weather?.sunset) {
            const sunriseTime = new Date(weather.sunrise);
            const sunsetTime = new Date(weather.sunset);
            const sunriseHour = sunriseTime.getHours();
            const sunsetHour = sunsetTime.getHours();
            
            if (hours < sunriseHour - 1) return 'night';
            if (hours < sunriseHour + 1) return 'sunrise';
            if (hours < 12) return 'morning';
            if (hours < sunsetHour - 1) return 'afternoon';
            if (hours < sunsetHour + 1) return 'sunset';
            return 'night';
        }
        
        // Fallback without sunrise/sunset data
        if (hours < 6) return 'night';
        if (hours < 8) return 'sunrise';
        if (hours < 12) return 'morning';
        if (hours < 17) return 'afternoon';
        if (hours < 20) return 'sunset';
        return 'night';
    }, [weather?.sunrise, weather?.sunset]);

    // Get initial gradient based on time only (stable, won't change after load)
    const [initialGradient] = useState(() => {
        const hours = new Date().getHours();
        let tod = 'afternoon';
        if (hours < 6) tod = 'night';
        else if (hours < 8) tod = 'sunrise';
        else if (hours < 12) tod = 'morning';
        else if (hours < 17) tod = 'afternoon';
        else if (hours < 20) tod = 'sunset';
        else tod = 'night';
        
        switch (tod) {
            case 'night':
                return 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)';
            case 'sunrise':
                return 'linear-gradient(135deg, #f97316 0%, #ea580c 30%, #dc2626 60%, #9333ea 100%)';
            case 'morning':
                return 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)';
            case 'afternoon':
                return 'linear-gradient(135deg, #0369a1 0%, #075985 50%, #0c4a6e 100%)';
            case 'sunset':
                return 'linear-gradient(135deg, #ea580c 0%, #dc2626 30%, #be123c 60%, #7c3aed 100%)';
            default:
                return 'linear-gradient(135deg, #0369a1 0%, #075985 100%)';
        }
    });

    // Use the initial gradient always - no changes after weather loads to prevent flashing
    const gradient = initialGradient;

    // Get weather icon
    const WeatherIcon = useMemo(() => {
        const condition = weather?.condition || 'clear';
        const isNight = timeOfDay === 'night';
        
        switch (condition) {
            case 'cloudy':
                return Cloud;
            case 'rainy':
                return CloudRain;
            case 'snowy':
                return CloudSnow;
            case 'stormy':
                return CloudLightning;
            case 'foggy':
                return CloudFog;
            default:
                if (isNight) return Moon;
                if (timeOfDay === 'sunrise') return Sunrise;
                if (timeOfDay === 'sunset') return Sunset;
                return Sun;
        }
    }, [weather?.condition, timeOfDay]);

    // Icon color based on conditions
    const iconColor = useMemo(() => {
        const condition = weather?.condition || 'clear';
        
        if (condition === 'rainy' || condition === 'stormy') return '#94a3b8';
        if (condition === 'cloudy') return '#e2e8f0';
        if (condition === 'snowy') return '#f1f5f9';
        if (timeOfDay === 'night') return '#fcd34d';
        if (timeOfDay === 'sunrise' || timeOfDay === 'sunset') return '#fbbf24';
        return '#fcd34d';
    }, [weather?.condition, timeOfDay]);

    // Text color based on background
    const textColor = useMemo(() => {
        const condition = weather?.condition || 'clear';
        if (condition === 'snowy') return '#1e293b';
        return '#ffffff';
    }, [weather?.condition]);

    // Always render - show time-based banner even without location/weather

    return (
        <div 
            className="relative overflow-hidden"
            style={{ 
                background: gradient,
                minHeight: '48px'
            }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Stars for night */}
                {timeOfDay === 'night' && (
                    <>
                        <div className="absolute rounded-full bg-white" style={{ width: '4px', height: '4px', top: '15%', left: '5%', animation: 'twinkle 2s ease-in-out infinite' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '2px', height: '2px', top: '25%', left: '12%', animation: 'twinkle 2s ease-in-out infinite 0.7s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '4px', height: '4px', top: '10%', left: '20%', animation: 'twinkle 2s ease-in-out infinite 1.2s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '2px', height: '2px', top: '35%', left: '28%', animation: 'twinkle 2s ease-in-out infinite 0.3s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '5px', height: '5px', top: '20%', left: '40%', animation: 'twinkle 2s ease-in-out infinite 1.8s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '2px', height: '2px', top: '30%', left: '50%', animation: 'twinkle 2s ease-in-out infinite 0.5s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '4px', height: '4px', top: '12%', left: '58%', animation: 'twinkle 2s ease-in-out infinite 2.1s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '2px', height: '2px', top: '38%', left: '65%', animation: 'twinkle 2s ease-in-out infinite 0.9s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '4px', height: '4px', top: '18%', left: '75%', animation: 'twinkle 2s ease-in-out infinite 1.5s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '2px', height: '2px', top: '28%', left: '85%', animation: 'twinkle 2s ease-in-out infinite 0.2s' }} />
                        <div className="absolute rounded-full bg-white" style={{ width: '5px', height: '5px', top: '8%', left: '92%', animation: 'twinkle 2s ease-in-out infinite 1.1s' }} />
                    </>
                )}
                
                {/* Clouds for cloudy or partly cloudy weather */}
                {(weather?.condition === 'cloudy' || weather?.condition === 'partly_cloudy' || weather?.condition === 'partly cloudy') && (
                    <>
                        <Cloud className="absolute text-white/40" style={{ width: '40px', height: '40px', top: '5%', left: '8%', animation: 'floatCloud 12s ease-in-out infinite' }} />
                        <Cloud className="absolute text-white/30" style={{ width: '50px', height: '50px', top: '15%', left: '30%', animation: 'floatCloud 15s ease-in-out infinite', animationDelay: '3s' }} />
                        <Cloud className="absolute text-white/35" style={{ width: '35px', height: '35px', top: '8%', left: '55%', animation: 'floatCloud 10s ease-in-out infinite', animationDelay: '1s' }} />
                        <Cloud className="absolute text-white/25" style={{ width: '45px', height: '45px', top: '20%', left: '78%', animation: 'floatCloud 14s ease-in-out infinite', animationDelay: '5s' }} />
                    </>
                )}

                {/* Sun rays for clear mornings/afternoons */}
                {(weather?.condition === 'clear' && (timeOfDay === 'morning' || timeOfDay === 'afternoon')) && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 bg-yellow-300/30 rounded-full blur-md animate-pulse" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                    <WeatherIcon 
                        className="w-6 h-6 transition-all duration-500" 
                        style={{ color: iconColor }}
                    />
                    <div>
                        <p className="text-sm font-medium" style={{ color: textColor }}>
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </p>
                        <p className="text-xs opacity-90" style={{ color: textColor }}>
                            {weather?.error === 'no_zip' ? (
                                <span className="text-yellow-200">⚠️ Set office zip code in Settings for weather</span>
                            ) : weather?.summary || (timeOfDay === 'night' ? 'Clear Night ✨' : 'Clear Sky ☀️')}
                            {weather?.temperature !== null && weather?.temperature !== undefined && ` • ${weather.temperature}°F`}
                            {weather?.high_temperature != null && weather?.low_temperature != null && (
                                <span className="ml-1 opacity-80">(High {weather.high_temperature}° / Low {weather.low_temperature}°)</span>
                            )}
                            {!weather?.error && (weather?.temperature === null || weather?.temperature === undefined) && error && ' • Weather unavailable'}
                        </p>
                    </div>
                </div>
                
                {/* Right side: children (controls) or time */}
                <div className="flex items-center gap-3">
                    {children}
                    <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: textColor }}>
                            {new Date().toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    50% { transform: translateX(10px) translateY(-5px); }
                }
                @keyframes floatCloud {
                    0%, 100% { transform: translateX(0) translateY(0); opacity: 0.25; }
                    25% { transform: translateX(15px) translateY(-3px); opacity: 0.35; }
                    50% { transform: translateX(25px) translateY(0); opacity: 0.3; }
                    75% { transform: translateX(10px) translateY(3px); opacity: 0.25; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .animate-twinkle {
                    animation: twinkle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}