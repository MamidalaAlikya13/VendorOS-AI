import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/{owner_id}")
def create_customer(
    owner_id: int,
    customer_data: CustomerCreate,
    db: Session = Depends(get_db)
):

    # Phone validation
    if customer_data.phone:

        if not re.fullmatch(r"[0-9]{10}", customer_data.phone):

            raise HTTPException(
                status_code=400,
                detail="Phone number must contain exactly 10 digits"
            )

    new_customer = Customer(
        owner_id=owner_id,
        name=customer_data.name,
        phone=customer_data.phone,
        email=customer_data.email,
        address=customer_data.address
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return {
        "message": "Customer created successfully",
        "customer_id": new_customer.id,
        "name": new_customer.name,
        "phone": new_customer.phone,
        "email": new_customer.email,
        "address": new_customer.address
    }


@router.get("/{owner_id}")
def get_customers(
    owner_id: int,
    db: Session = Depends(get_db)
):

    customers = db.query(Customer).filter(
        Customer.owner_id == owner_id
    ).order_by(
        Customer.id.desc()
    ).all()

    return [
        {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
            "address": customer.address
        }
        for customer in customers
    ]