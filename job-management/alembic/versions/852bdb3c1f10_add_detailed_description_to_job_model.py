"""Add detailed_description to Job model

Revision ID: 852bdb3c1f10
Revises: 6a7296ecd7b4
Create Date: 2025-03-19 15:54:34.897701

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '852bdb3c1f10'
down_revision: Union[str, None] = '6a7296ecd7b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('jobs', sa.Column('detailed_description', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('jobs', 'detailed_description')
    # ### end Alembic commands ###
