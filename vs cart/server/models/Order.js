const db = require('../config/db');
function shape(row, items) {
  if (!row) return null;
  return { _id:String(row.id), user: { _id:String(row.user_id), name:row.user_name, email:row.user_email },
    items:items.map(i=>({ _id:String(i.id), product:i.product_id==null?null:String(i.product_id), name:i.product_name, image:i.image, emoji:i.emoji, category:i.category, price:Number(i.price), qty:Number(i.quantity) })),
    shippingAddress:{fullName:row.shipping_full_name,address:row.shipping_address,city:row.shipping_city,postalCode:row.shipping_postal_code,country:row.shipping_country},
    paymentMethod:row.payment_method,itemsPrice:Number(row.items_price),shippingPrice:Number(row.shipping_price),totalPrice:Number(row.total_price),
    isPaid:Boolean(row.is_paid),paidAt:row.paid_at,status:row.status,createdAt:row.created_at,updatedAt:row.updated_at };
}
async function getById(id, executor=db) {
 const [rows]=await executor.execute(`SELECT o.*,u.name AS user_name,u.email AS user_email FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=?`,[id]);
 if(!rows[0])return null; const [items]=await executor.execute('SELECT * FROM order_items WHERE order_id=? ORDER BY id',[id]); return shape(rows[0],items);
}
async function listForUser(userId){const [r]=await db.execute('SELECT id FROM orders WHERE user_id=? ORDER BY created_at DESC',[userId]);return Promise.all(r.map(x=>getById(x.id)));}
async function listAll(){const [r]=await db.execute('SELECT id FROM orders ORDER BY created_at DESC');return Promise.all(r.map(x=>getById(x.id)));}
async function create({userId,items,shippingAddress,paymentMethod,itemsPrice,shippingPrice,totalPrice},connection){
 const [r]=await connection.execute(`INSERT INTO orders (user_id,shipping_full_name,shipping_address,shipping_city,shipping_postal_code,shipping_country,payment_method,items_price,shipping_price,total_price) VALUES (?,?,?,?,?,?,?,?,?,?)`,[userId,shippingAddress.fullName,shippingAddress.address,shippingAddress.city,shippingAddress.postalCode,shippingAddress.country,paymentMethod,itemsPrice,shippingPrice,totalPrice]);
 for(const i of items) await connection.execute('INSERT INTO order_items (order_id,product_id,product_name,image,emoji,category,price,quantity) VALUES (?,?,?,?,?,?,?,?)',[r.insertId,i.product,i.name,i.image||'',i.emoji||'🛍️',i.category||'',i.price,i.qty]);
 return getById(r.insertId,connection);
}
module.exports={getById,listForUser,listAll,create,shape};
