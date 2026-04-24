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

/** Immediate acknowledgement returned by POST /conversations/ask (HTTP 202) */
export interface AskAcceptedResponse {
  status: 'accepted';
  task_id: string;
  message: string;
}

/** Response from GET /conversations/ask/status/{task_id} */
export interface PollStatusResponse {
  task_id: string;
  status: 'processing' | 'completed';
  message?: string;
  result?: AskResponse;
}

// ---------------------------------------------------------------------------
// Background task tracker — module-level, survives React component lifecycles
// ---------------------------------------------------------------------------

export interface TrackedTask {
  taskId: string;
  conversationId: number;
  query: string;
  tempMessageId: number;
  status: 'polling' | 'completed' | 'failed';
  result?: AskResponse;
  error?: string;
}

const activeTasks = new Map<string, TrackedTask>();

const POLL_INTERVAL_MS = 10_000;  // 10 seconds
const MAX_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// Persistence: Save and Load tasks from localStorage
// ---------------------------------------------------------------------------

function saveTasksToStorage() {
  try {
    const tasksArray = Array.from(activeTasks.values());
    localStorage.setItem('pulse_active_tasks', JSON.stringify(tasksArray));
  } catch (e) {
    console.error('Failed to save tasks to storage', e);
  }
}

function loadTasksFromStorage() {
  try {
    const saved = localStorage.getItem('pulse_active_tasks');
    if (saved) {
      const tasks = JSON.parse(saved) as TrackedTask[];
      tasks.forEach(t => {
        activeTasks.set(t.taskId, t);
        // If it was polling when saved, resume polling
        if (t.status === 'polling') {
          resumeTaskPolling(t);
        }
      });
    }
  } catch (e) {
    console.error('Failed to load tasks from storage', e);
  }
}

/**
 * Start background polling for a task. Runs independently of React —
 * keeps polling even if the user switches conversations or minimises the browser.
 */
export function startTaskPolling(
  taskId: string,
  conversationId: number,
  query: string,
  tempMessageId: number,
): void {
  const task: TrackedTask = { taskId, conversationId, query, tempMessageId, status: 'polling' };
  activeTasks.set(taskId, task);
  saveTasksToStorage();

  runPollingLoop(task, Date.now());
}

function resumeTaskPolling(task: TrackedTask): void {
  // We don't know when it started, so we reset the timer for the resume duration
  runPollingLoop(task, Date.now());
}

async function runPollingLoop(task: TrackedTask, startTime: number) {
  const { taskId } = task;

  const poll = async () => {
    const currentTask = activeTasks.get(taskId);
    if (!currentTask || currentTask.status !== 'polling') return;

    if (Date.now() - startTime > MAX_TIMEOUT_MS) {
      activeTasks.set(taskId, { ...currentTask, status: 'failed', error: 'Timed out after 5 minutes.' });
      saveTasksToStorage();
      return;
    }

    try {
      const resp = await pollTaskStatus(taskId);
      if (resp.status === 'completed' && resp.result) {
        activeTasks.set(taskId, { ...currentTask, status: 'completed', result: resp.result });
        saveTasksToStorage();
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      // Don't fail immediately on network error, try again
      console.warn(`Polling error for task ${taskId}:`, msg);
      setTimeout(poll, POLL_INTERVAL_MS);
    }
  };

  setTimeout(poll, POLL_INTERVAL_MS);
}

// Initial load
if (typeof window !== 'undefined') {
  loadTasksFromStorage();
}

/** Return all tracked tasks for a given conversation. */
export function getTasksForConversation(conversationId: number): TrackedTask[] {
  return Array.from(activeTasks.values()).filter(t => t.conversationId === conversationId);
}

/** Remove a task from the tracker once the UI has consumed its result. */
export function clearTask(taskId: string): void {
  activeTasks.delete(taskId);
  saveTasksToStorage();
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

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

/**
 * Submit a question for background processing.
 * Returns immediately with a task_id (HTTP 202 Accepted).
 */
export async function submitQuestion(
  conversationId: number,
  query: string,
  useInternet: boolean
): Promise<AskAcceptedResponse> {
  const response = await fetch(`${BASE_URL}/conversations/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      query,
      max_tokens: 1000,
      use_internet: useInternet,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit question');
  }
  return response.json();
}

/**
 * Poll the status of a submitted question by task_id.
 */
export async function pollTaskStatus(taskId: string): Promise<PollStatusResponse> {
  const response = await fetch(`${BASE_URL}/conversations/ask/status/${taskId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Task failed (HTTP ${response.status})`);
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
