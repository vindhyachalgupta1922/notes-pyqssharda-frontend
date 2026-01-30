import apiClient from "./axios";

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data?: {
    response: string;
    timestamp: string;
  };
  error?: string;
}

export const chatbotApi = {
  // Send a message to the chatbot
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await apiClient.post("/chatbot", data);
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to send message",
        }
      );
    }
  },

  // Clear chat history
  clearHistory: async (): Promise<ChatResponse> => {
    try {
      const response = await apiClient.post("/chatbot/clear");
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data || {
          success: false,
          message: "Failed to clear history",
        }
      );
    }
  },
};
