/**
 * Google Calendar OAuth scopes
 * @see https://developers.google.com/calendar/api/auth
 */
export type GoogleCalendarScope = 
  | 'https://www.googleapis.com/auth/calendar' // Read/write access to Calendars
  | 'https://www.googleapis.com/auth/calendar.readonly' // Read-only access to Calendars
  | 'https://www.googleapis.com/auth/calendar.events' // Read/write access to Events
  | 'https://www.googleapis.com/auth/calendar.events.readonly' // Read-only access to Events
  | 'https://www.googleapis.com/auth/calendar.settings.readonly' // Read-only access to Settings
  | 'https://www.googleapis.com/auth/calendar.addons.execute' // Execute as a Calendar add-on
  | 'https://www.googleapis.com/auth/calendar.freebusy' // Access to free/busy information

/**
 * Response from Google Calendar token request
 */
export interface GoogleCalendarTokenResponse {
  success: boolean
  token?: string
  provider?: string
  scopes?: string[]
  error?: string
}

/**
 * Response from Google Calendar scopes check
 */
export interface GoogleCalendarScopesResponse {
  success: boolean
  hasRequiredScopes: boolean
  scopes?: string[]
  missingScopes?: string[]
  error?: string
}
