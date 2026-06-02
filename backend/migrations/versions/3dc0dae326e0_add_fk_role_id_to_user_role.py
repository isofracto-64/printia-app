"""add fk role_id to user_role

Revision ID: 3dc0dae326e0
Revises: ddc738ed0db7
Create Date: 2026-04-15 01:11:58.259991

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3dc0dae326e0'
down_revision: Union[str, Sequence[str], None] = 'ddc738ed0db7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    op.create_foreign_key(
        "user_role_role_id_fkey",  
        "user_role",               
        "role",                   
        ["role_id"],             
        ["id"],                   
        ondelete="CASCADE"        
    )

def downgrade():
    op.drop_constraint(
        "user_role_role_id_fkey",
        "user_role",
        type_="foreignkey"
    )
