from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from ...core.security import auth_service
from ...services.exchange.client import exchange_client
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/calendar", tags=["calendar"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Attendee(BaseModel):
    email: str
    name: Optional[str]
    response_status: Optional[str]

class EventBase(BaseModel):
    subject: str
    start_time: datetime
    end_time: datetime
    location: Optional[str]
    body: Optional[str]
    is_all_day: bool = False
    attendees: Optional[List[Attendee]]

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str
    organizer: str
    created_time: datetime
    modified_time: datetime

async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    username = await auth_service.verify_token(token)
    if not username:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username

@router.get("/events", response_model=List[EventResponse])
async def get_events(
    start_date: datetime,
    end_date: datetime,
    calendar_id: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """
    Get calendar events within a date range
    """
    try:
        events = await exchange_client.get_calendar_events(
            username=current_user,
            start_date=start_date,
            end_date=end_date,
            calendar_id=calendar_id
        )
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    current_user: str = Depends(get_current_user)
):
    """
    Create a new calendar event
    """
    try:
        created_event = await exchange_client.create_calendar_event(
            username=current_user,
            event=event.dict()
        )
        return created_event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get details of a specific calendar event
    """
    try:
        event = await exchange_client.get_calendar_event(
            username=current_user,
            event_id=event_id
        )
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event: EventCreate,
    current_user: str = Depends(get_current_user)
):
    """
    Update an existing calendar event
    """
    try:
        updated_event = await exchange_client.update_calendar_event(
            username=current_user,
            event_id=event_id,
            event=event.dict()
        )
        return updated_event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Delete a calendar event
    """
    try:
        await exchange_client.delete_calendar_event(
            username=current_user,
            event_id=event_id
        )
        return {"status": "success", "message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
