import logging
from django.utils import timezone
from .models import BackupLog

logger = logging.getLogger('dashboard')

class ProgressManager:
    
    @staticmethod
    def update_step(log_id, step_number, name, description, progress_percent=0, status='processing'):
        try:
            log = BackupLog.objects.get(id=log_id)
        except BackupLog.DoesNotExist:
            logger.error(f"BackupLog with ID {log_id} not found")
            return None
            
        log.current_step = step_number
        step_key = f'step_{step_number}'

        if not log.steps_data:
            log.steps_data = {}

        if step_key in log.steps_data:
            current_step = log.steps_data[step_key]
            
            if current_step.get('status') == 'completed' and status != 'failed':
                logger.debug(f"Step {step_number} already completed, ignoring update")
                return log
                
            if current_step.get('status') == 'failed' and status not in ['processing', 'completed']:
                logger.debug(f"Step {step_number} already failed, ignoring update unless it's being reprocessed")
                return log
            
            update_needed = False
            
            if status == 'failed':
                current_step['progress_percent'] = 0
                current_step['status'] = 'failed'
                current_step['description'] = description or f"Error: {description}"
                update_needed = True
            else:
                if progress_percent > current_step.get('progress_percent', 0):
                    current_step['progress_percent'] = progress_percent
                    update_needed = True
                
                if description and description != current_step.get('description') and not description.startswith('Extracting'):
                    current_step['description'] = description
                    update_needed = True
                
                status_priorities = {'pending': 0, 'processing': 1, 'completed': 2, 'failed': -1}
                current_status_priority = status_priorities.get(current_step.get('status', 'pending'), 0)
                new_status_priority = status_priorities.get(status, 0)
                
                if new_status_priority > current_status_priority:
                    current_step['status'] = status
                    update_needed = True
                
                if status == 'completed':
                    current_step['progress_percent'] = 100
                    current_step['status'] = 'completed'
                    update_needed = True
            
            if update_needed:
                current_step['timestamp'] = timezone.now().isoformat()
                
        else:
            log.steps_data[step_key] = {
                'name': name,
                'description': description,
                'progress_percent': progress_percent,
                'status': status,
                'timestamp': timezone.now().isoformat()
            }
            
            logger.debug(f"Moving to step {step_number} ({name}) without auto-completing previous steps")

        log.progress_percentage = calculate_overall_progress(log)
        
        log.save(update_fields=['current_step', 'steps_data', 'progress_percentage', 'updated_at'])
        logger.debug(f"Updated step {step_number} to {status} with {progress_percent}%")
        return log
    
    @staticmethod
    def mark_step_complete(log_id, step_number, name, description="Step completed successfully"):
        return ProgressManager.update_step(
            log_id, step_number, name, description, 100, 'completed'
        )
    
    @staticmethod
    def mark_step_failed(log_id, step_number, name, error_message):
        return ProgressManager.update_step(
            log_id, step_number, name, f"Error: {error_message}", 0, 'failed'
        )

    @staticmethod
    def complete_process(log_id):
        try:
            log = BackupLog.objects.get(id=log_id)
        except BackupLog.DoesNotExist:
            logger.error(f"BackupLog with ID {log_id} not found")
            return None
        
        log.status = 'completed'
        
        progress_sum = 0
        step_count = 0
        
        for step_key, step_data in log.steps_data.items():
            step_count += 1
            if step_data.get('status') == 'completed':
                progress_sum += 100
            elif step_data.get('status') == 'processing':
                step_data['status'] = 'completed'
                step_data['progress_percent'] = 100
                progress_sum += 100
            elif step_data.get('status') == 'failed':
                pass
            else:
                step_data['status'] = 'completed'
                step_data['progress_percent'] = 100
                progress_sum += 100
        
        if step_count:
            log.progress_percentage = min(100, progress_sum / step_count)
        else:
            log.progress_percentage = 0
            
        log.save()
        logger.debug(f"Process completed with overall progress {log.progress_percentage}%")
        return log

def calculate_overall_progress(log):
    if not log.steps_data or not log.total_steps:
        return 0.0
    
    completed_count = 0
    processing_contribution = 0.0
    step_weight = 1.0 / log.total_steps
    
    for i in range(1, log.total_steps + 1):
        step_key = f'step_{i}'
        if step_key not in log.steps_data:
            continue
        
        step = log.steps_data[step_key]
        status = step.get('status')
        
        if status == 'completed':
            completed_count += 1
        elif status == 'processing':
            progress_percent = step.get('progress_percent', 0)
            processing_contribution += (progress_percent / 100.0) * step_weight
        elif status == 'failed':
            pass
        
    base_percentage = completed_count * step_weight * 100.0
    
    total_percentage = base_percentage + (processing_contribution * 100.0)
    
    return min(total_percentage, 100.0)