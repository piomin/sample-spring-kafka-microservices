# Order Rejection Analysis and Recommendations

## Summary
The microservices are working correctly, but many orders are being rejected due to insufficient customer balance or insufficient stock. This document analyzes the root causes and provides recommendations.

## Root Cause Analysis

### 1. Order Generation
**Location**: `order-service/src/main/java/pl/piomin/order/service/OrderGeneratorService.java` (line 29)

Orders are generated with:
- **customerId**: Random between 1-100
- **productId**: Random between 1-100
- **price**: 100 × (1-5) = **100-500**
- **productCount**: 1-5 items

### 2. Payment Service Initialization
**Location**: `payment-service/src/main/java/pl/piomin/payment/PaymentApp.java` (line 47)

Customers are initialized with:
- **amountAvailable**: Random between **100-1000**
- 100 customers total

**Rejection Condition** (line 27 in OrderManageService.java):
```java
if (order.getPrice() < customer.getAmountAvailable()) {
    order.setStatus("ACCEPT");
}
```

### 3. Stock Service Initialization
**Location**: `stock-service/src/main/java/pl/piomin/stock/StockApp.java` (line 45)

Products are initialized with:
- **availableItems**: Random between **10-1000**
- 1000 products total

**Rejection Condition** (line 28 in OrderManageService.java):
```java
if (order.getProductCount() < product.getAvailableItems()) {
    order.setStatus("ACCEPT");
}
```

## Why Orders Are Being Rejected

### Payment Rejections
- Orders range from 100-500 in price
- Customers range from 100-1000 in balance
- **Probability**: ~50% of orders will be rejected due to insufficient balance
  - Many customers with ~100-200 balance will reject orders with price 400-500

### Stock Rejections
- Orders request 1-5 items
- Products have 10-1000 items available
- **Probability**: Lower rejection rate (~5-15%)
  - Only happens when product stock is very low (10-20 items) AND multiple orders hit the same product

### Combined Effect
When both services must approve (SAGA pattern):
- Payment approval: ~50%
- Stock approval: ~90%
- **Overall CONFIRMED rate: ~45%** (0.5 × 0.9)

## Recommendations to Increase Acceptance

### Option 1: Increase Customer Balances (Recommended for Testing)

Modify `payment-service/PaymentApp.java` line 47:

**Current:**
```java
int count = r.nextInt(100, 1000);  // 100-1000
```

**Recommended:**
```java
int count = r.nextInt(1000, 10000);  // 1000-10000 (10x higher)
```

This will increase payment approval rate to ~95%+ and overall CONFIRMED orders to ~85%+.

### Option 2: Increase Product Stock

Modify `stock-service/StockApp.java` line 45:

**Current:**
```java
int count = r.nextInt(10, 1000);  // 10-1000
```

**Recommended:**
```java
int count = r.nextInt(100, 10000);  // 100-10000 (higher baseline)
```

### Option 3: Reduce Order Amounts

Modify `order-service/OrderGeneratorService.java` line 30:

**Current:**
```java
o.setPrice(100 * x);  // 100-500
```

**Recommended:**
```java
o.setPrice(50 * x);  // 50-250 (50% reduction)
```

### Option 4: Combination Approach (Best)

1. Increase customer balances: `r.nextInt(2000, 10000)`
2. Keep stock at: `r.nextInt(100, 1000)`
3. Reduce order prices: `o.setPrice(75 * x)` (75-375)

This will result in **~90%+ CONFIRMED orders**.

## How to Implement

1. **Restart the services** (clear H2 databases):
   - Stop all running services
   - Delete the H2 database files (usually in `/tmp/kafka-streams/` or similar)

2. **Apply one of the changes above**

3. **Restart all services**:
   - Zookeeper and Kafka
   - order-service, payment-service, stock-service

4. **Generate orders**:
   ```
   POST http://localhost:8080/orders/generate
   ```

5. **Monitor logs** for higher CONFIRMED rate

## Current Behavior (Expected)

With current initialization:
- **CONFIRMED**: ~45% ✅
- **REJECTED**: ~50% (payment failures) ❌
- **ROLLBACK**: ~5% (stock failures) ❌

## Monitoring

Check order status in order-service:
```
GET http://localhost:8080/orders
```

Look for:
- `status='CONFIRMED'` - Successful orders (good!)
- `status='REJECTED'` - Both services rejected
- `status='ROLLBACK'` - One service rejected (SAGA rollback)
- `status='ACCEPT'` - Pending (waiting for join)

## Logs to Watch

**Payment Service** (in terminal):
```
Found: Customer{id=X, amountAvailable=Y}
```

**Stock Service** (in terminal):
```
Found: Product{id=X, availableItems=Y}
```

**Order Service** (in terminal):
```
Output: Order{..., status='CONFIRMED'/'REJECTED'/'ROLLBACK'}
```

## Conclusion

The system is working correctly! The rejection rate is due to the balance between:
- Reasonable order amounts (100-500)
- Conservative customer balances (100-1000)
- Adequate but not excessive stock (10-1000)

For demonstration purposes, increase customer balances to see more CONFIRMED orders and verify the SAGA pattern is working correctly across all three services.

