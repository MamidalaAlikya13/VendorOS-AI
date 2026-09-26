import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate


router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/{owner_id}")
def create_supplier(
    owner_id: int,
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db)
):

    # Phone validation
    if supplier_data.phone:

        if not re.fullmatch(
            r"[0-9]{10}",
            supplier_data.phone
        ):
            raise HTTPException(
                status_code=400,
                detail="Phone number must contain exactly 10 digits"
            )


    new_supplier = Supplier(
        owner_id=owner_id,
        name=supplier_data.name,
        phone=supplier_data.phone,
        email=supplier_data.email,
        company=supplier_data.company,
        address=supplier_data.address
    )


    db.add(new_supplier)

    db.commit()

    db.refresh(new_supplier)


    return {
        "message": "Supplier created successfully",
        "supplier_id": new_supplier.id,
        "name": new_supplier.name,
        "phone": new_supplier.phone,
        "email": new_supplier.email,
        "company": new_supplier.company,
        "address": new_supplier.address
    }


@router.get("/{owner_id}")
def get_suppliers(
    owner_id: int,
    db: Session = Depends(get_db)
):

    suppliers = (
        db.query(Supplier)
        .filter(
            Supplier.owner_id == owner_id
        )
        .order_by(
            Supplier.id.desc()
        )
        .all()
    )


    return [
        {
            "id": supplier.id,
            "name": supplier.name,
            "phone": supplier.phone,
            "email": supplier.email,
            "company": supplier.company,
            "address": supplier.address
        }

        for supplier in suppliers
    ]