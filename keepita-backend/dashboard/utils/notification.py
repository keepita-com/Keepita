from ..models import Notification

def send_notification(user, title, message=''):
    Notification.objects.create(user=user, title=title, message=message)