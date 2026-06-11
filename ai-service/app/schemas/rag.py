from pydantic import BaseModel, Field, model_validator


class IndexArticleRequest(BaseModel):
    article_id: int = Field(alias="article_id")
    title: str | None = None
    content: str | None = None
    category: str | None = None
    role_tag: str | None = Field(default=None, alias="role_tag")
    version: int | None = None
    status: str | None = None


class IndexArticleResponse(BaseModel):
    indexed: bool
    articleId: int
    status: str
    chunkCount: int


class QueryRequest(BaseModel):
    query_text: str | None = Field(default=None, alias="query_text")
    query: str | None = Field(default=None, alias="query")

    @model_validator(mode="after")
    def populate_query_text(self):
        if not self.query_text:
            self.query_text = self.query

        if not self.query_text:
            raise ValueError("query_text is required")

        return self


class QueryResponse(BaseModel):
    answer: str | None
    confidence: float
    matched_article_id: int | None
    escalate: bool
    ai_enabled: bool = True
    source: str = "ai"