"""Add nullable name column to users

Revision ID: 1694d15c674f
Revises: f17a86f24dd5
Create Date: 2025-04-03 13:59:49.527382

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1694d15c674f'
down_revision = 'f17a86f24dd5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('users', sa.Column('name', sa.String(), nullable=True))


def downgrade() -> None:
    pass
