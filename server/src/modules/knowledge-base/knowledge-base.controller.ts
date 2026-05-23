import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { knowledgeBaseService } from "./knowledge-base.service.js";

export const knowledgeBaseController = {
  async list(_req: Request, res: Response) {
    const articles = await knowledgeBaseService.listArticles();
    return res.status(200).json(new ApiResponse("Knowledge base articles fetched successfully", articles));
  },
  async getById(req: Request, res: Response) {
    const article = await knowledgeBaseService.getArticle(Number(req.params.articleId));
    return res.status(200).json(new ApiResponse("Knowledge base article fetched successfully", article));
  },
  async create(req: Request, res: Response) {
    const article = await knowledgeBaseService.createArticle({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      roleTag: req.body.roleTag,
      author: req.user?.employeeId,
    });

    return res.status(201).json(new ApiResponse("Article created", article));
  },

  async update(req: Request, res: Response) {
    const article = await knowledgeBaseService.updateArticle(Number(req.params.articleId), req.body);
    return res.status(200).json(new ApiResponse("Article updated", article));
  },

  async remove(req: Request, res: Response) {
    await knowledgeBaseService.deleteArticle(Number(req.params.articleId));
    return res.status(204).json(new ApiResponse("Article deleted", null));
  },
};