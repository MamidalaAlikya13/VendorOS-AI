from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.store import Store
from app.schemas.store import StoreCreate

router = APIRouter(
    prefix="/store",
    tags=["Store"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/{owner_id}")
def create_store(
    owner_id: int,
    store: StoreCreate,
    db: Session = Depends(get_db)
):
    existing_store = db.query(Store).filter(
        Store.owner_id == owner_id
    ).first()

    if existing_store:
        raise HTTPException(
            status_code=400,
            detail="Store already exists for this user"
        )

    new_store = Store(
        owner_id=owner_id,
        store_name=store.store_name,
        business_type=store.business_type,
        phone=store.phone,
        email=store.email,
        address=store.address
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return {
        "message": "Store created successfully",
        "store_id": new_store.id,
        "owner_id": new_store.owner_id,
        "store_name": new_store.store_name,
        "business_type": new_store.business_type,
        "phone": new_store.phone,
        "email": new_store.email,
        "address": new_store.address
    }


@router.put("/{owner_id}")
def update_store(
    owner_id: int,
    store: StoreCreate,
    db: Session = Depends(get_db)
):
    existing_store = db.query(Store).filter(
        Store.owner_id == owner_id
    ).first()

    if not existing_store:
        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    existing_store.store_name = store.store_name
    existing_store.business_type = store.business_type
    existing_store.phone = store.phone
    existing_store.email = store.email
    existing_store.address = store.address

    db.commit()
    db.refresh(existing_store)

    return {
        "message": "Store updated successfully",
        "store_id": existing_store.id,
        "owner_id": existing_store.owner_id,
        "store_name": existing_store.store_name,
        "business_type": existing_store.business_type,
        "phone": existing_store.phone,
        "email": existing_store.email,
        "address": existing_store.address
    }


@router.get("/{owner_id}")
def get_store(
    owner_id: int,
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

    return {
        "store_id": store.id,
        "owner_id": store.owner_id,
        "store_name": store.store_name,
        "business_type": store.business_type,
        "phone": store.phone,
        "email": store.email,
        "address": store.address
    }