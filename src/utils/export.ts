/* ───────────────────────────────────────────────────
 *  Export Utilities — PDF, JSON, CSV, Clipboard
 * ─────────────────────────────────────────────────── */

import type { WeatherData } from '../types/weather';
import type { AppSettings } from '../types/settings';
import {
  convertTemp, tempUnitLabel, convertWind, windUnitLabel,
  convertPressure, pressureUnitLabel, convertDistance, distanceUnitLabel,
} from './units';
import { getWeatherInfo } from './weatherCodes';
import { formatDate, formatDayName, formatHour, getUVLabel } from './formatters';

export function generateWeatherReport(data: WeatherData, settings: AppSettings): string {
  const { current, location } = data;
  const info = getWeatherInfo(current.weatherCode, current.isDay);
  const tempLabel = tempUnitLabel(settings.tempUnit);
  const wLabel = windUnitLabel(settings.windUnit);

  return [
    `Weather Report — ${location.name}, ${location.country}`,
    `Generated: ${new Date().toLocaleString()}`,
    ``,
    `Conditions: ${info.description}`,
    `Temperature: ${convertTemp(current.temperature, settings.tempUnit).toFixed(1)}${tempLabel}`,
    `Feels Like: ${convertTemp(current.feelsLike, settings.tempUnit).toFixed(1)}${tempLabel}`,
    `Humidity: ${current.humidity}%`,
    `Wind: ${convertWind(current.windSpeed, settings.windUnit).toFixed(1)} ${wLabel}`,
    `Pressure: ${current.pressure} hPa`,
    `UV Index: ${current.uvIndex}`,
    `Cloud Cover: ${current.cloudCover}%`,
    `Visibility: ${(current.visibility / 1000).toFixed(1)} km`,
    `Dew Point: ${current.dewPoint.toFixed(1)}°C`,
    ``,
    `— Powered by Nimbus Weather`,
  ].join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export async function shareWeather(data: WeatherData, settings: AppSettings): Promise<void> {
  const text = generateWeatherReport(data, settings);
  if (navigator.share) {
    await navigator.share({ title: `Weather — ${data.location.name}`, text });
  } else {
    await copyToClipboard(text);
  }
}

export function exportJSON(data: WeatherData): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `nimbus-weather-${data.location.name}.json`, 'application/json');
}

