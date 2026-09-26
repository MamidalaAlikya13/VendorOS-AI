from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    store_id = Column(
        Integer,
        ForeignKey("stores.id"),
        nullable=False,
        index=True
    )

    product_name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    sku = Column(String(100), nullable=True)

    purchase_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)

    quantity = Column(Integer, nullable=False, default=0)
    minimum_stock = Column(Integer, nullable=False, default=5)

    expiry_date = Column(Date, nullable=True)