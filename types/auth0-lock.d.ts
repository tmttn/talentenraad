declare module 'auth0-lock' {
	type Auth0LockOptions = {
		[key: string]: unknown;
		container?: string;
		auth?: {
			redirectUrl?: string;
			responseType?: string;
			params?: {
				[key: string]: unknown;
				scope?: string;
				state?: string;
			};
		};
		theme?: {
			logo?: string;
			primaryColor?: string;
			authButtons?: Record<string, {
				displayName?: string;
				primaryColor?: string;
				foregroundColor?: string;
				icon?: string;
			}>;
		};
		languageDictionary?: Record<string, unknown>;
		language?: string;
		closable?: boolean;
		allowSignUp?: boolean;
		allowShowPassword?: boolean;
		rememberLastLogin?: boolean;
		avatar?: undefined | {
			url?: (email: string, cb: (error: Error | undefined, url?: string) => void) => void;
			displayName?: (email: string, cb: (error: Error | undefined, name?: string) => void) => void;
		};
		additionalSignUpFields?: Array<{
			name: string;
			placeholder: string;
			validator?: (value: string) => {valid: boolean; hint?: string};
		}>;
	};

	type AuthResult = {
		accessToken?: string;
		idToken?: string;
		idTokenPayload?: Record<string, unknown>;
		expiresIn?: number;
		state?: string;
	};

	type AuthError = {
		[key: string]: unknown;
		error: string;
		errorDescription?: string;
		code?: string;
		original?: Error;
	};

	class Auth0Lock {
		constructor(clientId: string, domain: string, options?: Auth0LockOptions);
		show(): void;
		hide(): void;
		destroy(): void;
		on(event: 'authenticated', callback: (authResult: AuthResult) => void): void;
		on(event: 'authorization_error' | 'unrecoverable_error', callback: (error: AuthError) => void): void;
		on(event: 'hide' | 'show', callback: () => void): void;
		on(event: string, callback: (...args: unknown[]) => void): void;
		getProfile(accessToken: string, callback: (error: Error | undefined, profile: Record<string, unknown>) => void): void;
		getUserInfo(accessToken: string, callback: (error: Error | undefined, profile: Record<string, unknown>) => void): void;
		checkSession(options: Record<string, unknown>, callback: (error: Error | undefined, authResult: AuthResult) => void): void;
		logout(options?: {returnTo?: string}): void;
	}

	export default Auth0Lock;
}
