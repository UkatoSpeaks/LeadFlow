from datetime import datetime

from fastapi.testclient import TestClient


def add_discussion(client: TestClient, lead_id: int, note: str, follow_up_at: str | None = None) -> dict:
    payload: dict = {"note": note}
    if follow_up_at is not None:
        payload["follow_up_at"] = follow_up_at
    response = client.post(f"/leads/{lead_id}/discussions", json=payload)
    assert response.status_code == 201
    return response.json()


def test_new_lead_has_no_discussions(client: TestClient, lead: dict) -> None:
    response = client.get(f"/leads/{lead['id']}/discussions")

    assert response.status_code == 200
    assert response.json() == []


def test_create_discussion(client: TestClient, lead: dict) -> None:
    response = client.post(f"/leads/{lead['id']}/discussions", json={"note": "  Intro call  "})

    assert response.status_code == 201
    body = response.json()
    assert body["lead_id"] == lead["id"]
    assert body["note"] == "Intro call"
    assert body["follow_up_at"] is None


def test_discussions_are_listed_newest_first(client: TestClient, lead: dict) -> None:
    for note in ("first", "second", "third"):
        add_discussion(client, lead["id"], note)

    response = client.get(f"/leads/{lead['id']}/discussions")

    assert [item["note"] for item in response.json()] == ["third", "second", "first"]


def test_latest_discussion_shows_on_the_lead(client: TestClient, lead: dict) -> None:
    add_discussion(client, lead["id"], "first")
    latest = add_discussion(client, lead["id"], "second")

    fetched = client.get(f"/leads/{lead['id']}").json()
    listed = next(item for item in client.get("/leads").json() if item["id"] == lead["id"])

    for body in (fetched, listed):
        assert body["last_note"] == "second"
        assert body["last_discussion_at"] == latest["created_at"]


def test_follow_up_date_updates_the_lead(client: TestClient, lead: dict) -> None:
    add_discussion(client, lead["id"], "Call back", follow_up_at="2030-01-15T10:30:00+05:30")

    follow_up = client.get(f"/leads/{lead['id']}").json()["next_follow_up_at"]

    assert datetime.fromisoformat(follow_up) == datetime.fromisoformat("2030-01-15T10:30:00+05:30")


def test_discussion_without_follow_up_keeps_the_existing_one(client: TestClient, lead: dict) -> None:
    add_discussion(client, lead["id"], "Call back", follow_up_at="2030-01-15T10:30:00+05:30")
    add_discussion(client, lead["id"], "Quick note")

    follow_up = client.get(f"/leads/{lead['id']}").json()["next_follow_up_at"]

    assert datetime.fromisoformat(follow_up) == datetime.fromisoformat("2030-01-15T10:30:00+05:30")


def test_discussion_requires_a_note(client: TestClient, lead: dict) -> None:
    for payload in ({}, {"note": ""}, {"note": "   "}):
        response = client.post(f"/leads/{lead['id']}/discussions", json=payload)

        assert response.status_code == 422
        assert response.json()["error"]["fields"][0]["field"] == "note"


def test_follow_up_date_must_include_a_timezone(client: TestClient, lead: dict) -> None:
    response = client.post(
        f"/leads/{lead['id']}/discussions",
        json={"note": "Call back", "follow_up_at": "2030-01-15T10:30:00"},
    )

    assert response.status_code == 422
    assert response.json()["error"]["fields"][0]["field"] == "follow_up_at"


def test_discussions_of_missing_lead_return_404(client: TestClient) -> None:
    assert client.get("/leads/999999999/discussions").status_code == 404
    assert client.post("/leads/999999999/discussions", json={"note": "hi"}).status_code == 404
