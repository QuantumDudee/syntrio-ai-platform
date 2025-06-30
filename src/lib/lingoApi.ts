interface TranslationRequest {
  text: string;
  target_language: string;
  source_language?: string;
}

interface TranslationResponse {
  success: boolean;
  translated_text?: string;
  error?: string;
  detected_language?: string;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

class LingoAPI {
  private readonly baseUrl = '/lingo-api/translate';
  private readonly timeout = 10000; // 10 seconds
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds
  private readonly rateLimit = 100; // requests per hour
  
  // Pre-filled API key for hackathon demo
  private apiKey: string = 'api_ny5e7kxzlr5nvstism5qm5m1';
  private requestCount = 0;
  private lastResetTime = Date.now();

  // Top 10 supported languages with ISO codes
  private readonly supportedLanguages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' }
  ];

  setApiKey(apiKey: string): void {
    // Keep the pre-filled key for demo purposes
    console.log('🔑 Lingo API key is pre-configured for demo');
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  isConfigured(): boolean {
    // Always return true since we have a pre-filled key
    return true;
  }

  // Mask API key for logging
  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length <= 8) return '***';
    return `${apiKey.substring(0, 4)}${'*'.repeat(Math.max(0, apiKey.length - 8))}${apiKey.substring(apiKey.length - 4)}`;
  }

  getSupportedLanguages(): LanguageOption[] {
    return this.supportedLanguages;
  }

  getLanguageByCode(code: string): LanguageOption | undefined {
    return this.supportedLanguages.find(lang => lang.code === code);
  }

  // Rate limiting check
  private checkRateLimit(): boolean {
    const now = Date.now();
    const hoursPassed = (now - this.lastResetTime) / (1000 * 60 * 60);
    
    if (hoursPassed >= 1) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    const withinLimit = this.requestCount < this.rateLimit;
    console.log('⏱️ Lingo rate limit check:', { requestCount: this.requestCount, limit: this.rateLimit, withinLimit });
    return withinLimit;
  }

  // Validate translation request
  private validateRequest(request: TranslationRequest): { valid: boolean; error?: string } {
    console.log('🔍 Validating translation request:', {
      text_length: request.text?.length || 0,
      target_language: request.target_language,
      source_language: request.source_language
    });

    if (!request.text || request.text.trim().length === 0) {
      console.error('❌ Validation failed: Text content is required');
      return { valid: false, error: 'Text content is required for translation' };
    }

    if (request.text.length > 1000) {
      console.error('❌ Validation failed: Text too long:', request.text.length);
      return { valid: false, error: 'Text content exceeds maximum length of 1000 characters' };
    }

    if (!request.target_language) {
      console.error('❌ Validation failed: Target language is required');
      return { valid: false, error: 'Target language is required' };
    }

    const targetLang = this.getLanguageByCode(request.target_language);
    if (!targetLang) {
      console.error('❌ Validation failed: Unsupported target language:', request.target_language);
      return { valid: false, error: 'Unsupported target language' };
    }

    if (request.source_language) {
      const sourceLang = this.getLanguageByCode(request.source_language);
      if (!sourceLang) {
        console.error('❌ Validation failed: Unsupported source language:', request.source_language);
        return { valid: false, error: 'Unsupported source language' };
      }
    }

    console.log('✅ Translation request validation passed');
    return { valid: true };
  }

  // Make HTTP request with retry logic and detailed logging
  private async makeRequest(
    request: TranslationRequest, 
    apiKey?: string,
    attempt = 1
  ): Promise<TranslationResponse> {
    const keyToUse = this.apiKey; // Always use pre-filled key
    
    console.log(`🌐 Making translation request (attempt ${attempt}/${this.maxRetries + 1})`);

    // Check rate limiting
    if (!this.checkRateLimit()) {
      console.error('❌ Rate limit exceeded');
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Translation request timeout triggered');
      controller.abort();
    }, this.timeout);

    try {
      this.requestCount++;

      const requestHeaders = {
        'Authorization': `Bearer ${keyToUse}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('📤 Translation request details:', {
        url: this.baseUrl,
        headers: {
          ...requestHeaders,
          'Authorization': `Bearer ${this.maskApiKey(keyToUse)}`
        },
        body: {
          text: request.text.substring(0, 100) + (request.text.length > 100 ? '...' : ''),
          target_language: request.target_language,
          source_language: request.source_language
        }
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 Translation response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = 'Translation request failed';
        let responseBody = '';
        
        try {
          responseBody = await response.text();
          console.log('📄 Error response body:', responseBody);
          
          // Try to parse as JSON
          const errorData = JSON.parse(responseBody);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.log('📄 Raw error response (not JSON):', responseBody);
          errorMessage = responseBody || errorMessage;
        }
        
        switch (response.status) {
          case 401:
            errorMessage = 'Invalid API key. Please check your Lingo.dev API key.';
            break;
          case 429:
            errorMessage = 'Rate limit exceeded. Please try again later.';
            break;
          case 400:
            errorMessage = `Invalid request parameters: ${errorMessage}`;
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Lingo.dev service is temporarily unavailable. Please try again later.';
            break;
        }

        console.error('❌ HTTP Error:', {
          status: response.status,
          message: errorMessage,
          responseBody
        });

        // Retry on server errors
        if (response.status >= 500 && attempt <= this.maxRetries) {
          console.log(`🔄 Retrying in ${this.retryDelay * attempt}ms...`);
          await this.delay(this.retryDelay * attempt);
          return this.makeRequest(request, keyToUse, attempt + 1);
        }

        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log('✅ Translation successful:', {
        has_translated_text: !!data.translated_text,
        detected_language: data.detected_language,
        text_length: data.translated_text?.length || 0
      });
      
      if (!data.translated_text) {
        console.error('❌ Invalid response format: missing translated_text');
        return { success: false, error: 'Invalid response format from translation service' };
      }

      return {
        success: true,
        translated_text: data.translated_text,
        detected_language: data.detected_language
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        console.error('❌ Translation request error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });

        if (error.name === 'AbortError') {
          const errorMessage = 'Translation request timed out. Please try again.';
          
          // Retry on timeout
          if (attempt <= this.maxRetries) {
            console.log(`🔄 Retrying after timeout in ${this.retryDelay * attempt}ms...`);
            await this.delay(this.retryDelay * attempt);
            return this.makeRequest(request, keyToUse, attempt + 1);
          }
          
          return { success: false, error: errorMessage };
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          const errorMessage = 'Unable to connect to translation service. Please check your internet connection.';
          
          // Retry on network errors
          if (attempt <= this.maxRetries) {
            console.log(`🔄 Retrying after network error in ${this.retryDelay * attempt}ms...`);
            await this.delay(this.retryDelay * attempt);
            return this.makeRequest(request, keyToUse, attempt + 1);
          }
          
          return { success: false, error: errorMessage };
        }
      }

      console.error('❌ Unexpected translation error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during translation. Please try again.'
      };
    }
  }

  // Delay utility for retries
  private delay(ms: number): Promise<void> {
    console.log(`⏳ Waiting ${ms}ms before retry...`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main translation method
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    console.log('🌍 Starting translation process...');
    console.log('📋 Translation request:', {
      text: request.text.substring(0, 100) + (request.text.length > 100 ? '...' : ''),
      text_length: request.text.length,
      target_language: request.target_language,
      source_language: request.source_language
    });

    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        console.error('❌ Request validation failed:', validation.error);
        return { success: false, error: validation.error };
      }

      // Check if source and target are the same
      if (request.source_language && request.source_language === request.target_language) {
        console.log('✅ Source and target languages are the same, returning original text');
        return {
          success: true,
          translated_text: request.text,
          detected_language: request.source_language
        };
      }

      // Make translation request
      const result = await this.makeRequest(request);
      
      // Log successful translation (without sensitive data)
      if (result.success) {
        console.log('✅ Translation completed successfully:', {
          sourceLength: request.text.length,
          targetLength: result.translated_text?.length || 0,
          targetLanguage: request.target_language,
          detectedLanguage: result.detected_language
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Translation process failed:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during translation. Please try again.'
      };
    }
  }

  // Get usage statistics
  getUsageStats(): { requestCount: number; remainingRequests: number; resetTime: Date } {
    return {
      requestCount: this.requestCount,
      remainingRequests: Math.max(0, this.rateLimit - this.requestCount),
      resetTime: new Date(this.lastResetTime + (60 * 60 * 1000)) // Next hour
    };
  }

  // Clear usage statistics (for testing)
  resetUsageStats(): void {
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    console.log('🔄 Lingo API usage stats reset');
  }
}

// Export singleton instance
export const lingoAPI = new LingoAPI();

// Export types
export type { TranslationRequest, TranslationResponse, LanguageOption };