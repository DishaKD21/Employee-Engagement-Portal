export type ChatbotQueryRequest = {
	queryText: string;
	employeeId?: number;
};

export type ChatbotQueryResponse = {
	answer: string | null;
	confidence: number;
	matchedArticleId: number | null;
	escalate: boolean;
	escalated: boolean;
	message?: string;
	queryId: number;
	escalationId: number | null;
};

export type AIServiceQueryResponse = {
	answer: string | null;
	confidence: number;
	matched_article_id: number | null;
	escalate: boolean;
};

export type KnowledgeBaseArticleInput = {
	title: string;
	content: string;
	category?: string;
	roleTag?: string;
	author?: number;
	status?: "draft" | "pending_approval";
};

export type KnowledgeBaseArticleUpdateInput = Partial<KnowledgeBaseArticleInput> & {
	status?: "draft" | "pending_approval" | "approved" | "rejected" | "published";
	version?: number;
};
