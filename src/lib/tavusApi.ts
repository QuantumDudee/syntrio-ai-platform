interface ConversationRequest {
  replica_id: string;
  conversation_name: string;
  custom_greeting: string;
  conversational_context?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    language?: string;
  };
}

interface ConversationResponse {
  success: boolean;
  conversation_id?: string;
  conversation_url?: string;
  status?: 'creating' | 'ready' | 'active' | 'ended' | 'failed';
  error?: string;
  expires_at?: string;
}

interface ConversationStatus {
  conversation_id: string;
  status: 'creating' | 'ready' | 'active' | 'ended' | 'failed';
  conversation_url?: string;
  participants?: number;
  duration?: number;
  error?: string;
  expires_at?: string;
}

interface ConversationUsage {
  total_minutes_used: number;
  total_minutes_available: number;
  remaining_minutes: number;
  current_month_usage: number;
}

class TavusAPI {
  private readonly baseUrl = 'https://tavusapi.com/v2';
  private readonly timeout = 30000; // 30 seconds for conversation creation
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds
  private readonly rateLimit = 50; // requests per hour
  
  // Pre-filled API key for hackathon demo
  private apiKey: string = 'aa6a0bfeeefb4a4983308a3d1be44643';
  private requestCount = 0;
  private lastResetTime = Date.now();

  // Conversation usage tracking
  private conversationUsage: ConversationUsage = {
    total_minutes_used: 0,
    total_minutes_available: 250, // Default Tavus limit
    remaining_minutes: 250,
    current_month_usage: 0
  };

  setApiKey(apiKey: string): void {
    // Keep the pre-filled key for demo purposes
    console.log('🔑 Tavus API key is pre-configured for demo');
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

  // Rate limiting check
  private checkRateLimit(): boolean {
    const now = Date.now();
    const hoursPassed = (now - this.lastResetTime) / (1000 * 60 * 60);
    
    if (hoursPassed >= 1) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    const withinLimit = this.requestCount < this.rateLimit;
    console.log('⏱️ Rate limit check:', { requestCount: this.requestCount, limit: this.rateLimit, withinLimit });
    return withinLimit;
  }

  // Validate conversation request
  private validateConversationRequest(request: ConversationRequest): { valid: boolean; error?: string } {
    console.log('🔍 Validating conversation request:', {
      replica_id: request.replica_id,
      conversation_name: request.conversation_name,
      greeting_length: request.custom_greeting?.length || 0,
      context_length: request.conversational_context?.length || 0,
      has_context: !!request.conversational_context
    });

    if (!request.replica_id || request.replica_id.trim().length === 0) {
      console.error('❌ Validation failed: Replica ID is required');
      return { valid: false, error: 'Replica ID is required for conversation creation' };
    }

    if (!request.conversation_name || request.conversation_name.trim().length === 0) {
      console.error('❌ Validation failed: Conversation name is required');
      return { valid: false, error: 'Conversation name is required' };
    }

    if (!request.custom_greeting || request.custom_greeting.trim().length === 0) {
      console.error('❌ Validation failed: Custom greeting is required');
      return { valid: false, error: 'Custom greeting is required for conversation' };
    }

    if (request.custom_greeting.length > 500) {
      console.error('❌ Validation failed: Greeting too long:', request.custom_greeting.length);
      return { valid: false, error: 'Custom greeting exceeds maximum length of 500 characters' };
    }

    if (request.conversational_context && request.conversational_context.length > 2000) {
      console.error('❌ Validation failed: Context too long:', request.conversational_context.length);
      return { valid: false, error: 'Conversational context exceeds maximum length of 2000 characters' };
    }

    console.log('✅ Conversation request validation passed');
    return { valid: true };
  }

  // Format conversational context for optimal AI understanding
  private formatConversationalContext(userInput: string): string {
    if (!userInput || userInput.trim().length === 0) {
      return '';
    }

    const trimmedInput = userInput.trim();
    
    // Create a comprehensive context that helps the AI understand the topic immediately
    const contextParts = [
      `The user wants to discuss: ${trimmedInput}`,
      `Please engage directly with this topic without asking "how can I help you?"`,
      `Start the conversation by acknowledging their interest in this subject and provide relevant insights or questions.`
    ];

    const formattedContext = contextParts.join(' ');
    
    console.log('📝 Formatted conversational context:', {
      original_length: trimmedInput.length,
      formatted_length: formattedContext.length,
      preview: formattedContext.substring(0, 150) + (formattedContext.length > 150 ? '...' : '')
    });

    return formattedContext;
  }

  // Generate context-aware greeting
  private generateContextAwareGreeting(userInput: string): string {
    if (!userInput || userInput.trim().length === 0) {
      return 'Hello! I\'m your AI assistant. How can I help you today?';
    }

    // Extract key topics from user input for a more personalized greeting
    const trimmedInput = userInput.trim();
    const firstSentence = trimmedInput.split('.')[0].trim();
    const shortTopic = firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;

    const contextGreeting = `Hello! I see you'd like to discuss ${shortTopic.toLowerCase()}. I'm excited to explore this topic with you and share insights that might be helpful. Let's dive right in!`;

    console.log('👋 Generated context-aware greeting:', {
      input_length: trimmedInput.length,
      greeting_length: contextGreeting.length,
      greeting: contextGreeting
    });

    return contextGreeting;
  }

  // Make HTTP request with retry logic and detailed logging
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'POST',
    body?: any,
    apiKey?: string,
    attempt = 1
  ): Promise<any> {
    const keyToUse = this.apiKey; // Always use pre-filled key
    
    console.log(`🌐 Making ${method} request to ${endpoint} (attempt ${attempt}/${this.maxRetries + 1})`);
    
    // Check rate limiting
    if (!this.checkRateLimit()) {
      console.error('❌ Rate limit exceeded');
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Request timeout triggered');
      controller.abort();
    }, this.timeout);

