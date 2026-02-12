from django_filters import rest_framework as filters

from ..models import Contact

class ContactFilter(filters.FilterSet):
    name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    phone_number = filters.CharFilter(field_name='phone_number', lookup_expr='icontains')
    is_favorite = filters.BooleanFilter(field_name='is_favorite')
    has_image = filters.BooleanFilter(method='filter_has_image')
    
    class Meta:
        model = Contact
        fields = [
            'name', 'phone_number', 'is_favorite', 'has_image'
        ]

    def filter_has_image(self, queryset, name, value):
            if value:
                return queryset.exclude(profile_image__isnull=True).exclude(profile_image='')
            else:
                return queryset.filter(profile_image__isnull=True) | queryset.filter(profile_image='')