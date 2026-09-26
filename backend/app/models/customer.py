from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    name = Column(String(150), nullable=False)

    phone = Column(String(20), nullable=True)

    email = Column(String(150), nullable=True)

    address = Column(String(300), nullable=True)