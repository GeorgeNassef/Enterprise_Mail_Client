from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from ...core.security import auth_service
from ...services.exchange.client import exchange_client
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/contacts", tags=["contacts"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class PhoneNumber(BaseModel):
    type: str  # business, home, mobile
    number: str

class Address(BaseModel):
    type: str  # business, home, other
    street: Optional[str]
    city: Optional[str]
    state: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]

class ContactBase(BaseModel):
    given_name: Optional[str]
    surname: Optional[str]
    display_name: str
    email_addresses: List[EmailStr]
    phone_numbers: Optional[List[PhoneNumber]]
    addresses: Optional[List[Address]]
    company_name: Optional[str]
    job_title: Optional[str]
    department: Optional[str]
    notes: Optional[str]

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: str
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

@router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts(
    folder_id: Optional[str] = None,
    search_query: Optional[str] = None,
    page_size: int = 50,
    page_token: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """
    Get contacts with optional filtering and pagination
    """
    try:
        contacts = await exchange_client.get_contacts(
            username=current_user,
            folder_id=folder_id,
            search_query=search_query,
            page_size=page_size,
            page_token=page_token
        )
        return contacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/contacts", response_model=ContactResponse)
async def create_contact(
    contact: ContactCreate,
    current_user: str = Depends(get_current_user)
):
    """
    Create a new contact
    """
    try:
        created_contact = await exchange_client.create_contact(
            username=current_user,
            contact=contact.dict()
        )
        return created_contact
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get details of a specific contact
    """
    try:
        contact = await exchange_client.get_contact(
            username=current_user,
            contact_id=contact_id
        )
        return contact
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: str,
    contact: ContactCreate,
    current_user: str = Depends(get_current_user)
):
    """
    Update an existing contact
    """
    try:
        updated_contact = await exchange_client.update_contact(
            username=current_user,
            contact_id=contact_id,
            contact=contact.dict()
        )
        return updated_contact
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Delete a contact
    """
    try:
        await exchange_client.delete_contact(
            username=current_user,
            contact_id=contact_id
        )
        return {"status": "success", "message": "Contact deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
