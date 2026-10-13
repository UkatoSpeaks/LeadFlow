"""Fill the database with sample leads and discussions.

    python seed.py            add the sample data (refuses if leads already exist)
    python seed.py --reset    delete every lead and discussion first, then add it

Dates are relative to the moment the script runs, so the sample always contains
follow-ups that are due today, overdue and upcoming.
"""

import argparse
import sys
from datetime import datetime, time, timedelta

from sqlalchemy import delete, func, select

from app.database import SessionLocal
from app.models import Discussion, Lead, LeadStatus

NOW = datetime.now().astimezone()


def ago(days: int = 0, hours: int = 0) -> datetime:
    return NOW - timedelta(days=days, hours=hours)


def day_at(days_from_today: int, hour: int, minute: int = 0) -> datetime:
    """A local wall-clock time on a day relative to today."""
    day = NOW.date() + timedelta(days=days_from_today)
    return datetime.combine(day, time(hour, minute), tzinfo=NOW.tzinfo)


# Each discussion is (note, created_at, follow_up_at). They are listed oldest first,
# and the last one decides the lead's follow-up date.
SAMPLE_LEADS = [
    {
        "name": "Priya Sharma",
        "company": "Sharma Textiles",
        "phone": "+91 98765 43210",
        "status": LeadStatus.CONTACTED,
        "created_at": ago(days=9),
        "discussions": [
            ("Met at the Mumbai wealth summit. Interested in retirement planning for herself and her husband.", ago(days=9), None),
            ("Intro call done. Wants a comparison of two portfolio options before deciding.", ago(days=2), day_at(0, 10)),
        ],
    },
    {
        "name": "Rahul Mehta",
        "company": "Mehta & Sons",
        "phone": "+91 91234 56780",
        "status": LeadStatus.QUALIFIED,
        "created_at": ago(days=14),
        "discussions": [
            ("Inbound enquiry from the website about tax-saving investments.", ago(days=14), None),
            ("Shared the risk profile questionnaire.", ago(days=8), None),
            ("Questionnaire received. Moderate risk appetite, 15 year horizon. Call today to walk through the plan.", ago(days=1), day_at(0, 18)),
        ],
    },
    {
        "name": "Ananya Iyer",
        "company": "Iyer Consulting",
        "phone": None,
        "status": LeadStatus.PROPOSAL_SENT,
        "created_at": ago(days=21),
        "discussions": [
            ("Referred by an existing client. Runs her own consulting practice.", ago(days=21), None),
            ("Discovery call: wants to separate business and personal investments.", ago(days=12), None),
            ("Proposal emailed. She asked for a few days to review it with her accountant.", ago(days=6), day_at(-2, 11)),
        ],
    },
    {
        "name": "Vikram Singh",
        "company": None,
        "phone": "+91 99887 76655",
        "status": LeadStatus.CONTACTED,
        "created_at": ago(days=6),
        "discussions": [
            ("Called after he downloaded the SIP guide. Asked to be called back after his travel.", ago(days=5), day_at(-1, 15)),
        ],
    },
    {
        "name": "Neha Kapoor",
        "company": "Kapoor Designs",
        "phone": "+91 90000 12345",
        "status": LeadStatus.QUALIFIED,
        "created_at": ago(days=11),
        "discussions": [
            ("First call. Looking to plan for her daughter's education in about eight years.", ago(days=11), None),
            ("Sent education fund options. Review meeting booked for later this week.", ago(hours=5), day_at(3, 11, 30)),
        ],
    },
    {
        "name": "Arjun Nair",
        "company": "Nair Logistics",
        "phone": "+91 93456 78901",
        "status": LeadStatus.WON,
        "created_at": ago(days=30),
        "discussions": [
            ("Cold outreach. Agreed to a short introductory call.", ago(days=30), None),
            ("Presented the wealth management proposal to him and his CFO.", ago(days=18), None),
            ("Signed the advisory agreement. Onboarding paperwork sent.", ago(days=4), None),
        ],
    },
    {
        "name": "Sunita Reddy",
        "company": "Reddy Pharma",
        "phone": None,
        "status": LeadStatus.LOST,
        "created_at": ago(days=25),
        "discussions": [
            ("Enquired about portfolio management services.", ago(days=25), None),
            ("Decided to stay with her current advisor. Open to reconnecting next year.", ago(days=10), None),
        ],
    },
    {
        "name": "Karan Malhotra",
        "company": "Malhotra Ventures",
        "phone": "+91 97654 32109",
        "status": LeadStatus.NEW,
        "created_at": ago(hours=3),
        "discussions": [],
    },
]


def seed(reset: bool) -> int:
    with SessionLocal() as db:
        existing = db.scalar(select(func.count()).select_from(Lead))
        if existing and not reset:
            print(f"The database already has {existing} lead(s); nothing was added.")
            print("Run 'python seed.py --reset' to delete them and load the sample data.")
            return 1

        if reset:
            # Discussions are removed with their leads (ON DELETE CASCADE).
            db.execute(delete(Lead))

        discussion_count = 0
        for sample in SAMPLE_LEADS:
            discussions = [
                Discussion(note=note, created_at=created_at, follow_up_at=follow_up_at)
                for note, created_at, follow_up_at in sample["discussions"]
            ]
            lead = Lead(
                name=sample["name"],
                company=sample["company"],
                phone=sample["phone"],
                status=sample["status"],
                created_at=sample["created_at"],
                next_follow_up_at=discussions[-1].follow_up_at if discussions else None,
                discussions=discussions,
            )
            db.add(lead)
            discussion_count += len(discussions)

        db.commit()

    print(f"Seeded {len(SAMPLE_LEADS)} leads and {discussion_count} discussions.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load sample leads and discussions.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="delete all existing leads and discussions before seeding",
    )
    sys.exit(seed(parser.parse_args().reset))
