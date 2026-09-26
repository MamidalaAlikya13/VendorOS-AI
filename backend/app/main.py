from fastapi import FastAPI
from app.database import engine, Base
from app.models.user import User
from app.api.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.models.store import Store
from app.api.store import router as store_router
from app.models.product import Product
from app.api.product import router as product_router
from app.models.sale import Sale
from app.api.sale import router as sale_router
from app.models.customer import Customer
from app.api.customer import router as customer_router
from app.models.supplier import Supplier
from app.api.supplier import router as supplier_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorOS AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(store_router)
app.include_router(product_router)
app.include_router(sale_router)
app.include_router(customer_router)
app.include_router(supplier_router)


@app.get("/")
def root():
    return {"message": "VendorOS AI backend is running"}


@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as connection:
            return {"status": "Database connected successfully"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}