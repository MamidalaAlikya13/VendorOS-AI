from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.product import Product
from app.models.store import Store


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{owner_id}")
def create_product(
    owner_id: int,
    product_data: dict,
    db: Session = Depends(get_db)
):

    store = db.query(Store).filter(
        Store.owner_id == owner_id
    ).first()

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    new_product = Product(
        owner_id=owner_id,
        store_id=store.id,
        product_name=product_data["product_name"],
        category=product_data["category"],
        sku=product_data.get("sku"),
        purchase_price=product_data["purchase_price"],
        selling_price=product_data["selling_price"],
        quantity=product_data["quantity"],
        minimum_stock=product_data["minimum_stock"],
        expiry_date=product_data.get("expiry_date")
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product added successfully",
        "product_id": new_product.id
    }


@router.get("/{owner_id}")
def get_products(
    owner_id: int,
    db: Session = Depends(get_db)
):

    products = db.query(Product).filter(
        Product.owner_id == owner_id
    ).all()

    return [
        {
            "id": product.id,
            "product_name": product.product_name,
            "category": product.category,
            "sku": product.sku,
            "purchase_price": product.purchase_price,
            "selling_price": product.selling_price,
            "quantity": product.quantity,
            "minimum_stock": product.minimum_stock,
            "expiry_date": product.expiry_date
        }
        for product in products
    ]