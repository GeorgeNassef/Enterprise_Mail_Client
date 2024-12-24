from typing import List, Optional, Dict, Any
from datetime import datetime
import aiohttp
from ...core.security import auth_service

class ContactsService:
    def __init__(self):
        self.graph_base_url = "https://graph.microsoft.com/v1.0"
        
    async def _get_headers(self, username: str) -> Dict[str, str]:
        """Get headers for Microsoft Graph API requests"""
        token = await auth_service.get_access_token(username)
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    async def get_contacts(
        self,
        username: str,
        folder_id: Optional[str] = None,
        search_query: Optional[str] = None,
        page_size: int = 50,
        page_token: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get contacts using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        params = {
            "$top": page_size,
            "$select": "id,givenName,surname,displayName,emailAddresses,phoneNumbers,businessPhones,mobilePhone,homePhones,addresses,companyName,jobTitle,department,personalNotes,createdDateTime,lastModifiedDateTime"
        }
        
        if search_query:
            params["$search"] = f'"{search_query}"'
        if page_token:
            params["$skiptoken"] = page_token
            
        folder_path = f"/contactFolders/{folder_id}" if folder_id else ""
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.graph_base_url}/users/{username}{folder_path}/contacts",
                headers=headers,
                params=params
            ) as response:
                data = await response.json()
                return [self._format_contact(contact) for contact in data.get("value", [])]

    async def create_contact(
        self,
        username: str,
        contact: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a new contact using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        contact_data = {
            "givenName": contact.get("given_name"),
            "surname": contact.get("surname"),
            "displayName": contact["display_name"],
            "emailAddresses": [
                {
                    "address": email,
                    "name": contact["display_name"]
                }
                for email in contact["email_addresses"]
            ]
        }
        
        if contact.get("phone_numbers"):
            contact_data.update({
                "businessPhones": [p.number for p in contact["phone_numbers"] if p.type == "business"],
                "homePhones": [p.number for p in contact["phone_numbers"] if p.type == "home"],
                "mobilePhone": next((p.number for p in contact["phone_numbers"] if p.type == "mobile"), None)
            })
            
        if contact.get("addresses"):
            contact_data["addresses"] = [
                {
                    "street": addr.street,
                    "city": addr.city,
                    "state": addr.state,
                    "postalCode": addr.postal_code,
                    "countryOrRegion": addr.country
                }
                for addr in contact["addresses"]
            ]
            
        optional_fields = {
            "companyName": "company_name",
            "jobTitle": "job_title",
            "department": "department",
            "personalNotes": "notes"
        }
        
        for graph_field, our_field in optional_fields.items():
            if contact.get(our_field):
                contact_data[graph_field] = contact[our_field]
                
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.graph_base_url}/users/{username}/contacts",
                headers=headers,
                json=contact_data
            ) as response:
                data = await response.json()
                return self._format_contact(data)

    async def update_contact(
        self,
        username: str,
        contact_id: str,
        contact: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update an existing contact using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        contact_data = {
            "givenName": contact.get("given_name"),
            "surname": contact.get("surname"),
            "displayName": contact["display_name"],
            "emailAddresses": [
                {
                    "address": email,
                    "name": contact["display_name"]
                }
                for email in contact["email_addresses"]
            ]
        }
        
        if contact.get("phone_numbers"):
            contact_data.update({
                "businessPhones": [p.number for p in contact["phone_numbers"] if p.type == "business"],
                "homePhones": [p.number for p in contact["phone_numbers"] if p.type == "home"],
                "mobilePhone": next((p.number for p in contact["phone_numbers"] if p.type == "mobile"), None)
            })
            
        if contact.get("addresses"):
            contact_data["addresses"] = [
                {
                    "street": addr.street,
                    "city": addr.city,
                    "state": addr.state,
                    "postalCode": addr.postal_code,
                    "countryOrRegion": addr.country
                }
                for addr in contact["addresses"]
            ]
            
        optional_fields = {
            "companyName": "company_name",
            "jobTitle": "job_title",
            "department": "department",
            "personalNotes": "notes"
        }
        
        for graph_field, our_field in optional_fields.items():
            if contact.get(our_field):
                contact_data[graph_field] = contact[our_field]
                
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                f"{self.graph_base_url}/users/{username}/contacts/{contact_id}",
                headers=headers,
                json=contact_data
            ) as response:
                data = await response.json()
                return self._format_contact(data)

    async def delete_contact(
        self,
        username: str,
        contact_id: str
    ) -> None:
        """
        Delete a contact using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{self.graph_base_url}/users/{username}/contacts/{contact_id}",
                headers=headers
            ) as response:
                if response.status != 204:
                    data = await response.json()
                    raise Exception(f"Failed to delete contact: {data.get('error', {}).get('message')}")

    def _format_contact(self, contact: Dict[str, Any]) -> Dict[str, Any]:
        """Format contact data from Graph API to match our schema"""
        phone_numbers = []
        
        if contact.get("businessPhones"):
            phone_numbers.extend([
                {"type": "business", "number": phone}
                for phone in contact["businessPhones"]
            ])
            
        if contact.get("homePhones"):
            phone_numbers.extend([
                {"type": "home", "number": phone}
                for phone in contact["homePhones"]
            ])
            
        if contact.get("mobilePhone"):
            phone_numbers.append({
                "type": "mobile",
                "number": contact["mobilePhone"]
            })
            
        return {
            "id": contact["id"],
            "given_name": contact.get("givenName"),
            "surname": contact.get("surname"),
            "display_name": contact["displayName"],
            "email_addresses": [
                email["address"]
                for email in contact.get("emailAddresses", [])
            ],
            "phone_numbers": phone_numbers,
            "addresses": [
                {
                    "type": "business",  # Graph API doesn't differentiate address types
                    "street": addr.get("street"),
                    "city": addr.get("city"),
                    "state": addr.get("state"),
                    "postal_code": addr.get("postalCode"),
                    "country": addr.get("countryOrRegion")
                }
                for addr in contact.get("addresses", [])
            ],
            "company_name": contact.get("companyName"),
            "job_title": contact.get("jobTitle"),
            "department": contact.get("department"),
            "notes": contact.get("personalNotes"),
            "created_time": datetime.fromisoformat(contact["createdDateTime"].rstrip('Z')),
            "modified_time": datetime.fromisoformat(contact["lastModifiedDateTime"].rstrip('Z'))
        }

contacts_service = ContactsService()
