## ADDED Requirements

### Requirement: Get forecast data

The system SHALL provide a `getForecast` API endpoint that reads the "財務預估" worksheet and returns structured JSON containing all six sections: baseParams, versionParams, income, expense, pnl, and profitShare.

#### Scenario: Successful forecast data retrieval

- **WHEN** the API receives action=getForecast
- **THEN** it returns all sections with labels, values, and row references from the "財務預估" worksheet

#### Scenario: Missing forecast worksheet

- **WHEN** the "財務預估" worksheet does not exist
- **THEN** the API returns an error response indicating the worksheet is missing

### Requirement: Update forecast parameters

The system SHALL provide an `updateForecast` API endpoint that accepts baseParams and versionParams arrays and writes the values back to the corresponding cells in the "財務預估" worksheet.

#### Scenario: Successful parameter update

- **WHEN** the API receives action=updateForecast with modified parameters
- **THEN** it writes each value to the correct cell in the "財務預估" worksheet and returns a success response

#### Scenario: Update with empty payload

- **WHEN** the API receives action=updateForecast with no parameters
- **THEN** it returns an error response indicating no parameters were provided
