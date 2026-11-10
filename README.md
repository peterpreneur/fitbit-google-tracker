# fitbit-google-tracker

A Fitbit OS app that surfaces Google Health API data on your Fitbit device.

## Structure

```
fitbit-google-tracker/
├── app/
│   └── index.js          # Device-side logic (runs on watch, JerryScript engine)
├── companion/
│   └── index.js          # Phone-side logic (fetches Google Health API)
├── common/
│   └── utils.js          # Shared utilities (app + companion)
├── resources/
│   ├── index.view        # SVG UI layout
│   ├── widget.defs       # System widget imports
│   └── styles.css        # UI styles
├── settings/
│   └── index.jsx         # Settings page (React JSX, runs in Fitbit mobile app)
└── package.json          # App manifest + build config
```

## Prerequisites

- Node.js 14 (`nvm install 14 && nvm use 14`)
- Fitbit mobile app (iOS or Android)
- Fitbit device (Versa 3 / Sense = SDK 5; Versa / Versa 2 = SDK 4)

## Setup

```bash
npm install
```

## Development

Open the interactive Fitbit CLI:

```bash
npx fitbit
```

Then inside the shell:

```
fitbit$ build
fitbit$ install
```

Or build and install in one step:

```
fitbit$ bi
```

## Google Health API

The companion fetches data from the **new** Google Health API (`health.googleapis.com/v4`):

| Data | Endpoint | Method |
|---|---|---|
| Steps | `dataTypes/steps/dataPoints:dailyRollUp` | POST |
| Calories burned | `dataTypes/active-energy-burned/dataPoints:dailyRollUp` | POST |
| Heart rate (latest) | `dataTypes/heart-rate/dataPoints` | GET |

### Required OAuth scopes

- `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly`
- `https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly`

Generate a token at the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) and paste it in the app's Settings page inside the Fitbit mobile app.

> **Note:** The legacy Google Fitness API (`googleapis.com/fitness/v1`) and legacy Fitbit Web API are both shutting down on **November 2, 2026**. This project uses the new Google Health API.

## Notes

- Maximum install size: 10 MB
- `appUUID` in `package.json` must be unique — regenerate before publishing to the Fitbit Gallery
- SDK 5 (`higgs` = Sense, `mira` = Versa 3) and SDK 4 targets require separate published listings
