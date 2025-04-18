"""Make user name non-nullable

Revision ID: 7edbe2bf18df
Revises: 1694d15c674f
Create Date: 2025-04-03 14:07:48.813903

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7edbe2bf18df'
down_revision: Union[str, None] = '1694d15c674f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute(
        "ALTER TABLE applications ALTER COLUMN responses TYPE JSON USING responses::json")

    op.alter_column('users', 'name',
                    existing_type=sa.VARCHAR(),
                    nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('users', 'name',
                    existing_type=sa.VARCHAR(),
                    nullable=True)
    op.alter_column('applications', 'responses',
                    existing_type=postgresql.JSON(astext_type=sa.Text()),
                    type_=sa.TEXT(),
                    nullable=True)
    # ### end Alembic commands ###
