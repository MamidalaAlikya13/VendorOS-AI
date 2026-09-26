from pydantic import BaseModel, EmailStr


class SupplierCreate(BaseModel):
    name: str
    phone: str | None = None
    email: EmailStr | None = None
    company: str | None = None
    address: str | None = None