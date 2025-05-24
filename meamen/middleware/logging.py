import time
import json
import logging
from typing import Callable, Any, Dict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from meamen.core.config import settings

# Configure logger
logger = logging.getLogger("request_logger")
logger.setLevel(getattr(logging, settings.log_level.upper()))

# Create console handler if it doesn't exist
if not logger.handlers:
    console_handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all incoming HTTP requests for debugging purposes.
    Logs request details including method, URL, headers, query parameters, and body.
    """

    async def dispatch(
        self, request: Request,
        call_next: Callable[[Request], Any],
    ) -> Response:
        # Skip logging if disabled in settings
        if not settings.log_requests:
            return await call_next(request)

        # Skip health checks if configured to do so
        if not settings.log_health_checks and request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        # Start timing the request
        start_time = time.time()

        # Extract request information
        method = request.method
        url = str(request.url)
        headers = dict(request.headers)
        query_params = dict(request.query_params)

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"

        # Try to read request body (for POST/PUT/PATCH requests)
        from typing import Union
        body: Union[dict[str, Any], str, None] = None
        if settings.log_request_body and method in ["POST", "PUT", "PATCH"]:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    # Try to decode as JSON for better logging
                    try:
                        body = json.loads(body_bytes.decode())
                        # Don't log sensitive information like passwords
                        if isinstance(body, dict) and "password" in body:
                            body = {**body, "password": "***REDACTED***"}
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        # If not JSON, just show the size
                        body = f"<binary data: {len(body_bytes)} bytes>"
            except Exception as e:
                body = f"<error reading body: {str(e)}>"

        # Log the incoming request
        request_log: Dict[str, Any] = {
            "type": "REQUEST",
            "method": method,
            "url": url,
            "client_ip": client_ip,
            "user_agent": headers.get("user-agent", "unknown"),
            "content_type": headers.get("content-type", "none"),
            "query_params": query_params if query_params else None,
            "body": body if body is not None else None,
        }

        # Filter out some verbose headers for cleaner logs
        filtered_headers = {
            k: v for k, v in headers.items()
            if k.lower() not in ["user-agent", "accept", "accept-encoding", "accept-language", "cache-control", "connection"]
        }
        if filtered_headers:
            request_log["headers"] = filtered_headers

        logger.info(f"🔄 {json.dumps(request_log, indent=2)}")

        # Process the request
        try:
            response = await call_next(request)

            # Calculate processing time
            process_time = time.time() - start_time

            # Log the response
            response_log: Dict[str, Any] = {
                "type": "RESPONSE",
                "method": method,
                "url": url,
                "status_code": response.status_code,
                "process_time_ms": round(process_time * 1000, 2),
                "client_ip": client_ip
            }

            # Add response headers if they contain useful debugging info
            response_headers: Dict[str, Any] = dict(response.headers)
            debug_headers: Dict[str, Any] = {
                k: v for k, v in response_headers.items()
                if k.lower() in ["content-type", "content-length", "x-process-time"]
            }
            if debug_headers:
                response_log["headers"] = debug_headers

            # Use different log levels based on status code
            if response.status_code >= 500:
                logger.error(f"❌ {json.dumps(response_log, indent=2)}")
            elif response.status_code >= 400:
                logger.warning(f"⚠️  {json.dumps(response_log, indent=2)}")
            else:
                logger.info(f"✅ {json.dumps(response_log, indent=2)}")

            return response

        except Exception as e:
            # Log any errors that occur during request processing
            process_time = time.time() - start_time
            error_log: Dict[str, Any] = {
                "type": "ERROR",
                "method": method,
                "url": url,
                "error": str(e),
                "error_type": type(e).__name__,
                "process_time_ms": round(process_time * 1000, 2),
                "client_ip": client_ip
            }
            logger.error(f"💥 {json.dumps(error_log, indent=2)}")
            raise


class HealthCheckFilter(logging.Filter):
    """
    Filter to optionally exclude health check requests from logs to reduce noise.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        # Skip logging for health check endpoints
        if hasattr(record, 'getMessage'):
            message = record.getMessage()
            # Skip health checks and static files
            skip_patterns = ['/health', '/docs', '/openapi.json', '/favicon.ico']
            return not any(pattern in message for pattern in skip_patterns)
        return True


# Optional: Add the health check filter
# logger.addFilter(HealthCheckFilter())
