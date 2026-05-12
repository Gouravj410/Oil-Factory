"""
General Utilities and Helpers
"""

from datetime import datetime, timedelta
import json
import logging
from functools import wraps

logger = logging.getLogger(__name__)


def paginate_query(query, page: int = 1, per_page: int = 50):
    """
    Paginate SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-indexed)
        per_page: Items per page
        
    Returns:
        Tuple (items, total_count, total_pages, current_page)
    """
    total_count = query.count()
    total_pages = (total_count + per_page - 1) // per_page
    
    # Validate page
    if page < 1:
        page = 1
    if page > total_pages and total_pages > 0:
        page = total_pages
    
    items = query.limit(per_page).offset((page - 1) * per_page).all()
    
    return items, total_count, total_pages, page


def format_response(data=None, message: str = None, error: str = None, status_code: int = 200):
    """
    Format API response
    
    Args:
        data: Response data
        message: Success message
        error: Error message
        status_code: HTTP status code
        
    Returns:
        Tuple (response_dict, status_code)
    """
    response = {
        "success": error is None,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    if data is not None:
        response["data"] = data
    
    if message:
        response["message"] = message
    
    if error:
        response["error"] = error
    
    return response, status_code


def parse_json_safe(data):
    """Safely parse JSON data"""
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return None
    return data


class DateRangeFilter:
    """Helper for date range filtering"""
    
    @staticmethod
    def get_date_range(period: str) -> tuple:
        """
        Get date range for common periods
        
        Args:
            period: today, week, month, year
            
        Returns:
            Tuple (start_date, end_date)
        """
        now = datetime.utcnow()
        
        if period == "today":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1)
        
        elif period == "week":
            start = now - timedelta(days=now.weekday())
            start = start.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=7)
        
        elif period == "month":
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            # Get first day of next month
            next_month = start + timedelta(days=32)
            end = next_month.replace(day=1)
        
        elif period == "year":
            start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            end = start.replace(year=start.year + 1)
        
        else:
            return None, None
        
        return start, end
    
    @staticmethod
    def parse_custom_range(start_str: str, end_str: str) -> tuple:
        """
        Parse custom date range from strings
        
        Args:
            start_str: Start date (ISO format)
            end_str: End date (ISO format)
            
        Returns:
            Tuple (start_date, end_date) or (None, None) if invalid
        """
        try:
            start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
            return start, end
        except (ValueError, AttributeError):
            return None, None


def timing_decorator(func):
    """Decorator to time function execution"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = datetime.utcnow()
        result = func(*args, **kwargs)
        end = datetime.utcnow()
        elapsed = (end - start).total_seconds()
        logger.info(f"{func.__name__} took {elapsed:.2f} seconds")
        return result
    return wrapper


class BatchProcessor:
    """Helper for batch processing large iterables"""
    
    @staticmethod
    def process_in_batches(items, batch_size: int, processor_func):
        """
        Process items in batches
        
        Args:
            items: Iterable of items
            batch_size: Size of each batch
            processor_func: Function to process each batch
            
        Returns:
            List of results
        """
        results = []
        batch = []
        
        for item in items:
            batch.append(item)
            
            if len(batch) >= batch_size:
                result = processor_func(batch)
                results.append(result)
                batch = []
        
        # Process remaining items
        if batch:
            result = processor_func(batch)
            results.append(result)
        
        return results


def validate_phone(phone: str) -> bool:
    """Validate Indian phone number"""
    if not phone:
        return False
    
    # Remove whitespace and hyphens
    phone = phone.replace(" ", "").replace("-", "")
    
    # Check length (10 digits for Indian numbers)
    if len(phone) != 10:
        return False
    
    # Check if all digits
    if not phone.isdigit():
        return False
    
    return True


def sanitize_input(text: str, max_length: int = 255) -> str:
    """Sanitize user input"""
    if not text:
        return ""
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_city(city: str) -> bool:
    """Validate city name"""
    if not city:
        return False
    
    city = city.strip()
    
    if len(city) < 2 or len(city) > 100:
        return False
    
    return True
