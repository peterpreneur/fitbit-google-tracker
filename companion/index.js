import * as messaging from "messaging";
import { settingsStorage } from "settings";

const GOOGLE_HEALTH_API = "https://health.googleapis.com/v4/users/me";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };
}

// Fetch a dailyRollUp for the given data type for today
async function fetchDailyRollUp(accessToken, dataType) {
  const now = new Date();
  const start = {
    date: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() },
    time: { hours: 0, minutes: 0, seconds: 0, nanos: 0 },
  };
  // end = start + 1 day
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const end = {
    date: {
      year: tomorrow.getFullYear(),
      month: tomorrow.getMonth() + 1,
      day: tomorrow.getDate(),
    },
    time: { hours: 0, minutes: 0, seconds: 0, nanos: 0 },
  };

  const response = await fetch(
    `${GOOGLE_HEALTH_API}/dataTypes/${dataType}/dataPoints:dailyRollUp`,
    {
      method: "POST",
      headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
      body: JSON.stringify({ range: { start, end }, windowSizeDays: 1 }),
    }
  );

  if (!response.ok) {
    console.error(`dailyRollUp ${dataType} failed:`, response.status);
    return null;
  }
  return response.json();
}

// Fetch the most recent heart-rate sample points for today
async function fetchHeartRateToday(accessToken) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filter = `heart_rate.sample_time.physical_time >= "${today}T00:00:00Z"`;
  const url =
    `${GOOGLE_HEALTH_API}/dataTypes/heart-rate/dataPoints` +
    `?filter=${encodeURIComponent(filter)}&page_size=1`;

  const response = await fetch(url, { headers: authHeaders(accessToken) });
  if (!response.ok) {
    console.error("heart-rate fetch failed:", response.status);
    return null;
  }
  return response.json();
}

// Extract the latest heart rate BPM from a heart-rate list response
function extractLatestBpm(hrData) {
  const points = hrData?.dataPoints;
  if (!points?.length) return null;
  // dataPoints are newest-first when filtered by sample_time descending
  return points[0]?.heartRate?.beatsPerMinute ?? null;
}

// Extract today's total step count from a dailyRollUp response
function extractSteps(rollUpData) {
  const points = rollUpData?.dataPoints;
  if (!points?.length) return null;
  return points[0]?.steps?.count ?? null;
}

// Extract today's active energy burned (kcal) from a dailyRollUp response
function extractCalories(rollUpData) {
  const points = rollUpData?.dataPoints;
  if (!points?.length) return null;
  return points[0]?.activeEnergyBurned?.kcal ?? null;
}

async function fetchAndRelay(accessToken) {
  try {
    const [stepsData, caloriesData, hrData] = await Promise.all([
      fetchDailyRollUp(accessToken, "steps"),
      fetchDailyRollUp(accessToken, "active-energy-burned"),
      fetchHeartRateToday(accessToken),
    ]);

    sendToDevice("googleData", {
      steps: extractSteps(stepsData),
      heartRate: extractLatestBpm(hrData),
      calories: extractCalories(caloriesData),
    });
  } catch (err) {
    console.error("fetchAndRelay error:", err);
  }
}

function sendToDevice(key, value) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ key, value });
  }
}

settingsStorage.onchange = (evt) => {
  if (evt.key === "accessToken" && evt.newValue) {
    fetchAndRelay(JSON.parse(evt.newValue));
  }
};

messaging.peerSocket.onopen = () => {
  const tokenSetting = settingsStorage.getItem("accessToken");
  if (tokenSetting) {
    fetchAndRelay(JSON.parse(tokenSetting));
  }
};

messaging.peerSocket.onerror = (err) => {
  console.error("Companion messaging error:", err.code, err.message);
};
