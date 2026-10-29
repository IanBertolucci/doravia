import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';

const WMO_CODES = {
  sunny: [0],
  cloudy: [1, 2, 3],
  fog: [45, 48],
  drizzle: [51, 53, 55, 56, 57],
  rain: [61, 63, 65, 66, 67, 80, 81, 82],
  snow: [71, 73, 75, 77, 85, 86],
  storm: [95, 96, 99],
};

function weatherIcon(code) {
  if (WMO_CODES.sunny.includes(code)) return Sun;
  if (WMO_CODES.cloudy.includes(code)) return Cloud;
  if (WMO_CODES.fog.includes(code)) return CloudFog;
  if (WMO_CODES.drizzle.includes(code)) return CloudDrizzle;
  if (WMO_CODES.rain.includes(code)) return CloudRain;
  if (WMO_CODES.snow.includes(code)) return CloudSnow;
  return CloudLightning;
}

function buildTimeline(cities) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const entries = [];

  cities.forEach((city) => {
    (city.days || []).forEach((day) => {
      const dateStr = day.date;
      if (dateStr && dateStr >= todayStr) {
        entries.push({
          date: new Date(dateStr + 'T12:00:00'),
          dateStr,
          cityName: city.name,
          label: day.label,
        });
      }
    });
  });

  entries.sort((a, b) => a.date - b.date);

  const seen = new Set();
  const unique = [];
  for (const e of entries) {
    const key = e.dateStr;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(e);
  }

  return unique.slice(0, 7);
}

async function geocode(cityName) {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt`,
    );
    const data = await res.json();
    if (data.results?.[0]) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
  } catch {}
  return null;
}

async function fetchDailyWeather(lat, lon, startDate, endDate) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
        `&timezone=auto&start_date=${startDate}&end_date=${endDate}`,
    );
    const data = await res.json();
    if (data.daily) {
      const map = {};
      data.daily.time.forEach((dateStr, i) => {
        map[dateStr] = {
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          code: data.daily.weather_code[i],
          precip: data.daily.precipitation_probability_max[i],
        };
      });
      return map;
    }
  } catch {}
  return null;
}

async function fetchTimelineWeather(timeline) {
  const uniqueCities = [...new Set(timeline.map((e) => e.cityName))];
  const coordsMap = {};

  for (const name of uniqueCities) {
    const coords = await geocode(name);
    if (coords) coordsMap[name] = coords;
  }

  const cityEntries = {};
  timeline.forEach((e) => {
    if (!cityEntries[e.cityName]) cityEntries[e.cityName] = [];
    cityEntries[e.cityName].push(e);
  });

  const weatherMap = {};

  for (const [cityName, entries] of Object.entries(cityEntries)) {
    const coords = coordsMap[cityName];
    if (!coords) continue;

    const dates = entries.map((e) => e.dateStr);
    const daily = await fetchDailyWeather(coords.lat, coords.lon, dates[0], dates[dates.length - 1]);
    if (daily) Object.assign(weatherMap, daily);
  }

  return timeline
    .map((e) => {
      const w = weatherMap[e.dateStr];
      return w ? { ...e, ...w } : null;
    })
    .filter(Boolean);
}

export default function WeatherForecast({ cities }) {
  const [itinerary, setItinerary] = useState(null);
  const [fallback, setFallback] = useState(null);

  useEffect(() => {
    setItinerary(null);
    setFallback(null);

    if (!cities || cities.length === 0) {
      setItinerary([]);
      return;
    }

    let cancelled = false;

    async function load() {
      const timeline = buildTimeline(cities);

      if (timeline.length > 0) {
        const result = await fetchTimelineWeather(timeline);
        if (cancelled) return;
        if (result.length > 0) {
          setItinerary(result);
          return;
        }
      }

      const firstCity = cities[0];
      if (!firstCity) {
        if (!cancelled) setItinerary([]);
        return;
      }

      const coords = await geocode(firstCity.name);
      if (!coords || cancelled) {
        if (!cancelled) setItinerary([]);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const daily = await fetchDailyWeather(coords.lat, coords.lon, today, today);
      if (cancelled) return;

      if (daily && daily[today]) {
        setFallback({ cityName: firstCity.name, ...daily[today] });
      } else {
        setItinerary([]);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [cities]);

  if (itinerary === null && fallback === null) {
    return (
      <div className="bg-card rounded-xl border border-custom p-4 mb-6">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
          Previsão do Tempo
        </h3>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 min-w-[100px] bg-elevated rounded-lg p-3 text-center animate-pulse">
              <div className="h-3 bg-muted/20 rounded mx-auto mb-2 w-14" />
              <div className="h-2 bg-muted/20 rounded mx-auto mb-3 w-12" />
              <div className="h-5 w-5 bg-muted/20 rounded-full mx-auto mb-2" />
              <div className="h-5 bg-muted/20 rounded mx-auto w-10" />
              <div className="h-2 bg-muted/20 rounded mx-auto mt-1 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (itinerary && itinerary.length > 0) {
    return (
      <div className="bg-card rounded-xl border border-custom p-4 mb-6">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
          Previsão do Tempo — Roteiro
        </h3>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
          {itinerary.map((entry) => {
            const Icon = weatherIcon(entry.code);
            return (
              <div key={entry.dateStr} className="flex-1 min-w-[100px] bg-elevated rounded-lg p-3 text-center">
                <p className="text-[11px] text-secondary font-medium">{entry.label}</p>
                <p className="text-[10px] text-muted mb-1.5">{entry.cityName}</p>
                <Icon size={20} className="mx-auto mb-1 text-blue-400" />
                <p className="text-sm font-bold text-primary">{entry.tempMax}°C</p>
                <p className="text-[10px] text-muted">{entry.tempMin}°C</p>
                {entry.precip > 0 && (
                  <p className="text-[10px] text-blue-400">{entry.precip}% chuva</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (fallback) {
    const Icon = weatherIcon(fallback.code);
    return (
      <div className="bg-card rounded-xl border border-custom p-4 mb-6">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
          Previsão do Tempo — {fallback.cityName}
        </h3>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 bg-elevated rounded-lg p-4 text-center">
            <p className="text-[11px] text-secondary font-medium mb-1">Hoje</p>
            <p className="text-[10px] text-muted mb-2">{fallback.cityName}</p>
            <Icon size={28} className="mx-auto mb-2 text-blue-400" />
            <p className="text-xl font-bold text-primary">{fallback.tempMax}°C</p>
            <p className="text-xs text-muted">{fallback.tempMin}°C</p>
            {fallback.precip > 0 && (
              <p className="text-xs text-blue-400 mt-1">{fallback.precip}% chuva</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
