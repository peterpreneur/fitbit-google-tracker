function GoogleTrackerSettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Google Health API</Text>}
      >
        <TextInput
          label="Google OAuth Access Token"
          settingsKey="accessToken"
          placeholder="Paste your access token here"
          type="password"
        />
        <Text>
          Generate a token via the Google OAuth 2.0 Playground
          (oauth2.googleapis.com/token) or your own OAuth flow. Required scopes:
          {"\n"}• https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly
          {"\n"}• https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly
        </Text>
      </Section>

      <Section title={<Text bold align="center">Display</Text>}>
        <Toggle
          label="24-Hour Clock"
          settingsKey="use24h"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(GoogleTrackerSettings);
