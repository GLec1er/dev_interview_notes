import apiClient from './api';

export interface FeedbackData {
  subject: string;
  message: string;
  feedbackType: 'suggestion' | 'bug' | 'general';
}

class FeedbackService {
  async sendFeedback(data: FeedbackData): Promise<void> {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('feedback_type', data.feedbackType);
    
    await apiClient.post('/users/feedback', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const feedbackService = new FeedbackService();
