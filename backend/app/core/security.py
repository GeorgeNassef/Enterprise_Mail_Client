from datetime import datetime, timedelta
from typing import Any, Optional
from jose import JWTError, jwt
from msal import ConfidentialClientApplication
from .config import settings

class AuthService:
    def __init__(self):
        self.msal_app = ConfidentialClientApplication(
            client_id=settings.AZURE_AD_CLIENT_ID,
            client_credential=settings.AZURE_AD_CLIENT_SECRET,
            authority=f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}"
        )
        
        self.scopes = [
            "https://outlook.office365.com/EWS.AccessAsUser.All",
            "https://graph.microsoft.com/Mail.Read",
            "https://graph.microsoft.com/Mail.Send",
            "https://graph.microsoft.com/Calendars.ReadWrite"
        ]
    
    async def get_access_token(self, username: str) -> Optional[str]:
        """
        Get access token for Exchange access using client credentials flow
        """
        try:
            result = self.msal_app.acquire_token_silent(self.scopes, account=username)
            if not result:
                result = self.msal_app.acquire_token_for_client(scopes=self.scopes)
            
            if "access_token" in result:
                return result["access_token"]
            return None
        except Exception as e:
            print(f"Error getting access token: {e}")
            return None

    async def create_access_token(
        self,
        subject: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT access token for internal API authentication
        """
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
            
        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    async def verify_token(self, token: str) -> Optional[str]:
        """
        Verify JWT token and return username
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            username: str = payload.get("sub")
            if username is None:
                return None
            return username
        except JWTError:
            return None

auth_service = AuthService()
