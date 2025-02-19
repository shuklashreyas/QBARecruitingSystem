from alembic import op
import sqlalchemy as sa

# Define the new ENUM type
user_role_enum = sa.Enum('admin', 'recruiter', 'applicant', name='role')

# Revision identifiers, used by Alembic.
revision = 'a84805f4d8cc'
down_revision = 'd988d52aa0cc'
branch_labels = None
depends_on = None

def upgrade():
    # Create the ENUM type first
    user_role_enum.create(op.get_bind(), checkfirst=True)

    # Alter the 'role' column to use the new ENUM type
    op.alter_column('users', 'role',
                    type_=user_role_enum,
                    postgresql_using="role::text::role")  # Explicitly cast the existing 'role' values

def downgrade():
    # Drop the ENUM type
    user_role_enum.drop(op.get_bind(), checkfirst=True)
