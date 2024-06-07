from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from starlette.status import HTTP_302_FOUND

from source.check_gpt_service import CheckGPTService
from source.generate_reply_model import GenerateReplyRequestBodyModel, GenerateReplyResponseBodyModel, ReviewResponseBodyModel, ReviewRequestBodyModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = CheckGPTService()
service.__init__()

@app.get("/")
async def root():
    return RedirectResponse(url="/client/index.html", status_code=HTTP_302_FOUND)

@app.post("/generate-reply", response_model=GenerateReplyResponseBodyModel)
async def reply_to_user_utterance(requst_model: GenerateReplyRequestBodyModel):
    reply = service.generate_reply(requst_model.utterance, requst_model.model)

    return GenerateReplyResponseBodyModel(reply=reply)

@app.post("/review", response_model=ReviewResponseBodyModel)
async def reply_to_review(request_model: ReviewRequestBodyModel):
    reply = service.check_review(request_model.message)

    return ReviewResponseBodyModel(reply=reply)

app.mount("/client", StaticFiles(directory="client"), name="client")