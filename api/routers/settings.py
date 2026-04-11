from fastapi import APIRouter, Request

from api.config import resolve_api_base_url
from api.model.models_settings import ApiBaseUrlResponse

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=ApiBaseUrlResponse)
def get_settings(request: Request):
    return ApiBaseUrlResponse(api_base_url=resolve_api_base_url(request))