    try {
      this.requestCount++;

      const requestHeaders = {
        'x-api-key': keyToUse,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('📤 Request details:', {
        url: `${this.baseUrl}${endpoint}`,
        method,
        headers: {
          ...requestHeaders,
          'x-api-key': this.maskApiKey(keyToUse)
        },
        body: body ? JSON.stringify(body, null, 2) : undefined
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = 'Conversation request failed';
        let responseBody = '';
        
        try {
          responseBody = await response.text();
          console.log('📄 Error response body:', responseBody);
          
          // Try to parse as JSON
          const errorData = JSON.parse(responseBody);
          errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage;
        } catch (parseError) {
          console.log('📄 Raw error response (not JSON):', responseBody);
          errorMessage = responseBody || errorMessage;
        }
        
        switch (response.status) {
          case 401:
            errorMessage = 'Invalid API key. Please check your Tavus API key.';
            break;
          case 429:
            errorMessage = 'Rate limit exceeded. Please try again later.';
            break;
          case 400:
            errorMessage = `Invalid request parameters: ${errorMessage}`;
            break;
          case 402:
            errorMessage = 'Insufficient credits or conversation minutes. Please check your Tavus account.';
            break;
          case 404:
            errorMessage = 'Replica not found. Please check your replica ID.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Tavus service is temporarily unavailable. Please try again later.';
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
          return this.makeRequest(endpoint, method, body, keyToUse, attempt + 1);
        }

        throw new Error(errorMessage);
      }

      // Handle successful responses with no content (like DELETE operations)
      if (response.ok && response.status === 204) {
        console.log('✅ Successful response with no content (204)');
        return {};
      }

      const responseData = await response.json();
      console.log('✅ Successful response:', responseData);
      return responseData;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        console.error('❌ Request error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });

        if (error.name === 'AbortError') {
          const errorMessage = 'Conversation request timed out. Please try again.';
          
          // Retry on timeout
          if (attempt <= this.maxRetries) {
            console.log(`🔄 Retrying after timeout in ${this.retryDelay * attempt}ms...`);
            await this.delay(this.retryDelay * attempt);
            return this.makeRequest(endpoint, method, body, keyToUse, attempt + 1);
          }
          
          throw new Error(errorMessage);
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          const errorMessage = 'Unable to connect to conversation service. Please check your internet connection.';
          
          // Retry on network errors
          if (attempt <= this.maxRetries) {
            console.log(`🔄 Retrying after network error in ${this.retryDelay * attempt}ms...`);
            await this.delay(this.retryDelay * attempt);
            return this.makeRequest(endpoint, method, body, keyToUse, attempt + 1);
          }
          
          throw new Error(errorMessage);
        }
      }

      throw error;
    }
  }

  // Delay utility for retries
  private delay(ms: number): Promise<void> {
    console.log(`⏳ Waiting ${ms}ms before retry...`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Create conversation with comprehensive logging and proper context handling
  async createConversation(request: ConversationRequest): Promise<ConversationResponse> {
    console.log('🎭 Starting conversation creation process...');
    console.log('📋 Input request:', {
      replica_id: request.replica_id,
      conversation_name: request.conversation_name,
      greeting: request.custom_greeting.substring(0, 100) + (request.custom_greeting.length > 100 ? '...' : ''),
      greeting_length: request.custom_greeting.length,
      context_length: request.conversational_context?.length || 0,
      properties: request.properties
    });

    try {
      // Validate request
      const validation = this.validateConversationRequest(request);
      if (!validation.valid) {
        console.error('❌ Request validation failed:', validation.error);
        return { success: false, error: validation.error };
      }

      // Check remaining conversation minutes
      if (this.conversationUsage.remaining_minutes <= 0) {
        console.error('❌ No conversation minutes remaining');
        return {
          success: false,
          error: 'No conversation minutes remaining. Please check your Tavus account.'
        };
      }

      // Format the conversational context for optimal AI understanding
      const formattedContext = request.conversational_context 
        ? this.formatConversationalContext(request.conversational_context)
        : '';

      // Generate a context-aware greeting if we have conversational context
      const contextAwareGreeting = request.conversational_context
        ? this.generateContextAwareGreeting(request.conversational_context)
        : request.custom_greeting;

      // Prepare the exact request body for Tavus CVI API with proper context
      const requestBody: ConversationRequest = {
        replica_id: request.replica_id.trim(),
        conversation_name: request.conversation_name.trim(),
        custom_greeting: contextAwareGreeting.trim(),
        properties: {
          max_call_duration: 1800, // 30 minutes max
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          language: 'english',
          ...request.properties
        }
      };

      // Add the formatted conversational context if provided
      if (formattedContext) {
        requestBody.conversational_context = formattedContext;
        console.log('🎯 Added conversational context to request:', {
          context_preview: formattedContext.substring(0, 200) + (formattedContext.length > 200 ? '...' : ''),
          context_length: formattedContext.length
        });
      }

      console.log('📤 Final request body being sent to Tavus CVI:', {
        replica_id: requestBody.replica_id,
        conversation_name: requestBody.conversation_name,
        custom_greeting: requestBody.custom_greeting,
        has_conversational_context: !!requestBody.conversational_context,
        conversational_context_length: requestBody.conversational_context?.length || 0,
        properties: requestBody.properties
      });

      // Make conversation creation request
      const data = await this.makeRequest('/conversations', 'POST', requestBody);
      
      // Log successful creation (without sensitive data)
      console.log('✅ Conversation creation request successful:', {
        conversation_id: data.conversation_id,
        status: data.status,
        has_conversation_url: !!data.conversation_url,
        expires_at: data.expires_at
      });

      // Update usage tracking
      this.updateUsageTracking();

      return {
        success: true,
        conversation_id: data.conversation_id,
        conversation_url: data.conversation_url,
        status: data.status || 'creating',
        expires_at: data.expires_at
      };

    } catch (error) {
      console.error('❌ Conversation creation failed:', error);
      
      let errorMessage = 'An unexpected error occurred during conversation creation. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get conversation status
  async getConversationStatus(conversationId: string): Promise<ConversationStatus | null> {
    console.log('🔍 Checking conversation status for ID:', conversationId);
    
    try {
      const data = await this.makeRequest(`/conversations/${conversationId}`, 'GET');
      
      console.log('✅ Conversation status retrieved:', {
        conversation_id: conversationId,
        status: data.status,
        participants: data.participants
      });
      
      return {
        conversation_id: conversationId,
        status: data.status,
        conversation_url: data.conversation_url,
        participants: data.participants || 0,
        duration: data.duration || 0,
        error: data.error,
        expires_at: data.expires_at
      };

    } catch (error) {
      console.error('❌ Conversation status check failed:', error);
      return null;
    }
  }

  // End conversation with proper response handling
  async endConversation(conversationId: string): Promise<{ success: boolean; error?: string }> {
    console.log('🛑 Ending conversation:', conversationId);
    
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 End conversation response:', {
        status: response.status,
        statusText: response.statusText,
        hasContent: response.headers.get('content-length') !== '0'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to end conversation';
        
        // Handle different response types
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.warn('⚠️ Failed to parse error response as JSON');
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } else {
          // Non-JSON response
          try {
            const textResponse = await response.text();
            errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }

        console.error('❌ Failed to end conversation:', {
          status: response.status,
          error: errorMessage
        });

        return { success: false, error: errorMessage };
      }

      // Handle successful response (may be empty for DELETE)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.log('✅ Conversation ended successfully (no content response)');
        return { success: true };
      }

      // Try to parse response if there's content
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ Conversation ended successfully with response:', data);
        } else {
          console.log('✅ Conversation ended successfully (non-JSON response)');
        }
      } catch (parseError) {
        console.log('✅ Conversation ended successfully (unparseable response)');
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Failed to end conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to end conversation'
      };
    }
  }

  // Update usage tracking (mock implementation)
  private updateUsageTracking(): void {
    // In a real implementation, this would fetch actual usage from Tavus API
    this.conversationUsage.current_month_usage += 1;
    console.log('📊 Usage updated:', this.conversationUsage);
  }

  // Get conversation usage statistics
  getConversationUsage(): ConversationUsage {
    return { ...this.conversationUsage };
  }

  // Update conversation usage (for external updates)
  updateConversationUsage(usage: Partial<ConversationUsage>): void {
    this.conversationUsage = { ...this.conversationUsage, ...usage };
    this.conversationUsage.remaining_minutes = 
      this.conversationUsage.total_minutes_available - this.conversationUsage.total_minutes_used;
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
  }

  // Format conversation duration
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

// Export singleton instance
export const tavusAPI = new TavusAPI();

// Export the class itself
export { TavusAPI };

// Export types
export type { 
  ConversationRequest, 
  ConversationResponse, 
  ConversationStatus,
  ConversationUsage
};