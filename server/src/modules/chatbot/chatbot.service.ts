import { prisma } from "../../config/db.js";
import type { SubmitQueryInput } from "./chatbot.types.js";

export const chatbotService = {
  async submitQuery(employeeId: number, input: SubmitQueryInput) {
    const article = await prisma.knowledgeBaseArticle.findFirst({
      where: {
        status: { in: ["approved", "published"] },
        OR: [
          { title: { contains: input.queryText, mode: "insensitive" } },
          { content: { contains: input.queryText, mode: "insensitive" } },
          { category: { contains: input.queryText, mode: "insensitive" } },
        ],
      },
    });

    const responseText = article ? article.content ?? "Matching article found." : "Your query has been logged for review.";

    return prisma.queryLog.create({
      data: {
        employeeId,
        queryText: input.queryText,
        matchedArticleId: article?.articleId,
        confidenceScore: article ? 0.85 : 0.2,
        responseDelivered: responseText,
        escalationFlag: !article,
      },
    });
  },
};