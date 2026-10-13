from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}


def test_create_lead_with_only_a_name_defaults_to_new(client: TestClient, unique_name: str) -> None:
    response = client.post("/leads", json={"name": unique_name})

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == unique_name
    assert body["status"] == "new"
    assert body["company"] is None
    assert body["phone"] is None
    assert body["next_follow_up_at"] is None
    assert body["last_note"] is None
    assert body["last_discussion_at"] is None


def test_create_lead_trims_text_and_stores_blank_optionals_as_null(client: TestClient, unique_name: str) -> None:
    response = client.post(
        "/leads",
        json={"name": f"  {unique_name}  ", "company": "  Acme  ", "phone": "   "},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == unique_name
    assert body["company"] == "Acme"
    assert body["phone"] is None


def test_create_lead_requires_a_name(client: TestClient) -> None:
    for payload in ({}, {"name": ""}, {"name": "   "}):
        response = client.post("/leads", json=payload)

        assert response.status_code == 422
        error = response.json()["error"]
        assert error["code"] == "validation_error"
        assert error["fields"][0]["field"] == "name"


def test_create_lead_rejects_unknown_status(client: TestClient, unique_name: str) -> None:
    response = client.post("/leads", json={"name": unique_name, "status": "archived"})

    assert response.status_code == 422
    assert response.json()["error"]["fields"][0]["field"] == "status"


def test_get_lead(client: TestClient, lead: dict) -> None:
    response = client.get(f"/leads/{lead['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == lead["id"]


def test_get_missing_lead_returns_404(client: TestClient) -> None:
    response = client.get("/leads/999999999")

    assert response.status_code == 404
    assert response.json() == {"error": {"code": "not_found", "message": "Lead 999999999 not found"}}


def test_get_lead_with_non_numeric_id_returns_422(client: TestClient) -> None:
    response = client.get("/leads/abc")

    assert response.status_code == 422
    assert response.json()["error"]["fields"][0]["field"] == "lead_id"


def test_update_status_persists(client: TestClient, lead: dict) -> None:
    response = client.patch(f"/leads/{lead['id']}", json={"status": "proposal_sent"})

    assert response.status_code == 200
    assert response.json()["status"] == "proposal_sent"
    assert client.get(f"/leads/{lead['id']}").json()["status"] == "proposal_sent"


def test_update_status_rejects_unknown_status(client: TestClient, lead: dict) -> None:
    response = client.patch(f"/leads/{lead['id']}", json={"status": "archived"})

    assert response.status_code == 422
    assert client.get(f"/leads/{lead['id']}").json()["status"] == "new"


def test_update_status_of_missing_lead_returns_404(client: TestClient) -> None:
    response = client.patch("/leads/999999999", json={"status": "won"})

    assert response.status_code == 404


def test_list_includes_created_lead(client: TestClient, lead: dict) -> None:
    response = client.get("/leads")

    assert response.status_code == 200
    assert lead["id"] in [item["id"] for item in response.json()]


def test_list_filters_by_status(client: TestClient, unique_name: str) -> None:
    new_lead = client.post("/leads", json={"name": f"{unique_name} A"}).json()
    won_lead = client.post("/leads", json={"name": f"{unique_name} B", "status": "won"}).json()

    response = client.get("/leads", params={"status": "won", "search": unique_name})

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [won_lead["id"]]
    assert new_lead["id"] not in [item["id"] for item in response.json()]


def test_list_rejects_unknown_status_filter(client: TestClient) -> None:
    response = client.get("/leads", params={"status": "archived"})

    assert response.status_code == 422


def test_list_search_is_case_insensitive_and_matches_part_of_the_name(
    client: TestClient, lead: dict, unique_name: str
) -> None:
    fragment = unique_name[5:].upper()

    response = client.get("/leads", params={"search": fragment})

    assert [item["id"] for item in response.json()] == [lead["id"]]


def test_list_search_treats_wildcards_literally(client: TestClient, lead: dict) -> None:
    response = client.get("/leads", params={"search": "%"})

    assert lead["id"] not in [item["id"] for item in response.json()]


def test_unknown_route_uses_the_error_shape(client: TestClient) -> None:
    response = client.get("/nope")

    assert response.status_code == 404
    assert response.json() == {"error": {"code": "http_error", "message": "Not Found"}}
