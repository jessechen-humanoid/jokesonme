# google-sheets-api Specification (delta)

## ADDED Requirements

### Requirement: Forecast structure validation

Before reading or writing forecast data, `getForecast` and `updateForecast` SHALL verify that the anchor cells (section header labels) of the forecast worksheet match the expected labels. On mismatch, the API SHALL return `{ "success": false, "error": "FORECAST_STRUCTURE_MISMATCH", "detail": "<anchor location>" }` and SHALL NOT return or write partially parsed data. When the structure matches, behaviour SHALL be identical to the previous implementation.

#### Scenario: Row inserted into forecast worksheet

- **WHEN** a row has been inserted into the forecast worksheet so that section anchors no longer sit at their expected positions, and `getForecast` is called
- **THEN** the response is `success: false` with error `FORECAST_STRUCTURE_MISMATCH` and a detail naming the failed anchor, and no forecast data is returned

#### Scenario: Intact structure behaves unchanged

- **WHEN** the forecast worksheet structure matches the expected anchors and `getForecast` is called
- **THEN** the response contains the same forecast data shape as before this change

#### Scenario: Write blocked on structure mismatch

- **WHEN** the forecast worksheet structure does not match and `updateForecast` is called
- **THEN** no cell is written and the response is `success: false` with error `FORECAST_STRUCTURE_MISMATCH`
