interface ValidationResult {
  isValid: boolean;
  errorType?: 'format' | 'auth' | 'network';
  message: string;
}

class TavusValidator {
  private readonly API_BASE_URL = 'https://tavusapi.com/v2/replicas';
  private readonly VALIDATION_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // 1 second
  
  // Rate limiting protection
  private lastValidationTime = 0;
  private readonly MIN_VALIDATION_INTERVAL = 2000; // 2 seconds between validations
  
  // Updated regex to accept both "tavus_" prefix and alphanumeric formats
  private readonly apiKeyFormats = {
    tavus: /^tavus_[a-zA-Z0-9]+$/i,
    alphanumeric: /^[a-f0-9]{32}$/i // 32-character hex format like "aa6a...4643"
  };

  /**
   * Validates API key format using regex patterns
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

    // Check Tavus format (tavus_ prefix)
    if (this.apiKeyFormats.tavus.test(trimmedKey)) {
      return {
        isValid: true,
        message: "Valid Tavus API key format"
      };
    }

    // Check alphanumeric format (32-character hex)
    if (this.apiKeyFormats.alphanumeric.test(trimmedKey)) {
      return {
        isValid: true,
        message: "Valid alphanumeric API key format"
      };
    }

    return {
      isValid: false,
      errorType: 'format',
      message: "Invalid API key format. Expected: 'tavus_[alphanumeric]' or 32-character hex string"
    };
  }

  /**
   * Makes a test API call to validate the key with Tavus
   */
  private async validateWithApi(apiKey: string, attempt = 1): Promise<ValidationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.VALIDATION_TIMEOUT);

    try {
      // Use replicas endpoint for validation (lightweight)
      const response = await fetch(this.API_BASE_URL, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          isValid: true,
          message: "API key validated successfully"
        };
      }

      // Handle specific HTTP status codes
      switch (response.status) {
        case 401:
        case 403:
          return {
            isValid: false,
            errorType: 'auth',
            message: "Invalid API key. Please verify your Tavus API key"
          };
        case 429:
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
            await this.delay(this.RETRY_DELAY);
            return this.validateWithApi(apiKey, attempt + 1);
          }
          
          return {
            isValid: false,
            errorType: 'network',
            message: "Tavus service is temporarily unavailable. Please try again later"
          };
        default:
          return {
            isValid: false,
            errorType: 'auth',
            message: `API validation failed with status ${response.status}`
          };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Retry on timeout
          if (attempt <= this.MAX_RETRIES) {
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
            await this.delay(this.RETRY_DELAY);
            return this.validateWithApi(apiKey, attempt + 1);
          }
          
          return {
            isValid: false,
            errorType: 'network',
            message: "Unable to connect to Tavus API. Please check your internet connection"
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
    try {
      // Step 1: Rate limiting check
      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.isValid) {
        return rateLimitCheck;
      }

      // Step 2: Format validation
      const formatResult = this.validateFormat(apiKey);
      if (!formatResult.isValid) {
        return formatResult;
      }

      // Step 3: API validation with retry logic
      this.lastValidationTime = Date.now();
      const apiResult = await this.validateWithApi(apiKey.trim());
      
      return apiResult;
    } catch (error) {
      console.error('Unexpected validation error:', error);
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
      pattern: "tavus_[alphanumeric] or 32-character hex",
      example: "tavus_abc123def456 or aa6a1b2c3d4e5f6789012345678904643",
      description: "Tavus API keys can be either 'tavus_' prefixed or 32-character hexadecimal strings"
    };
  }

  /**
   * Check if API key appears to be in correct format
   */
  detectKeyFormat(apiKey: string): 'tavus' | 'alphanumeric' | 'unknown' {
    if (!apiKey) return 'unknown';
    
    const trimmedKey = apiKey.trim();
    
    if (this.apiKeyFormats.tavus.test(trimmedKey)) {
      return 'tavus';
    }
    
    if (this.apiKeyFormats.alphanumeric.test(trimmedKey)) {
      return 'alphanumeric';
    }
    
    return 'unknown';
  }
}

// Export singleton instance
export const tavusValidator = new TavusValidator();

// Export types
export type { ValidationResult };