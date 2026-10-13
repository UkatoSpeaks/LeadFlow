from collections.abc import Generator
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.main import app


@pytest.fixture
def db() -> Generator[Session, None, None]:
    """A session whose work is rolled back after the test, so no test data is left behind.

    The API commits inside its handlers; "create_savepoint" turns those commits into
    savepoints of the outer transaction, which is then rolled back.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        autoflush=False,
        expire_on_commit=False,
    )
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def unique_name() -> str:
    """A name no existing row can match, so tests do not depend on an empty database."""
    return f"Test Lead {uuid4().hex}"


@pytest.fixture
def lead(client: TestClient, unique_name: str) -> dict:
    response = client.post("/leads", json={"name": unique_name})
    assert response.status_code == 201
    return response.json()
