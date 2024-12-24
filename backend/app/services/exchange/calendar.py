from typing import List, Optional, Dict, Any
from datetime import datetime
import aiohttp
from ...core.security import auth_service

class CalendarService:
    def __init__(self):
        self.graph_base_url = "https://graph.microsoft.com/v1.0"
        
    async def _get_headers(self, username: str) -> Dict[str, str]:
        """Get headers for Microsoft Graph API requests"""
        token = await auth_service.get_access_token(username)
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": 'outlook.timezone="UTC"'
        }

    async def get_calendar_events(
        self,
        username: str,
        start_date: datetime,
        end_date: datetime,
        calendar_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get calendar events within a date range using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        # Format datetime for Graph API
        start_str = start_date.isoformat() + 'Z'
        end_str = end_date.isoformat() + 'Z'
        
        # Build calendar path
        calendar_path = f"/calendars/{calendar_id}" if calendar_id else ""
        
        params = {
            "$select": "id,subject,organizer,start,end,location,body,attendees,createdDateTime,lastModifiedDateTime",
            "$filter": f"start/dateTime ge '{start_str}' and end/dateTime le '{end_str}'"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.graph_base_url}/users/{username}{calendar_path}/events",
                headers=headers,
                params=params
            ) as response:
                data = await response.json()
                return [self._format_event(event) for event in data.get("value", [])]

    async def create_calendar_event(
        self,
        username: str,
        event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a new calendar event using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        event_data = {
            "subject": event["subject"],
            "start": {
                "dateTime": event["start_time"].isoformat(),
                "timeZone": "UTC"
            },
            "end": {
                "dateTime": event["end_time"].isoformat(),
                "timeZone": "UTC"
            },
            "isAllDay": event["is_all_day"]
        }
        
        if event.get("location"):
            event_data["location"] = {"displayName": event["location"]}
            
        if event.get("body"):
            event_data["body"] = {
                "contentType": "HTML",
                "content": event["body"]
            }
            
        if event.get("attendees"):
            event_data["attendees"] = [
                {
                    "emailAddress": {"address": attendee["email"]},
                    "type": "required"
                }
                for attendee in event["attendees"]
            ]
            
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.graph_base_url}/users/{username}/events",
                headers=headers,
                json=event_data
            ) as response:
                data = await response.json()
                return self._format_event(data)

    async def update_calendar_event(
        self,
        username: str,
        event_id: str,
        event: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update an existing calendar event using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        event_data = {
            "subject": event["subject"],
            "start": {
                "dateTime": event["start_time"].isoformat(),
                "timeZone": "UTC"
            },
            "end": {
                "dateTime": event["end_time"].isoformat(),
                "timeZone": "UTC"
            },
            "isAllDay": event["is_all_day"]
        }
        
        if event.get("location"):
            event_data["location"] = {"displayName": event["location"]}
            
        if event.get("body"):
            event_data["body"] = {
                "contentType": "HTML",
                "content": event["body"]
            }
            
        if event.get("attendees"):
            event_data["attendees"] = [
                {
                    "emailAddress": {"address": attendee["email"]},
                    "type": "required"
                }
                for attendee in event["attendees"]
            ]
            
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                f"{self.graph_base_url}/users/{username}/events/{event_id}",
                headers=headers,
                json=event_data
            ) as response:
                data = await response.json()
                return self._format_event(data)

    async def delete_calendar_event(
        self,
        username: str,
        event_id: str
    ) -> None:
        """
        Delete a calendar event using Microsoft Graph API
        """
        headers = await self._get_headers(username)
        
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{self.graph_base_url}/users/{username}/events/{event_id}",
                headers=headers
            ) as response:
                if response.status != 204:
                    data = await response.json()
                    raise Exception(f"Failed to delete event: {data.get('error', {}).get('message')}")

    def _format_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Format event data from Graph API to match our schema"""
        return {
            "id": event["id"],
            "subject": event["subject"],
            "start_time": datetime.fromisoformat(event["start"]["dateTime"].rstrip('Z')),
            "end_time": datetime.fromisoformat(event["end"]["dateTime"].rstrip('Z')),
            "location": event.get("location", {}).get("displayName"),
            "body": event.get("body", {}).get("content"),
            "is_all_day": event.get("isAllDay", False),
            "organizer": event["organizer"]["emailAddress"]["address"],
            "attendees": [
                {
                    "email": attendee["emailAddress"]["address"],
                    "name": attendee["emailAddress"].get("name"),
                    "response_status": attendee.get("status", {}).get("response")
                }
                for attendee in event.get("attendees", [])
            ],
            "created_time": datetime.fromisoformat(event["createdDateTime"].rstrip('Z')),
            "modified_time": datetime.fromisoformat(event["lastModifiedDateTime"].rstrip('Z'))
        }

calendar_service = CalendarService()
