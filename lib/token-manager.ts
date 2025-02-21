import { auth } from "@clerk/nextjs";

interface TokenInfo {
    token: string;
    expiresAt: number;
}

class TokenManager {
    private static instance: TokenManager;
    private tokenCache: Map<string, TokenInfo>;
    private refreshPromises: Map<string, Promise<string>>;

    private constructor() {
        this.tokenCache = new Map();
        this.refreshPromises = new Map();
    }

    static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    private isTokenExpired(tokenInfo: TokenInfo): boolean {
        // Consider token expired if less than 5 minutes remaining
        return Date.now() >= (tokenInfo.expiresAt - 5 * 60 * 1000);
    }

    async getToken(template: string): Promise<string> {
        const cachedToken = this.tokenCache.get(template);
        
        if (cachedToken && !this.isTokenExpired(cachedToken)) {
            return cachedToken.token;
        }

        // Check if a refresh is already in progress
        let refreshPromise = this.refreshPromises.get(template);
        if (refreshPromise) {
            return refreshPromise;
        }

        // Start new refresh
        refreshPromise = this.refreshToken(template);
        this.refreshPromises.set(template, refreshPromise);

        try {
            const token = await refreshPromise;
            return token;
        } finally {
            this.refreshPromises.delete(template);
        }
    }

    private async refreshToken(template: string): Promise<string> {
        const { getToken } = auth();
        const token = await getToken({ template });
        
        if (!token) {
            throw new Error(`Failed to refresh token for template: ${template}`);
        }

        // Cache the new token with expiration
        this.tokenCache.set(template, {
            token,
            // Set expiration to 55 minutes (Google tokens typically last 60 minutes)
            expiresAt: Date.now() + 55 * 60 * 1000
        });

        return token;
    }

    clearCache(template?: string) {
        if (template) {
            this.tokenCache.delete(template);
            this.refreshPromises.delete(template);
        } else {
            this.tokenCache.clear();
            this.refreshPromises.clear();
        }
    }
}

export const tokenManager = TokenManager.getInstance();
