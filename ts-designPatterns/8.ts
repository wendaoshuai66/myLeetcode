type OrderId = string & { readonly brand: unique symbol };
type UserId = string & { readonly brand: unique symbol };

type ID = OrderId | UserId;

// 伴侣模式

function OrderId(id: string) {
  return id as OrderId;
}

function UserId(id: UserId) {
  return id as UserId;
}

function queryForUser(id: ID): ID {
  return id;
}

queryForUser(OrderId("umu"));
