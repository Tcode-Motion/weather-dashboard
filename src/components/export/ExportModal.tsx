/* ───────────────────────────────────────────────────
 *  ExportModal — Export & Preview Modal Panel
 * ─────────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, FileSpreadsheet, Braces, Copy, Download, Share2, Eye, Info } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import { exportPDF, exportCSV, exportJSON, generateWeatherReport, copyToClipboard, shareWeather } from '../../utils/export';
import { convertTemp, tempUnitLabel, convertWind, windUnitLabel, convertPressure, pressureUnitLabel } from '../../utils/units';
import { getWeatherInfo } from '../../utils/weatherCodes';
import { formatDate, formatDayName, formatHour, getUVLabel } from '../../utils/formatters';
import { useToast } from '../ui/Toast';
import './ExportModal.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'csv' | 'json' | 'text';

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { weatherData } = useWeather();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [downloading, setDownloading] = useState(false);

  if (!weatherData) return null;

  const { current, location, daily, hourly } = weatherData;
  const tempLabel = tempUnitLabel(settings.tempUnit);
  const windLabel = windUnitLabel(settings.windUnit);
  const pressureLabel = pressureUnitLabel(settings.pressureUnit);
  const info = getWeatherInfo(current.weatherCode, current.isDay);

  const handleAction = async () => {
    const filename = `nimbus-weather-${location.name}`;
    setDownloading(true);
    try {
      if (format === 'pdf') {
        await exportPDF(weatherData, settings, `${filename}.pdf`);
        showToast('PDF Weather Report downloaded!', 'success');
      } else if (format === 'csv') {
        exportCSV(weatherData, settings);
        showToast('CSV Hourly Data downloaded!', 'success');
      } else if (format === 'json') {
        exportJSON(weatherData);
        showToast('JSON Raw Data downloaded!', 'success');
      } else if (format === 'text') {
        const textReport = generateWeatherReport(weatherData, settings);
        const ok = await copyToClipboard(textReport);
        showToast(ok ? 'Report copied to clipboard!' : 'Copy failed', ok ? 'success' : 'error');
      }
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareWeather(weatherData, settings);
      showToast('Report shared successfully!', 'success');
    } catch {
      showToast('Share failed.', 'error');
    }
  };

  // Pre-calculate preview values
  const tempVal = Math.round(convertTemp(current.temperature, settings.tempUnit));
  const feelsVal = Math.round(convertTemp(current.feelsLike, settings.tempUnit));
  const windVal = convertWind(current.windSpeed, settings.windUnit).toFixed(1);
  const pressVal = convertPressure(current.pressure, settings.pressureUnit).toFixed(0);
  const uvInfo = getUVLabel(current.uvIndex);

  const textReportPreview = generateWeatherReport(weatherData, settings);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="export-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="export-modal glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Export weather report"
          >
            {/* Header */}
            <div className="export-header">
              <div className="export-title-group">
                <Eye size={18} className="export-header-icon" />
                <h2>Export Weather Report</h2>
              </div>
              <button className="export-close-btn" onClick={onClose} aria-label="Close export modal">
                <X size={18} />
              </button>
            </div>

            {/* Content dual-pane */}
            <div className="export-body">
              {/* Left Column: Interactive Document Preview */}
              <div className="export-preview-column">
                <span className="export-preview-label">Document Preview</span>
                <div className="export-preview-wrapper scrollbar-thin">
                  {format === 'pdf' && (
                    <div className="pdf-page-mock">
                      {/* PDF Header Strip */}
                      <div className="pdf-header-mock">
                        <div className="pdf-header-left">
                          <span className="pdf-title-mock">NIMBUS WEATHER REPORT</span>
                          <span className="pdf-subtitle-mock">{location.name}, {location.admin1 ? location.admin1 + ', ' : ''}{location.country}</span>
                          <span className="pdf-time-mock">Generated: {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="pdf-header-right">
                          <span className="pdf-temp-mock">{tempVal}{tempLabel}</span>
                          <span className="pdf-cond-mock">{info.description}</span>
                        </div>
                      </div>

                      {/* PDF Grid Cards */}
                      <span className="pdf-section-title-mock">CURRENT CONDITIONS</span>
                      <div className="pdf-grid-mock">
                        <div className="pdf-card-mock">
                          <span className="pdf-card-label-mock">FEELS LIKE</span>
                          <span className="pdf-card-val-mock">{feelsVal}{tempLabel}</span>
                        </div>
                        <div className="pdf-card-mock">
                          <span className="pdf-card-label-mock">HUMIDITY</span>
                          <span className="pdf-card-val-mock">{current.humidity}%</span>
                        </div>
                        <div className="pdf-card-mock">
                          <span className="pdf-card-label-mock">WIND SPEED</span>
                          <span className="pdf-card-val-mock">{windVal} {windLabel}</span>
                        </div>
                        <div className="pdf-card-mock">
                          <span className="pdf-card-label-mock">ATM. PRESSURE</span>
                          <span className="pdf-card-val-mock">{pressVal} {pressureLabel}</span>
                        </div>
                        <div className="pdf-card-mock">
                          <span className="pdf-card-label-mock">UV INDEX</span>
                          <span className="pdf-card-val-mock">{current.uvIndex} ({uvInfo.label})</span>
                        </div>
                        <div className="pdf-card-mock">
                          <span className="pdf-card-label-mock">CLOUD COVER</span>
                          <span className="pdf-card-val-mock">{current.cloudCover}%</span>
                        </div>
                      </div>

                      {/* PDF Tables */}
                      <span className="pdf-section-title-mock">HOURLY FORECAST (Next 8 Hours)</span>
                      <table className="pdf-table-mock">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Temp</th>
                            <th>Condition</th>
                            <th>Humidity</th>
                            <th>Rain %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hourly.time.slice(0, 8).map((t, idx) => {
                            const timeStr = formatHour(t, settings.timeFormat);
                            const hTemp = Math.round(convertTemp(hourly.temperature[idx], settings.tempUnit));
                            const hInfo = getWeatherInfo(hourly.weatherCode[idx], hourly.isDay[idx] === 1);
                            return (
                              <tr key={t}>
                                <td>{timeStr}</td>
                                <td>{hTemp}°</td>
                                <td>{hInfo.description}</td>
                                <td>{hourly.humidity[idx]}%</td>
                                <td>{hourly.precipitationProbability[idx]}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* PDF 7 Day */}
                      <span className="pdf-section-title-mock">7-DAY OUTLOOK</span>
                      <table className="pdf-table-mock">
                        <thead>
                          <tr>
                            <th>Day / Date</th>
                            <th>Condition</th>
                            <th>Min/Max Temp</th>
                            <th>Rain Max</th>
                          </tr>
                        </thead>
                        <tbody>
                          {daily.time.slice(0, 7).map((d, idx) => {
                            const dayName = formatDayName(d);
                            const dateStr = formatDate(d);
                            const dMin = Math.round(convertTemp(daily.temperatureMin[idx], settings.tempUnit));
                            const dMax = Math.round(convertTemp(daily.temperatureMax[idx], settings.tempUnit));
                            const dInfo = getWeatherInfo(daily.weatherCode[idx]);
                            return (
                              <tr key={d}>
                                <td><strong>{dayName}</strong> <span style={{ fontSize: '9px', color: '#64748b' }}>{dateStr}</span></td>
                                <td>{dInfo.description}</td>
                                <td>{dMin}° / {dMax}°</td>
                                <td>{daily.precipitationSum[idx].toFixed(1)} mm</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* PDF Footer Strip */}
                      <div className="pdf-footer-mock">
                        Generated by Nimbus Weather Platform • accurate reactive forecasts • nimbus-weather.app
                      </div>
                    </div>
                  )}

                  {format === 'csv' && (
                    <div className="code-preview-mock">
                      <pre>
                        {`Time,Temperature (${tempLabel}),Humidity (%),Wind Speed (${windLabel}),Pressure (${pressureLabel}),Precipitation (mm),Weather Condition\n`}
                        {hourly.time.slice(0, 10).map((t, idx) => {
                          const hTemp = convertTemp(hourly.temperature[idx], settings.tempUnit).toFixed(1);
                          const hWind = convertWind(hourly.windSpeed[idx], settings.windUnit).toFixed(1);
                          const hPress = convertPressure(hourly.pressure[idx], settings.pressureUnit).toFixed(0);
                          const hInfo = getWeatherInfo(hourly.weatherCode[idx], hourly.isDay[idx] === 1);
                          return `${t},${hTemp},${hourly.humidity[idx]},${hWind},${hPress},${hourly.precipitation[idx]},${hInfo.description}\n`;
                        })}
                        {`...\n`}
                      </pre>
                    </div>
                  )}

                  {format === 'json' && (
                    <div className="code-preview-mock">
                      <pre>
                        {JSON.stringify(
                          {
                            location: {
                              name: location.name,
                              country: location.country,
                              latitude: location.latitude,
                              longitude: location.longitude,
                            },
                            current: {
                              temperature: current.temperature,
                              humidity: current.humidity,
                              windSpeed: current.windSpeed,
                              weatherCode: current.weatherCode,
                            },
                          },
                          null,
                          2
                        )}
                        {`\n// (Truncated preview for legibility)`}
                      </pre>
                    </div>
                  )}

                  {format === 'text' && (
                    <div className="code-preview-mock">
                      <pre>{textReportPreview}</pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Controls */}
              <div className="export-controls-column">
                <span className="export-preview-label">Export Preferences</span>
                <div className="export-formats-list">
                  {/* PDF option */}
                  <button
                    className={`export-format-btn ${format === 'pdf' ? 'active-format' : ''}`}
                    onClick={() => setFormat('pdf')}
                  >
                    <div className="format-icon-box pdf-icon"><FileText size={18} /></div>
                    <div className="format-text">
                      <strong>PDF Document Report</strong>
                      <span>Fully structured, beautifully designed print-ready weather outlook.</span>
                    </div>
                  </button>

                  {/* CSV option */}
                  <button
                    className={`export-format-btn ${format === 'csv' ? 'active-format' : ''}`}
                    onClick={() => setFormat('csv')}
                  >
                    <div className="format-icon-box csv-icon"><FileSpreadsheet size={18} /></div>
                    <div className="format-text">
                      <strong>CSV Spreadsheet Data</strong>
                      <span>Raw 48-hour hourly weather forecast data formatted for spreadsheets.</span>
                    </div>
                  </button>

                  {/* JSON option */}
                  <button
                    className={`export-format-btn ${format === 'json' ? 'active-format' : ''}`}
                    onClick={() => setFormat('json')}
                  >
                    <div className="format-icon-box json-icon"><Braces size={18} /></div>
                    <div className="format-text">
                      <strong>JSON API Payload</strong>
                      <span>Raw JSON data structure including current, hourly, and daily metrics.</span>
                    </div>
                  </button>

                  {/* Text Copy option */}
                  <button
                    className={`export-format-btn ${format === 'text' ? 'active-format' : ''}`}
                    onClick={() => setFormat('text')}
                  >
                    <div className="format-icon-box copy-icon"><Copy size={18} /></div>
                    <div className="format-text">
                      <strong>Copy Text Report</strong>
                      <span>Simple text weather report containing standard temperature and metrics.</span>
                    </div>
                  </button>
                </div>

                {/* Info Card */}
                <div className="export-info-box">
                  <Info size={14} className="info-icon" />
                  <span>
                    {format === 'pdf' && 'PDF uses standard A4 measurements and generates vectors for high-quality printing.'}
                    {format === 'csv' && `CSV speeds up ingestion into Excel/Numbers and converts values into ${tempLabel} and ${windLabel}.`}
                    {format === 'json' && 'JSON matches standard API formats for quick developer inspection.'}
                    {format === 'text' && 'Copy formatted text report directly to paste in email, Slack, or messages.'}
                  </span>
                </div>

                {/* Actions */}
                <div className="export-actions-row">
                  {format === 'text' ? (
                    <button className="export-btn-primary" onClick={handleAction}>
                      <Copy size={16} /> Copy to Clipboard
                    </button>
                  ) : (
                    <button className="export-btn-primary" onClick={handleAction} disabled={downloading}>
                      <Download size={16} className={downloading ? 'animate-spin' : ''} />
                      {downloading ? 'Exporting...' : 'Download File'}
                    </button>
                  )}

                  <button className="export-btn-secondary" onClick={handleShare}>
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
