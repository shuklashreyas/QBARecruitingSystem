"""Merge heads

Revision ID: fc457d1de9bc
Revises: 308ba4796285, a84805f4d8cc
Create Date: 2025-02-20 13:46:50.222628

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc457d1de9bc'
down_revision: Union[str, None] = ('308ba4796285', 'a84805f4d8cc')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
