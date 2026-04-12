from urllib.parse import urlparse

from fastapi import HTTPException

from api.database import get_db
from api.model.models import SettingsWebhookResponse, SettingsWebhookUpdate
from api.repositories.settings_repo import SettingsRepository

WEBHOOK_SETTING_KEY = "default_webhook_url"


class SettingsService:
    def _validate_discord_webhook_url(self, webhook_url: str) -> None:
        parsed = urlparse(webhook_url)
        valid_hosts = {"discord.com", "www.discord.com", "discordapp.com", "www.discordapp.com"}
        if parsed.scheme not in {"http", "https"} or parsed.hostname not in valid_hosts:
            raise HTTPException(status_code=422, detail="Webhook URL must be a Discord webhook URL")
        if not parsed.path.startswith("/api/webhooks/"):
            raise HTTPException(status_code=422, detail="Webhook URL must be a Discord webhook URL")

    def set_webhook(self, data: SettingsWebhookUpdate) -> SettingsWebhookResponse:
        with get_db() as conn:
            repo = SettingsRepository(conn)
            webhook_url = str(data.webhook_url)
            self._validate_discord_webhook_url(webhook_url)
            return SettingsWebhookResponse(webhook_url=repo.set(WEBHOOK_SETTING_KEY, webhook_url))

    def get_webhook(self) -> SettingsWebhookResponse:
        with get_db() as conn:
            repo = SettingsRepository(conn)
            webhook_url = repo.get(WEBHOOK_SETTING_KEY)
            if webhook_url is None:
                raise HTTPException(status_code=404, detail="Webhook URL is not configured")
            return SettingsWebhookResponse(webhook_url=webhook_url)
