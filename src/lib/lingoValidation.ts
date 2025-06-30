interface ValidationResult {
  isValid: boolean;
  errorType?: 'format' | 'auth' | 'network';
  message: string;
}

class LingoValidator {
  private readonly API_BASE_URL = '/lingo-api/translate';
  private readonly VALIDATION_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // 1 second
  
  // Rate limiting protection
  private lastValidationTime = 0;
  private readonly MIN_VALIDATION_INTERVAL = 2000; // 2 seconds between validations
  
  private readonly apiKeyFormat = /^api_[a-zA-Z0-9]+$/i;

  /**
   * Validates API key format using regex pattern
   */
  private validateFormat(apiKey: string): ValidationResult {
    if (!apiKey || typeof apiKey !== 'string') {
      return {
        isValid: false,
        errorType: 'format',
        message: "API key is required"
      };
    }

    const trimmedKey = apiKey.trim();
    
    if (trimmedKey.length === 0) {
      return {
        isValid: false,
        errorType: 'format',
        message: "API key cannot be empty"
      };
    }

    // Check Lingo.dev format (api_ prefix)
    if (this.apiKeyFormat.test(trimmedKey)) {
      return {
        isValid: true,
        message: "Valid API key format"
      };
    }

    return {
      isValid: false,
      errorType: 'format',
      message: "Invalid API key format. Expected format: api_[alphanumeric characters]"
    };
  }

  /**
   * Makes a test API call to validate the key with Lingo.dev
   */
  private async validateWithApi(apiKey: string, attempt = 1): Promise<ValidationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.VALIDATION_TIMEOUT);

    try {
      console.log(`🔍 Validating Lingo API key (attempt ${attempt}/${this.MAX_RETRIES + 1})`);

      // Test payload as specified
      const testPayload = {
        text: "test",
        source_language: "en",
        target_language: "es"
      };

      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 Lingo validation response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        console.log('✅ Lingo API key validation successful');
        return {
          isValid: true,
          message: "API key validated successfully"
        };
      }

      // Handle specific HTTP status codes
      switch (response.status) {
        case 401:
        case 403:
          console.error('❌ Lingo API key validation failed: Invalid credentials');
          return {
            isValid: false,
            errorType: 'auth',
            message: "Invalid API key. Please verify your Lingo.dev API key"
          };
        case 429:
          console.warn('⚠️ Lingo API rate limit exceeded');
          return {
            isValid: false,
            errorType: 'network',
            message: "Rate limit exceeded. Please try again later"
          };
        case 500:
        case 502:
        case 503:
        case 504:
          // Retry on server errors
          if (attempt <= this.MAX_RETRIES) {
            console.log(`🔄 Retrying Lingo validation in ${this.RETRY_DELAY}ms...`);
            await this.delay(this.RETRY_DELAY);
            return this.validateWithApi(apiKey, attempt + 1);
          }
          
          console.error('❌ Lingo service unavailable after retries');
          return {
            isValid: false,
            errorType: 'network',
            message: "Lingo.dev service is temporarily unavailable. Please try again later"
          };
        default:
          console.error('❌ Lingo validation failed with status:', response.status);
          return {
            isValid: false,
            errorType: 'auth',
            message: `API validation failed with status ${response.status}`
          };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        console.error('❌ Lingo validation error:', {
          name: error.name,
          message: error.message
        });

        if (error.name === 'AbortError') {
          // Retry on timeout
          if (attempt <= this.MAX_RETRIES) {
            console.log(`🔄 Retrying Lingo validation after timeout in ${this.RETRY_DELAY}ms...`);
            await this.delay(this.RETRY_DELAY);
            return this.validateWithApi(apiKey, attempt + 1);
          }
          
          return {
            isValid: false,
            errorType: 'network',
            message: "Validation request timed out. Please check your internet connection"
          };
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          // Retry on network errors
          if (attempt <= this.MAX_RETRIES) {
            console.log(`🔄 Retrying Lingo validation after network error in ${this.RETRY_DELAY}ms...`);
            await this.delay(this.RETRY_DELAY);
            return this.validateWithApi(apiKey, attempt + 1);
          }
          
          return {
            isValid: false,
            errorType: 'network',
            message: "Unable to connect to Lingo.dev API. Please check your internet connection"
          };
        }
      }

      return {
        isValid: false,
        errorType: 'network',
        message: "Network error occurred during validation. Please try again"
      };
    }
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(): ValidationResult {
    const now = Date.now();
    if (now - this.lastValidationTime < this.MIN_VALIDATION_INTERVAL) {
      const remainingTime = Math.ceil((this.MIN_VALIDATION_INTERVAL - (now - this.lastValidationTime)) / 1000);
      return {
        isValid: false,
        errorType: 'network',
        message: `Please wait ${remainingTime} seconds before validating again`
      };
    }
    return { isValid: true, message: 'Rate limit check passed' };
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main validation function - performs both format and API validation
   */
  async validateApiKey(apiKey: string): Promise<ValidationResult> {
    console.log('🔑 Starting Lingo API key validation...');
    
    try {
      // Step 1: Rate limiting check
      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.isValid) {
        console.warn('⚠️ Lingo validation rate limited');
        return rateLimitCheck;
      }

      // Step 2: Format validation
      const formatResult = this.validateFormat(apiKey);
      if (!formatResult.isValid) {
        console.error('❌ Lingo API key format validation failed');
        return formatResult;
      }

      // Step 3: API validation with retry logic
      this.lastValidationTime = Date.now();
      const apiResult = await this.validateWithApi(apiKey.trim());
      
      return apiResult;
    } catch (error) {
      console.error('❌ Unexpected Lingo validation error:', error);
      return {
        isValid: false,
        errorType: 'network',
        message: "An unexpected error occurred during validation. Please try again"
      };
    }
  }

  /**
   * Quick format-only validation (for real-time feedback)
   */
  validateFormatOnly(apiKey: string): ValidationResult {
    return this.validateFormat(apiKey);
  }

  /**
   * Get supported API key format information
   */
  getSupportedFormat(): { pattern: string; example: string; description: string } {
    return {
      pattern: "api_[alphanumeric characters]",
      example: "api_abc123def456ghi789",
      description: "Lingo.dev API keys start with 'api_' followed by alphanumeric characters"
    };
  }

  /**
   * Check if API key appears to be in correct format
   */
  detectKeyFormat(apiKey: string): 'lingo' | 'unknown' {
    if (!apiKey) return 'unknown';
    
    const trimmedKey = apiKey.trim();
    
    if (this.apiKeyFormat.test(trimmedKey)) {
      return 'lingo';
    }
    
    return 'unknown';
  }
}

// Export singleton instance
export const lingoValidator = new LingoValidator();

// Export types
export type { ValidationResult };