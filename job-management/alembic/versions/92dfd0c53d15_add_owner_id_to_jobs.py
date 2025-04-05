"""Add owner_id to jobs

Revision ID: 92dfd0c53d15
Revises: 2653b53ea392
Create Date: 2025-04-03 16:54:16.583471

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '92dfd0c53d15'
down_revision: Union[str, None] = '2653b53ea392'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('jobs', sa.Column('owner_id', sa.Integer(),
                  sa.ForeignKey('users.id'), nullable=True))


def downgrade():
    op.drop_column('jobs', 'owner_id')
