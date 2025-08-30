import django_filters
from django.db.models import Q

from dashboard.models import Alarm


class AlarmFilter(django_filters.FilterSet):

    active = django_filters.BooleanFilter(field_name="active", label="Active Status")

    time_from = django_filters.TimeFilter(
        field_name="time", lookup_expr="gte", label="Time From"
    )
    time_to = django_filters.TimeFilter(
        field_name="time", lookup_expr="lte", label="Time To"
    )

    repeat_type = django_filters.NumberFilter(
        field_name="repeat_type", label="Repeat Type"
    )

    created_from = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte", label="Created From"
    )
    created_to = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte", label="Created To"
    )

    class Meta:
        model = Alarm
        fields = [
            "active",
            "repeat_type",
            "time_from",
            "time_to",
            "created_from",
            "created_to",
        ]
