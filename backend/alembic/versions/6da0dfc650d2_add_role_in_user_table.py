"""add role in user table

Revision ID: 6da0dfc650d2
Revises: 0a39f76f0ba4
Create Date: 2026-10-20 22:56:39.956109

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6da0dfc650d2"
down_revision: Union[str, Sequence[str], None] = "0a39f76f0ba4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Existing rows need a value before NOT NULL can be applied
    op.add_column(
        "users",
        sa.Column("role", sa.String(), nullable=False, server_default="user"),
    )
    # Keep NOT NULL, but don't force default forever for new inserts from app
    op.alter_column("users", "role", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "role")
