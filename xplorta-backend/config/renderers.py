from typing import Any, Dict, Optional, Union

from rest_framework.renderers import JSONRenderer
from rest_framework.utils import json


def find_detail_message(data: Dict[str, Any], status_code: int) -> Optional[str]:
    try:
        if isinstance(data, dict):
            if "detail" in data:
                detail = data.pop("detail")
                return str(detail)

            elif "message" in data:
                detail = data.pop("message")
                return str(detail)

            if not str(status_code).startswith("2"):
                if data:
                    first_key = next(iter(data))
                    if isinstance(data[first_key], list) and len(data[first_key]) > 0:
                        return f"{first_key}: {data[first_key][0]}"
                    elif isinstance(data[first_key], str):
                        return f"{first_key}: {data[first_key]}"
                return "There was an error processing your request"
    except Exception as e:
        pass
    return None


class ApiRenderer(JSONRenderer):
    """
    Custom renderer that formats responses in a consistent structure:
    {
        "data": {...},
        "message": "Status message",
        "status": "True|False"
    }
    """

    def render(
        self,
        data: Dict[str, Any],
        accepted_media_type: Optional[str] = None,
        renderer_context: Optional[Dict[str, Any]] = None,
    ) -> bytes:
        """Format the response data."""
        if renderer_context is None:
            renderer_context = {}

        response = renderer_context.get("response")
        status_code = response.status_code if response else 200

        is_success = str(status_code).startswith("2")

        response_dict = {
            "data": {} if data is None else data,
            "message": None,
            "status": True if is_success else False,
        }

        if data:
            message = find_detail_message(data, status_code)
            if message:
                response_dict["message"] = message

        if not is_success and not response_dict["message"]:
            response_dict["message"] = (
                "There was an error processing your request. Please try again later."
            )
        elif is_success and not response_dict["message"]:
            response_dict["message"] = "The operation was successful."

        if not is_success and data is None:
            response_dict["data"] = {}

        return super().render(response_dict, accepted_media_type, renderer_context)
