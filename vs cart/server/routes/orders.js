const express=require('express');
const {pool}=require('../config/db');
const {protect,admin}=require('../middleware/auth');
const {asyncHandler}=require('../middleware/error');
const router=express.Router();
const round2=n=>Math.round(n*100)/100;
const ADDRESS_FIELDS=['fullName','address','city','postalCode','country'];
const STATUSES=['processing','shipped','delivered','cancelled'];
const FREE_SHIPPING_MIN=500, SHIPPING_FEE=40;
const parseOrder=row=>row&&({...row,_id:String(row.id),user:String(row.userId),items:typeof row.items==='string'?JSON.parse(row.items):row.items,shippingAddress:typeof row.shippingAddress==='string'?JSON.parse(row.shippingAddress):row.shippingAddress,itemsPrice:Number(row.itemsPrice),shippingPrice:Number(row.shippingPrice),totalPrice:Number(row.totalPrice),isPaid:Boolean(row.isPaid)});
async function getOrder(id,conn=pool){const [r]=await conn.execute('SELECT * FROM orders WHERE id=?',[id]);return parseOrder(r[0]);}
async function attachUser(order){if(!order)return order;const [u]=await pool.execute('SELECT id,name,email FROM users WHERE id=?',[order.userId||order.user]);order.user=u[0]?{_id:String(u[0].id),name:u[0].name,email:u[0].email}:order.user;return order;}
router.post('/',protect,asyncHandler(async(req,res)=>{
 const {items,shippingAddress,paymentMethod='card'}=req.body;
 if(!Array.isArray(items)||!items.length){res.status(400);throw new Error('No order items');}
 if(!shippingAddress||ADDRESS_FIELDS.some(f=>!String(shippingAddress[f]||'').trim())){res.status(400);throw new Error('Complete shipping address is required');}
 if(!['card','cod'].includes(paymentMethod)){res.status(400);throw new Error('Invalid payment method');}
 const conn=await pool.getConnection();
 try{
  await conn.beginTransaction(); const orderItems=[];
  for(const it of items){const qty=parseInt(it.qty,10);if(!qty||qty<1){res.status(400);throw new Error('Invalid quantity');}
   const [upd]=await conn.execute('UPDATE products SET countInStock=countInStock-? WHERE id=? AND countInStock>=?', [qty,it.product,qty]);
   if(!upd.affectedRows){res.status(400);throw new Error('A product is out of stock or no longer available');}
   const [rows]=await conn.execute('SELECT id,name,image,emoji,category,price FROM products WHERE id=?',[it.product]);const p=rows[0];
   if(!p){res.status(400);throw new Error('Product no longer available');}
   orderItems.push({product:String(p.id),name:p.name,image:p.image,emoji:p.emoji,category:p.category,price:Number(p.price),qty});
  }
  const itemsPrice=round2(orderItems.reduce((s,i)=>s+i*i.qty*i.price,0));const shippingPrice=itemsPrice>=FREE_SHIPPING_MIN?0:SHIPPING_FEE;
  const address=Object.fromEntries(ADDRESS_FIELDS.map(f=>[f,String(shippingAddress[f]).trim()]));
  const [insert]=await conn.execute('INSERT INTO orders(userId,items,shippingAddress,paymentMethod,itemsPrice,shippingPrice,totalPrice) VALUES(?,?,?,?,?,?,?)',[req.user._id,JSON.stringify(orderItems),JSON.stringify(address),paymentMethod,itemsPrice,shippingPrice,round2(itemsPrice+shippingPrice)]);
  await conn.commit();res.status(201).json(await getOrder(insert.insertId));
 }catch(e){await conn.rollback();throw e;}finally{conn.release();}
}));
router.get('/mine',protect,asyncHandler(async(req,res)=>{const [rows]=await pool.execute('SELECT * FROM orders WHERE userId=? ORDER BY createdAt DESC',[req.user._id]);res.json(rows.map(parseOrder));}));
router.get('/',protect,admin,asyncHandler(async(req,res)=>{const [rows]=await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');res.json(await Promise.all(rows.map(async r=>attachUser(parseOrder(r)))));}));
router.get('/:id',protect,asyncHandler(async(req,res)=>{const order=await attachUser(await getOrder(req.params.id));if(!order){res.status(404);throw new Error('Order not found');}if(!req.user.isAdmin&&String(order.user._id)!==String(req.user._id)){res.status(403);throw new Error('Not allowed to view this order');}res.json(order);}));
router.put('/:id/pay',protect,asyncHandler(async(req,res)=>{const order=await getOrder(req.params.id);if(!order||String(order.user)!==String(req.user._id)){res.status(404);throw new Error('Order not found');}if(order.status==='cancelled'){res.status(400);throw new Error('Cancelled orders cannot be paid');}await pool.execute('UPDATE orders SET isPaid=TRUE,paidAt=NOW() WHERE id=?',[req.params.id]);res.json(await getOrder(req.params.id));}));
router.put('/:id/status',protect,admin,asyncHandler(async(req,res)=>{const {status}=req.body;if(!STATUSES.includes(status)){res.status(400);throw new Error('Invalid status');}const conn=await pool.getConnection();try{await conn.beginTransaction();const [rows]=await conn.execute('SELECT * FROM orders WHERE id=? FOR UPDATE',[req.params.id]);if(!rows[0]){res.status(404);throw new Error('Order not found');}const order=parseOrder(rows[0]);if(status==='cancelled'&&order.status!=='cancelled'){for(const item of order.items){await conn.execute('UPDATE products SET countInStock=countInStock+? WHERE id=?',[item.qty,item.product]);}}await conn.execute('UPDATE orders SET status=? WHERE id=?',[status,req.params.id]);await conn.commit();res.json(await getOrder(req.params.id));}catch(e){await conn.rollback();throw e;}finally{conn.release();}}));
module.exports=router;
