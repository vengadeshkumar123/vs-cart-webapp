const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const router = express.Router();
const pick = (obj, keys) => keys.reduce((acc,k)=>obj[k]!==undefined?{...acc,[k]:obj[k]}:acc,{});
const FIELDS=['name','brand','description','price','mrp','image','emoji','category','countInStock','rating','numReviews'];
const allowedSort={'popular':'numReviews DESC','price-asc':'price ASC','price-desc':'price DESC','discount':'discount DESC','rating':'rating DESC','newest':'createdAt DESC'};
router.get('/',asyncHandler(async(req,res)=>{
 const page=Math.max(parseInt(req.query.page,10)||1,1), limit=Math.min(Math.max(parseInt(req.query.limit,10)||12,1),50);
 const clauses=[], params=[]; const q=String(req.query.q||'').trim();
 if(q){clauses.push('(name LIKE ? OR brand LIKE ? OR category LIKE ?)');const like=`%${q}%`;params.push(like,like,like);}
 if(req.query.category){clauses.push('category=?');params.push(String(req.query.category));}
 if(req.query.minPrice){clauses.push('price>=?');params.push(Number(req.query.minPrice));}
 if(req.query.maxPrice){clauses.push('price<=?');params.push(Number(req.query.maxPrice));}
 if(req.query.minRating){clauses.push('rating>=?');params.push(Number(req.query.minRating));}
 const where=clauses.join(' AND ')||'1=1'; const total=await Product.count({where,params});
 const products=await Product.list(where,params,allowedSort[req.query.sort]||allowedSort.popular,(page-1)*limit,limit);
 res.json({products,page,pages:Math.max(Math.ceil(total/limit),1),total});
}));
router.get('/categories',asyncHandler(async(req,res)=>res.json(await Product.categories())));
router.get('/:id',asyncHandler(async(req,res)=>{const p=await Product.findById(req.params.id);if(!p){res.status(404);throw new Error('Product not found');}res.json(p);}));
router.post('/',protect,admin,asyncHandler(async(req,res)=>res.status(201).json(await Product.create(pick(req.body,FIELDS)))));
router.put('/:id',protect,admin,asyncHandler(async(req,res)=>{const p=await Product.update(req.params.id,pick(req.body,FIELDS));if(!p){res.status(404);throw new Error('Product not found');}res.json(p);}));
router.delete('/:id',protect,admin,asyncHandler(async(req,res)=>{if(!await Product.remove(req.params.id)){res.status(404);throw new Error('Product not found');}res.json({message:'Product deleted'});}));
module.exports=router;
