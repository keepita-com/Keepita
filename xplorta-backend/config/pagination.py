from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DefaultPagination(PageNumberPagination):
    """
    Custom pagination class for drf APIs.

    This class extends the standard DRF PageNumberPagination to provide
    a more detailed response structure that includes metadata about
    the pagination state, making it easier for frontend applications
    to implement pagination controls.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            self.request = request
            page_number = request.query_params.get(self.page_query_param, 1)
            if int(page_number) > 1:
                url = request.build_absolute_uri()
                url = url.replace(
                    f"{self.page_query_param}={page_number}",
                    f"{self.page_query_param}=1",
                )
                self.page = self.django_paginator_class(queryset, self.page_size).page(
                    1
                )
                return list(self.page)
            raise

    def get_paginated_response(self, data):
        return Response(
            {
                "result_count": len(data),
                "total_pages": self.page.paginator.num_pages,
                "next_page": self.get_next_link(),
                "previous_page": self.get_previous_link(),
                "has_next": self.page.has_next(),
                "has_previous": self.page.has_previous(),
                "total_results": self.page.paginator.count,
                "current_page": self.page.number,
                "results": data,
            }
        )

    def get_page_metadata(self):
        return {
            "total_pages": self.page.paginator.num_pages,
            "total_results": self.page.paginator.count,
            "current_page": self.page.number,
            "has_next": self.page.has_next(),
            "has_previous": self.page.has_previous(),
            "next_page": self.get_next_link(),
            "previous_page": self.get_previous_link(),
        }
