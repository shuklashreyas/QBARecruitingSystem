"""Add owner_id to jobs table

Revision ID: 68758dbdbc09
Revises: 92dfd0c53d15
Create Date: 2025-04-03 18:06:07.396788

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '68758dbdbc09'
down_revision: Union[str, None] = '92dfd0c53d15'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
