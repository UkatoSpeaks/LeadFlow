import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)

# Request locations that prefix a validation error's path but mean nothing to the client.
_LOCATION_PREFIXES = {"body", "query", "path"}


class AppError(Exception):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    code = "internal_error"

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


def error_response(status_code: int, code: str, message: str, fields: list[dict] | None = None) -> JSONResponse:
    """Every error leaves the API in this one shape."""
    error: dict = {"code": code, "message": message}
    if fields is not None:
        error["fields"] = fields
    return JSONResponse(status_code=status_code, content={"error": error})


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return error_response(exc.status_code, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        fields = [
            {
                "field": ".".join(str(part) for part in err["loc"] if part not in _LOCATION_PREFIXES),
                "message": err["msg"],
            }
            for err in exc.errors()
        ]
        return error_response(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "validation_error",
            "Request validation failed",
            fields,
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return error_response(exc.status_code, "http_error", str(exc.detail))

    @app.exception_handler(OperationalError)
    async def handle_database_unavailable(request: Request, exc: OperationalError) -> JSONResponse:
        logger.exception("Database is not reachable")
        return error_response(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "database_unavailable",
            "Database is not reachable",
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "internal_error",
            "Something went wrong",
        )
