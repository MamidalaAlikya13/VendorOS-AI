from pydantic import BaseModel, EmailStr


class StoreCreate(BaseModel):
    store_name: str
    business_type: str
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None