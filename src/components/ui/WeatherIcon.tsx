/* ── WeatherIcon — Maps WMO codes to Lucide icons ── */

import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog,
  CloudDrizzle, CloudRain, Snowflake, CloudLightning,
  CloudSnow,
} from 'lucide-react';
import { getWeatherInfo } from '../../utils/weatherCodes';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  size?: number;
  className?: string;
}

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog,
  CloudDrizzle, CloudRain, Snowflake, CloudLightning,
  CloudSnow,
};

export default function WeatherIcon({ code, isDay = true, size = 24, className = '' }: WeatherIconProps) {
  const info = getWeatherInfo(code, isDay);
  const IconComponent = ICON_MAP[info.icon] ?? Sun;
  const iconClass = `weather-icon-${info.icon.toLowerCase()}`;

  return <IconComponent size={size} className={`weather-icon ${iconClass} ${className}`} aria-label={info.description} />;
}
