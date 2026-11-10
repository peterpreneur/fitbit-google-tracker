import * as document from "document";
import { me as appbit } from "appbit";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { ACTIVITIES } from "../common/activities";
import { formatDuration } from "../common/utils";

const SCREENS = ["shortcuts", "activity", "running", "paused", "summary"];
const $ = (id) => document.getElementById(id);

let selected = null;
let startedAt = 0; // 0 when not running
let accruedMs = 0;
let timer = null;
let hrSum = 0;
let hrCount = 0;
let hrMax = 0;
let calBase = 0;

function show(name) {
  SCREENS.forEach((s) => {
    $(`screen-${s}`).style.display = s === name ? "inline" : "none";
  });
}

function elapsedMs() {
  return accruedMs + (startedAt ? Date.now() - startedAt : 0);
}

function currentCals() {
  if (!appbit.permissions.granted("access_activity")) return 0;
  return Math.max(0, (today.adjusted.calories || 0) - calBase);
}

// Heart rate
let hrm = null;
let latestBpm = 0;
if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
  hrm = new HeartRateSensor({ frequency: 1 });
  hrm.onreading = () => {
    latestBpm = hrm.heartRate || 0;
    if (startedAt && latestBpm > 0) {
      hrSum += latestBpm;
      hrCount += 1;
      hrMax = Math.max(hrMax, latestBpm);
    }
  };
}

function render() {
  $("elapsedRun").text = formatDuration(elapsedMs());
  $("calRun").text = `${Math.round(currentCals())} cals`;
  $("hrRun").text = latestBpm ? `${latestBpm} bpm` : "-- bpm";
}

function startTimer() {
  startedAt = Date.now();
  render();
  timer = setInterval(render, 1000);
  show("running");
}

function pauseTimer() {
  accruedMs = elapsedMs();
  startedAt = 0;
  clearInterval(timer);
  $("elapsedPause").text = formatDuration(accruedMs);
  show("paused");
}

function endActivity() {
  const avg = hrCount ? Math.round(hrSum / hrCount) : 0;
  $("summaryTitle").text = "Nice work!";
  $("sumTime").text = formatDuration(accruedMs);
  $("sumAvg").text = `${avg || "--"} bpm avg`;
  $("sumMax").text = `${hrMax || "--"} bpm max`;
  $("sumCal").text = `${Math.round(currentCals())} cals`;
  if (hrm) hrm.stop();
  show("summary");
}

function reset() {
  selected = null;
  startedAt = 0;
  accruedMs = 0;
  hrSum = hrCount = hrMax = latestBpm = 0;
  show("shortcuts");
}

// Shortcuts list
ACTIVITIES.forEach((a, i) => {
  const row = $(`row-${i}`);
  if (!row) return;
  $(`row-${i}-label`).text = a.name;
  $(`dot-${i}`).style.fill = a.color;
  row.onclick = () => {
    selected = a;
    $("activityTitle").text = a.name;
    show("activity");
  };
});

// Activity screen
$("btn-back").onclick = reset;
$("btn-start").onclick = () => {
  calBase = appbit.permissions.granted("access_activity") ? today.adjusted.calories || 0 : 0;
  if (hrm) hrm.start();
  startTimer();
};

// Running / paused / summary
$("btn-pause").onclick = pauseTimer;
$("btn-resume").onclick = startTimer;
$("btn-end").onclick = endActivity;
$("btn-done").onclick = reset;

show("shortcuts");
