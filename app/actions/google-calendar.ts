'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { GoogleCalendarScope } from '@/types/google';

/**
 * Fetches the Google OAuth access token for the current user
 * This token can be used to access Google Calendar API
 */
export async function getGoogleCalendarToken() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    try {
      const user = await clerkClient.users.getUser(userId);
      const tokens = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_google');
      if (!tokens || tokens.length === 0) {
        return {
          success: false,
          error: 'No Google account connected'
        };
      }
      
      const googleToken = tokens[0];
      return {
        success: true,
        token: googleToken.token,
        scopes: googleToken.scopes || [],
      };
    } catch (error) {
      console.error('Error fetching Google token:', error);
      return {
        success: false,
        error: 'Error fetching Google Calendar token'
      };
    }
  } catch (error) {
    console.error('[GOOGLE CALENDAR ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get token'
    };
  }
}

/**
 * Checks if the user has the required Google Calendar scopes
 */
export async function checkGoogleCalendarScopes() {
  try {
    const tokenResponse = await getGoogleCalendarToken();
    
    if (!tokenResponse.success) {
      return {
        success: false,
        hasRequiredScopes: false,
        error: tokenResponse.error,
      };
    }
    
    // Required scopes for Google Calendar integration
    const requiredScopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
      'https://www.googleapis.com/auth/calendar.freebusy'
    ];
    
    // Check if all required scopes are present
    const hasAllScopes = requiredScopes.every(scope => 
      tokenResponse.scopes.includes(scope)
    );
    
    return {
      success: true,
      hasRequiredScopes: hasAllScopes,
      scopes: tokenResponse.scopes,
      missingScopes: hasAllScopes ? [] : requiredScopes.filter(scope => !tokenResponse.scopes.includes(scope)),
    };
  } catch (error) {
    console.error('[GOOGLE CALENDAR SCOPES ERROR]', error);
    return {
      success: false,
      hasRequiredScopes: false,
      error: error instanceof Error ? error.message : 'Failed to check Google Calendar scopes',
    };
  }
}
