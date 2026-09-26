from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    store_name = Column(String(150), nullable=False)
    business_type = Column(String(50), nullable=False)

    phone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    address = Column(String(300), nullable=True)