from rest_framework.renderers import JSONRenderer
from rest_framework.utils import json
from django.utils.translation import gettext as _

def find_detail_message(data, status_code):
    if 'detail' in data:
        detail = data['detail']
        del data['detail']
        return detail
    elif 'message' in data:
        detail = data['message']
        del data['message']
        return detail

    if not str(status_code).startswith('2'):
        try:
            for key in data.keys():
                if key != 'non_field_errors':
                    field_name = _(key)
                    error_message = data[key][0]
                    return _("Field {field_name}: {error_message}").format(
                        field_name=field_name, error_message=error_message
                    )
            if 'non_field_errors' in data:
                return data['non_field_errors'][0]
            return _("An unknown error occurred")
        except:
            return _("An unknown error occurred")
    else:
        return _("The operation was successful")

class ApiRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context['response'].status_code

        response = {
            "status": True,
            "data": data,
            "message": None
        }

        if data:
            detail = find_detail_message(data, status_code)
            response["message"] = detail
        elif str(status_code).startswith('2'):
            response["message"] = _("The operation was successful")
        else:
            response["message"] = _("An error occurred during the operation")

        if not str(status_code).startswith('2'):
            response["status"] = False
            response['data'] = []

        return super(ApiRenderer, self).render(response, accepted_media_type, renderer_context)