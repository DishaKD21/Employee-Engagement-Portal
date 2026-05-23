import { prisma } from "../../config/db.js";

export const knowledgeBaseService = {
  listArticles() {
    return prisma.knowledgeBaseArticle.findMany({ orderBy: { createdAt: "desc" } });
  },
  getArticle(articleId: number) {
    return prisma.knowledgeBaseArticle.findUnique({ where: { articleId } });
  },
  createArticle(data: { title?: string; content?: string; category?: string; roleTag?: string; author?: number }) {
    return prisma.knowledgeBaseArticle.create({ data });
  },
  updateArticle(articleId: number, data: { title?: string; content?: string; category?: string; roleTag?: string; status?: string }) {
    return prisma.knowledgeBaseArticle.update({ where: { articleId }, data });
  },
  deleteArticle(articleId: number) {
    return prisma.knowledgeBaseArticle.delete({ where: { articleId } });
  },
};