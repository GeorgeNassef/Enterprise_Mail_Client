from typing import List, Optional, Dict, Any
from datetime import datetime
import aiohttp
from exchangelib import Credentials, Account, DELEGATE, Configuration
from ...core.config import settings
from ...core.security import auth_service

class ExchangeClient:
    def __init__(self):
        self.graph_base_url = "https://graph.microsoft.com/v1.0"
        self.ews_base_url = settings.EXCHANGE_SERVER
        
    async def _get_graph_headers(self, username: str) -> Dict[str, str]:
        """Get headers for Microsoft Graph API requests"""
        token = await auth_service.get_access_token(username)
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
    async def _get_ews_account(self, username: str) -> Account:
        """Get EWS Account instance"""
        token = await auth_service.get_access_token(username)
        credentials = Credentials(
            username,
            access_token=token
        )
        config = Configuration(
            server=self.ews_base_url,
            credentials=credentials
        )
        return Account(
            primary_smtp_address=username,
            config=config,
            access_type=DELEGATE
        )

    async def get_messages(
        self,
        username: str,
        folder: str = "inbox",
        page_size: int = 50,
        page_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get messages from specified folder using Microsoft Graph API
        """
        headers = await self._get_graph_headers(username)
        params = {
            "$top": page_size,
            "$orderby": "receivedDateTime desc",
            "$select": "id,subject,from,toRecipients,receivedDateTime,hasAttachments,bodyPreview"
        }
        if page_token:
            params["$skiptoken"] = page_token
            
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.graph_base_url}/users/{username}/mailFolders/{folder}/messages",
                headers=headers,
                params=params
            ) as response:
                data = await response.json()
                return {
                    "messages": data.get("value", []),
                    "nextPageToken": data.get("@odata.nextLink", "").split("skiptoken=")[-1]
                    if "@odata.nextLink" in data else None
                }

    async def get_message_detail(self, username: str, message_id: str) -> Dict[str, Any]:
        """
        Get detailed message information using EWS for rich content
        """
        account = await self._get_ews_account(username)
        message = account.inbox.get(id=message_id)
        return {
            "id": message.id,
            "subject": message.subject,
            "from": str(message.sender.email_address),
            "to": [str(r.email_address) for r in message.to_recipients],
            "cc": [str(r.email_address) for r in message.cc_recipients],
            "bcc": [str(r.email_address) for r in message.bcc_recipients],
            "body": message.body,
            "attachments": [{
                "id": att.attachment_id,
                "name": att.name,
                "content_type": att.content_type,
                "size": att.size
            } for att in message.attachments]
        }

    async def send_message(
        self,
        username: str,
        subject: str,
        body: str,
        to_recipients: List[str],
        cc_recipients: Optional[List[str]] = None,
        bcc_recipients: Optional[List[str]] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Send a new message using Microsoft Graph API
        """
        headers = await self._get_graph_headers(username)
        message_data = {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body
            },
            "toRecipients": [{"emailAddress": {"address": r}} for r in to_recipients]
        }
        
        if cc_recipients:
            message_data["ccRecipients"] = [
                {"emailAddress": {"address": r}} for r in cc_recipients
            ]
        if bcc_recipients:
            message_data["bccRecipients"] = [
                {"emailAddress": {"address": r}} for r in bcc_recipients
            ]
            
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.graph_base_url}/users/{username}/sendMail",
                headers=headers,
                json={"message": message_data}
            ) as response:
                if response.status == 202:
                    return "Message sent successfully"
                else:
                    data = await response.json()
                    raise Exception(f"Failed to send message: {data.get('error', {}).get('message')}")

exchange_client = ExchangeClient()
