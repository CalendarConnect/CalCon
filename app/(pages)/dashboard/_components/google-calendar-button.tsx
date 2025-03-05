"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Check, Loader2, X } from "lucide-react"
import { getGoogleCalendarToken, checkGoogleCalendarScopes } from "@/app/actions/google-calendar"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { GoogleCalendarScope } from "@/types/google"

const REQUIRED_SCOPES: GoogleCalendarScope[] = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

const SCOPE_DESCRIPTIONS = {
  'calendar': 'Read/write access to Calendars',
  'calendar.readonly': 'Read-only access to Calendars',
  'calendar.events': 'Read/write access to Events',
  'calendar.events.readonly': 'Read-only access to Events',
  'calendar.settings.readonly': 'Read-only access to Settings',
  'calendar.addons.execute': 'Execute as a Calendar add-on',
  'calendar.freebusy': 'Access to free/busy information'
}

export function GoogleCalendarButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [scopes, setScopes] = useState<string[]>([])

  const handleFetchToken = async () => {
    setIsLoading(true)
    try {
      // First check if we have the required scopes
      const scopesResponse = await checkGoogleCalendarScopes()
      
      if (!scopesResponse.success) {
        toast({
          title: "Error checking Google Calendar scopes",
          description: scopesResponse.error || "Please try again later",
          variant: "destructive",
        })
        return
      }

      // If we have scopes, show them
      if (scopesResponse.scopes) {
        setScopes(scopesResponse.scopes)
      }

      // Now get the token
      const response = await getGoogleCalendarToken()
      
      if (!response.success) {
        toast({
          title: "Error fetching Google Calendar token",
          description: response.error || "Please try again later",
          variant: "destructive",
        })
        return
      }

      // Store token and show success message
      setToken(response.token)
      
      toast({
        title: "Success!",
        description: "Google Calendar token fetched successfully",
        variant: "default",
      })

      // Log scopes for debugging
      console.log("Google Calendar scopes:", response.scopes)
      
    } catch (error) {
      console.error("Error fetching Google Calendar token:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Google Calendar token",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getScopeInfo = (scope: string) => {
    const shortName = scope.split('/').pop() || ''
    const description = SCOPE_DESCRIPTIONS[shortName as keyof typeof SCOPE_DESCRIPTIONS] || 'Unknown scope'
    const isGranted = scopes.includes(scope)
    const isRequired = REQUIRED_SCOPES.includes(scope as GoogleCalendarScope)
    return { shortName, description, isGranted, isRequired }
  }

  return (
    <Card className="w-[500px]">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleFetchToken} 
            disabled={isLoading}
            variant={token ? "outline" : "default"}
            className="gap-2 h-12 text-lg w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : token ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Calendar className="h-5 w-5" />
            )}
            {token ? "Google Calendar Connected" : "Connect Google Calendar"}
          </Button>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground mb-1">Status</p>
              <div className={token ? "text-green-500 font-medium" : "text-yellow-500 font-medium"}>
                {token ? "Connected" : "Not Connected"}
              </div>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">Scopes</p>
              <div className="space-y-3">
                {Object.values(REQUIRED_SCOPES).map((scope) => {
                  const { shortName, description, isGranted, isRequired } = getScopeInfo(scope)
                  return (
                    <div key={scope} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                      {isGranted ? (
                        <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{shortName}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                        {isRequired && !isGranted && (
                          <p className="text-xs text-red-500 mt-1">Required for full functionality</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {token && (
              <div>
                <p className="font-medium text-foreground mb-1">Token</p>
                <p className="font-mono text-xs break-all bg-muted/50 p-2 rounded">{token}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
