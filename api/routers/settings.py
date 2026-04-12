from fastapi import APIRouter, Depends

from api.dependencies import get_settings_service
from api.model.models import SettingsWebhookResponse, SettingsWebhookUpdate
from api.services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["settings"])


@router.put("/webhook", status_code=200, response_model=SettingsWebhookResponse)
def set_webhook(
    body: SettingsWebhookUpdate,
    service: SettingsService = Depends(get_settings_service),
):
    return service.set_webhook(body)


@router.get("/webhook", status_code=200, response_model=SettingsWebhookResponse)
def get_webhook(service: SettingsService = Depends(get_settings_service)):
    return service.get_webhook()
