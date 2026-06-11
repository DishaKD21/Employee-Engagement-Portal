import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

function debugApiCall(name: string, phase: "request" | "response" | "error", payload?: unknown) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const prefix = `[api-client:${name}:${phase}]`;
  if (phase === "error") {
    console.error(prefix, payload);
    return;
  }

  console.debug(prefix, payload ?? "");
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/login");
      if (!isLoginRequest) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/employee/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);

export type KnowledgeBaseArticle = {
  articleId: number;
  title: string | null;
  content: string | null;
  category: string | null;
  roleTag: string | null;
  author: number | null;
  version: number | null;
  status: string | null;
  lastReviewedDate: string | null;
  createdAt: string;
  writer?: {
    employeeId: number;
    name: string | null;
    email: string;
  } | null;
};

export type KnowledgeBaseArticleInput = {
  title: string;
  content: string;
  category?: string;
  role_tag?: string;
  author?: number;
  status?: "draft" | "pending_approval";
};

export type ChatbotResponse = {
  answer: string | null;
  confidence: number;
  matchedArticleId: number | null;
  escalate: boolean;
  escalated?: boolean;
  message?: string;
  queryId: number;
  escalationId: number | null;
  aiEnabled?: boolean;
  source?: string;
};

export type QueryLogEntry = {
  queryId: number;
  queryText: string | null;
  confidenceScore: number | null;
  responseDelivered: string | null;
  escalationFlag: boolean | null;
  createdAt: string;
  matchedArticle?: KnowledgeBaseArticle | null;
  escalation?: {
    id: number;
    status: string | null;
    resolutionText: string | null;
    resolvedAt: string | null;
  } | null;
};

export type QueryEscalationEntry = {
  id: number;
  assignedTo: number | null;
  status: string | null;
  resolutionText: string | null;
  resolvedAt: string | null;
  query?: {
    queryId: number;
    employeeId: number | null;
    queryText: string | null;
    confidenceScore: number | null;
    createdAt: string;
    employee?: {
      employeeId: number;
      name: string | null;
      email: string;
      department: string | null;
    } | null;
  } | null;
};

export async function fetchKnowledgeBaseArticles() {
  debugApiCall("fetchKnowledgeBaseArticles", "request");
  const response = await apiClient.get("/api/knowledge-base/articles");
  debugApiCall("fetchKnowledgeBaseArticles", "response", response.data);
  return response.data?.data ?? response.data;
}

export async function fetchKnowledgeBaseApprovals() {
  debugApiCall("fetchKnowledgeBaseApprovals", "request");
  const response = await apiClient.get("/api/knowledge-base/approvals/pending");
  debugApiCall("fetchKnowledgeBaseApprovals", "response", response.data);
  return response.data?.data ?? response.data;
}

export async function createKnowledgeBaseArticle(input: KnowledgeBaseArticleInput) {
  debugApiCall("createKnowledgeBaseArticle", "request", input);
  const response = await apiClient.post("/api/knowledge-base/articles", input);
  debugApiCall("createKnowledgeBaseArticle", "response", response.data);
  return response.data?.data ?? response.data;
}

export async function approveKnowledgeBaseArticle(articleId: number, comments?: string) {
  debugApiCall("approveKnowledgeBaseArticle", "request", { articleId, comments });
  const response = await apiClient.put(`/api/knowledge-base/articles/${articleId}/approve`, { comments });
  debugApiCall("approveKnowledgeBaseArticle", "response", response.data);
  return response.data?.data ?? response.data;
}

export async function rejectKnowledgeBaseArticle(articleId: number, comments?: string) {
  debugApiCall("rejectKnowledgeBaseArticle", "request", { articleId, comments });
  const response = await apiClient.put(`/api/knowledge-base/articles/${articleId}/reject`, { comments });
  debugApiCall("rejectKnowledgeBaseArticle", "response", response.data);
  return response.data?.data ?? response.data;
}

export async function submitChatbotQuery(queryText: string) {
  debugApiCall("submitChatbotQuery", "request", { query: queryText });
  const response = await apiClient.post("/api/chatbot/query", { query: queryText });
  debugApiCall("submitChatbotQuery", "response", response.data);
  return response.data?.data as ChatbotResponse;
}

export async function fetchChatbotHistory() {
  debugApiCall("fetchChatbotHistory", "request");
  const response = await apiClient.get("/api/chatbot/history");
  debugApiCall("fetchChatbotHistory", "response", response.data);
  return response.data?.data as QueryLogEntry[];
}

export async function fetchEscalations() {
  const response = await apiClient.get("/api/query-escalations");
  return (response.data?.data ?? response.data) as QueryEscalationEntry[];
}

export async function fetchAllEscalations() {
  const response = await apiClient.get("/api/query-escalations/all");
  return (response.data?.data ?? response.data) as QueryEscalationEntry[];
}

export async function fetchMyEscalations() {
  const response = await apiClient.get("/api/query-escalations/my");
  return (response.data?.data ?? response.data) as QueryEscalationEntry[];
}

export async function respondToEscalation(escalationId: number, resolutionText: string) {
  const response = await apiClient.post(`/api/query-escalations/${escalationId}/respond`, { resolutionText });
  return response.data?.data as QueryEscalationEntry;
}
