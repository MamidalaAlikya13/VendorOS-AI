from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.sale import Sale
from app.models.product import Product
from app.models.store import Store
from app.schemas.sale import SaleCreate


router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/{owner_id}")
def create_sale(
    owner_id: int,
    sale_data: SaleCreate,
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

    product = db.query(Product).filter(
        Product.id == sale_data.product_id,
        Product.owner_id == owner_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if sale_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if product.quantity < sale_data.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    unit_price = product.selling_price
    total_amount = unit_price * sale_data.quantity

    product.quantity -= sale_data.quantity

    new_sale = Sale(
        owner_id=owner_id,
        store_id=store.id,
        product_id=product.id,
        quantity=sale_data.quantity,
        unit_price=unit_price,
        total_amount=total_amount,
        customer_name=sale_data.customer_name
    )

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    return {
        "message": "Sale created successfully",
        "sale_id": new_sale.id,
        "product_name": product.product_name,
        "quantity": sale_data.quantity,
        "unit_price": unit_price,
        "total_amount": total_amount,
        "remaining_stock": product.quantity
    }


@router.get("/{owner_id}")
def get_sales(
    owner_id: int,
    db: Session = Depends(get_db)
):

    sales = db.query(Sale).filter(
        Sale.owner_id == owner_id
    ).order_by(
        Sale.created_at.desc()
    ).all()

    return [
        {
            "id": sale.id,
            "product_id": sale.product_id,
            "quantity": sale.quantity,
            "unit_price": sale.unit_price,
            "total_amount": sale.total_amount,
            "customer_name": sale.customer_name,
            "created_at": sale.created_at
        }
        for sale in sales
    ]