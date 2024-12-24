from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from ...core.security import auth_service
from ...services.exchange.client import exchange_client
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/mail", tags=["mail"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class MessageResponse(BaseModel):
    id: str
    subject: str
    from_address: str
    to_addresses: List[str]
    date: str
    has_attachments: bool
    preview: Optional[str]

class MessageDetailResponse(BaseModel):
    id: str
    subject: str
    from_address: str
    to_addresses: List[str]
    cc_addresses: List[str]
    bcc_addresses: List[str]
    body: str
    attachments: List[dict]

class SendMessageRequest(BaseModel):
    subject: str
    body: str
    to_recipients: List[EmailStr]
    cc_recipients: Optional[List[EmailStr]] = None
    bcc_recipients: Optional[List[EmailStr]] = None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    username = await auth_service.verify_token(token)
    if not username:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username

@router.get("/messages", response_model=List[MessageResponse])
async def get_messages(
    folder: str = "inbox",
    page_size: int = 50,
    page_token: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """
    Retrieve messages from the specified folder
    """
    try:
        result = await exchange_client.get_messages(
            username=current_user,
            folder=folder,
            page_size=page_size,
            page_token=page_token
        )
        
        messages = []
        for msg in result["messages"]:
            messages.append(MessageResponse(
                id=msg["id"],
                subject=msg["subject"],
                from_address=msg["from"]["emailAddress"]["address"],
                to_addresses=[r["emailAddress"]["address"] for r in msg["toRecipients"]],
                date=msg["receivedDateTime"],
                has_attachments=msg["hasAttachments"],
                preview=msg.get("bodyPreview")
            ))
            
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/messages/{message_id}", response_model=MessageDetailResponse)
async def get_message_detail(
    message_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get detailed information for a specific message
    """
    try:
        message = await exchange_client.get_message_detail(
            username=current_user,
            message_id=message_id
        )
        return MessageDetailResponse(**message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/messages/send")
async def send_message(
    message: SendMessageRequest,
    current_user: str = Depends(get_current_user)
):
    """
    Send a new email message
    """
    try:
        result = await exchange_client.send_message(
            username=current_user,
            subject=message.subject,
            body=message.body,
            to_recipients=[str(r) for r in message.to_recipients],
            cc_recipients=[str(r) for r in message.cc_recipients] if message.cc_recipients else None,
            bcc_recipients=[str(r) for r in message.bcc_recipients] if message.bcc_recipients else None
        )
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
