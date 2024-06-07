from pydantic import BaseModel

class GenerateReplyRequestBodyModel(BaseModel):
    utterance: list[str]
    model: str

class GenerateReplyResponseBodyModel(BaseModel):
    reply: list[str]

class ReviewRequestBodyModel(BaseModel):
    message: str

class ReviewResponseBodyModel(BaseModel):
    reply: str