export function exportCSV(data: WeatherData, settings: AppSettings): void {
  const { hourly } = data;
  const tempL = tempUnitLabel(settings.tempUnit);
  const windL = windUnitLabel(settings.windUnit);
  const pressL = pressureUnitLabel(settings.pressureUnit);

  const headers = ['Time', `Temperature (${tempL})`, 'Humidity (%)', `Wind Speed (${windL})`, `Pressure (${pressL})`, 'Precipitation (mm)', 'Weather Condition'];
  const rows = hourly.time.map((t, i) => {
    const rawTemp = hourly.temperature[i];
    const rawWind = hourly.windSpeed[i];
    const rawPress = hourly.pressure[i];
    const info = getWeatherInfo(hourly.weatherCode[i], hourly.isDay[i] === 1);

    const tempVal = convertTemp(rawTemp, settings.tempUnit).toFixed(1);
    const windVal = convertWind(rawWind, settings.windUnit).toFixed(1);
    const pressVal = convertPressure(rawPress, settings.pressureUnit).toFixed(0);

    return [t, tempVal, hourly.humidity[i], windVal, pressVal, hourly.precipitation[i], info.description].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, `nimbus-weather-${data.location.name}.csv`, 'text/csv');
}

export async function exportPDF(data: WeatherData, settings: AppSettings, filename: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();

  const { current, location, daily, hourly } = data;
  const info = getWeatherInfo(current.weatherCode, current.isDay);
  const tempLabel = tempUnitLabel(settings.tempUnit);
  const wLabel = windUnitLabel(settings.windUnit);
  const dLabel = distanceUnitLabel(settings.distanceUnit);

  const tempVal = convertTemp(current.temperature, settings.tempUnit);
  const feelsVal = convertTemp(current.feelsLike, settings.tempUnit);
  const windVal = convertWind(current.windSpeed, settings.windUnit);
  const distVal = convertDistance(current.visibility, settings.distanceUnit);
  const dewVal = convertTemp(current.dewPoint, settings.tempUnit);

  // Deep dark indigo dashboard page background
  pdf.setFillColor(11, 15, 25);
  pdf.rect(0, 0, width, height, 'F');

  // 1. Header Banner
  pdf.setFillColor(15, 23, 42); // slate 900
  pdf.rect(0, 0, width, 40, 'F');

  // Cyan Accent line
  pdf.setFillColor(6, 182, 212); // cyan 500
  pdf.rect(0, 39, width, 1, 'F');

  // Title text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text('NIMBUS WEATHER REPORT', 15, 16);

  // Subtitle (location)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(226, 232, 240); // slate 200
  pdf.text(`${location.name}, ${location.admin1 ? location.admin1 + ', ' : ''}${location.country}`, 15, 24);

  // Timestamp
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184); // slate 400
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 31);

  // Top right big temp
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${Math.round(tempVal)}${tempLabel}`, width - 15, 22, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(226, 232, 240);
  pdf.text(info.description, width - 15, 30, { align: 'right' });

  // 2. Overview Grid
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(6, 182, 212); // cyan 500
  pdf.text('CURRENT CONDITIONS', 15, 52);

  // Divider
  pdf.setDrawColor(30, 41, 59); // slate 800
  pdf.setLineWidth(0.3);
  pdf.line(15, 54, width - 15, 54);

  // 2x3 Grid layout
  const colW = 56;
  const rowH = 18;
  const startX = 15;
  const startY = 58;
  const gapX = 6;
  const gapY = 5;

  const metrics = [
    { label: 'FEELS LIKE', val: `${Math.round(feelsVal)}${tempLabel}` },
    { label: 'HUMIDITY', val: `${current.humidity}%` },
    { label: 'WIND SPEED', val: `${windVal.toFixed(1)} ${wLabel}` },
    { label: 'DEW POINT', val: `${Math.round(dewVal)}${tempLabel}` },
    { label: 'UV INDEX', val: `${current.uvIndex} (${getUVLabel(current.uvIndex).label})` },
    { label: 'VISIBILITY', val: `${Math.round(distVal)} ${dLabel}` },
  ];

  metrics.forEach((m, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = startX + col * (colW + gapX);
    const y = startY + row * (rowH + gapY);

    // Box fill & border
    pdf.setFillColor(30, 41, 59); // slate 800 card
    pdf.rect(x, y, colW, rowH, 'F');
    pdf.setDrawColor(51, 65, 85); // slate 700 border
    pdf.rect(x, y, colW, rowH, 'S');

    // Text label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184); // slate 400
    pdf.text(m.label, x + 4, y + 5.5);

    // Text val
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255); // white
    pdf.text(m.val, x + 4, y + 13);
  });

  // 3. Hourly Section (Next 8 Hours)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(6, 182, 212);
  pdf.text('HOURLY FORECAST (Next 8 Hours)', 15, 107);
  pdf.line(15, 109, width - 15, 109);

  // Table Headers
  const tableY = 114;
  const colTimesX = 15;
  const colTempsX = 45;
  const colCondX = 75;
  const colHumX = 135;
  const colRainX = 165;

  pdf.setFillColor(30, 41, 59); // slate 800 header row
  pdf.rect(15, tableY, width - 30, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(226, 232, 240); // slate 200
  pdf.text('Time', colTimesX + 4, tableY + 5.5);
  pdf.text('Temperature', colTempsX + 4, tableY + 5.5);
  pdf.text('Condition', colCondX + 4, tableY + 5.5);
  pdf.text('Humidity', colHumX + 4, tableY + 5.5);
  pdf.text('Precip. Prob.', colRainX + 4, tableY + 5.5);

  // Table Rows (Next 8 Hours)
  const now = new Date();
  const hourlyData = hourly.time
    .map((t, i) => ({ time: t, idx: i }))
    .filter(d => new Date(d.time) >= now)
    .slice(0, 8);

  hourlyData.forEach((d, idx) => {
    const rowY = tableY + 8 + idx * 8;
    const isEven = idx % 2 === 0;

    // Alternating slate-900 and gray-900 background colors
    if (isEven) {
      pdf.setFillColor(15, 23, 42); // slate 900
    } else {
      pdf.setFillColor(17, 24, 39); // gray 900
    }
    pdf.rect(15, rowY, width - 30, 8, 'F');

    // Grid row divider
    pdf.setDrawColor(30, 41, 59);
    pdf.line(15, rowY + 8, width - 15, rowY + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(241, 245, 249); // slate 100

    const timeStr = formatHour(d.time, settings.timeFormat);
    const tempStr = `${Math.round(convertTemp(hourly.temperature[d.idx], settings.tempUnit))}°`;
    const hInfo = getWeatherInfo(hourly.weatherCode[d.idx], hourly.isDay[d.idx] === 1);
    const humStr = `${hourly.humidity[d.idx]}%`;
    const rainStr = `${hourly.precipitationProbability[d.idx]}%`;

    pdf.text(timeStr, colTimesX + 4, rowY + 5.5);
    pdf.text(tempStr, colTempsX + 4, rowY + 5.5);
    pdf.text(hInfo.description, colCondX + 4, rowY + 5.5);
    pdf.text(humStr, colHumX + 4, rowY + 5.5);
    pdf.text(rainStr, colRainX + 4, rowY + 5.5);
  });

  // 4. 7-Day Forecast Section
  const dailyY = 192;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(6, 182, 212);
  pdf.text('7-DAY OUTLOOK', 15, dailyY);
  pdf.line(15, dailyY + 2, width - 15, dailyY + 2);

  // Table Headers
  const dTableY = dailyY + 6;
  const colDayX = 15;
  const colDayCondX = 65;
  const colRangeX = 125;
  const colRainMaxX = 165;

  pdf.setFillColor(30, 41, 59); // slate 800
  pdf.rect(15, dTableY, width - 30, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(226, 232, 240);
  pdf.text('Day / Date', colDayX + 4, dTableY + 5.5);
  pdf.text('Condition', colDayCondX + 4, dTableY + 5.5);
  pdf.text('Min / Max Temp', colRangeX + 4, dTableY + 5.5);
  pdf.text('Rain Max', colRainMaxX + 4, dTableY + 5.5);

  // 7 rows
  daily.time.slice(0, 7).forEach((day, idx) => {
    const rowY = dTableY + 8 + idx * 8.5;
    const isEven = idx % 2 === 0;

    if (isEven) {
      pdf.setFillColor(15, 23, 42); // slate 900
    } else {
      pdf.setFillColor(17, 24, 39); // gray 900
    }
    pdf.rect(15, rowY, width - 30, 8.5, 'F');

    pdf.setDrawColor(30, 41, 59);
    pdf.line(15, rowY + 8.5, width - 15, rowY + 8.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(241, 245, 249);

    const dayName = formatDayName(day);
    const dateStr = formatDate(day);
    const hInfo = getWeatherInfo(daily.weatherCode[idx]);
    const minTemp = `${Math.round(convertTemp(daily.temperatureMin[idx], settings.tempUnit))}°`;
    const maxTemp = `${Math.round(convertTemp(daily.temperatureMax[idx], settings.tempUnit))}°`;
    const rainSum = `${daily.precipitationSum[idx].toFixed(1)} mm`;

    pdf.setFont('helvetica', 'bold');
    pdf.text(dayName, colDayX + 4, rowY + 5.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184); // slate 400
    pdf.text(dateStr, colDayX + 25, rowY + 5.5);

    pdf.setFontSize(8.5);
    pdf.setTextColor(241, 245, 249);
    pdf.text(hInfo.description, colDayCondX + 4, rowY + 5.5);
    pdf.text(`${minTemp} / ${maxTemp}`, colRangeX + 4, rowY + 5.5);
    pdf.text(rainSum, colRainMaxX + 4, rowY + 5.5);
  });

  // 5. Footer
  pdf.setFillColor(15, 23, 42); // slate 900
  pdf.rect(0, height - 12, width, 12, 'F');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text('Generated by Nimbus Weather Platform • accurate reactive forecasts • nimbus-weather.app', width / 2, height - 5, { align: 'center' });

  pdf.save(filename);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
