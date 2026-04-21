const BASE_URL = 'https://adeebjamal-private-ai-backend.hf.space';

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  message_count?: number;
}

export interface Message {
  id: number;
  user_query: string;
  response: string;
  created_at: string;
}

export interface ConversationMessagesResponse {
  conversation_id: number;
  conversation_title: string;
  start_row: number;
  end_row: number;
  total_messages: number;
  messages: Message[];
}

export interface AskResponse {
  conversation_id: number;
  user_query: string;
  response: string;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${BASE_URL}/conversations`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  const data = await response.json();
  return data.conversations || [];
}

export async function createConversation(title: string): Promise<Conversation> {
  const response = await fetch(`${BASE_URL}/conversations/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }
  return response.json();
}

export async function getMessages(conversationId: number, startRow: number, endRow: number): Promise<ConversationMessagesResponse> {
  const response = await fetch(`${BASE_URL}/conversations/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      start_row: startRow,
      end_row: endRow,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

export async function askQuestion(conversationId: number, query: string): Promise<AskResponse> {
  const response = await fetch(`${BASE_URL}/conversations/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      query,
      max_tokens: 1000,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to get answer');
  }
  return response.json();
}

export async function renameConversation(conversationId: number, newName: string): Promise<Conversation> {
  const response = await fetch(`${BASE_URL}/conversations/rename`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      new_name: newName,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to rename conversation');
  }
  return response.json();
}

export async function deleteConversation(conversationId: number): Promise<{ message: string; deleted_id: number }> {
  const response = await fetch(`${BASE_URL}/conversations/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }
  return response.json();
}
