const express=require('express');
const ToDo = require('../schemas/ToDo');
const verifyToken = require('../middlewares/verifyToken');
const router=express.Router();

router.get("/get-all",verifyToken, async(req,res)=>{
    console.log(req.user);
    const todos= await ToDo.find({user:req.user._id});
    res.json({
        message:"Todolar Getirildi",
        status:200,
        data:{todos},
    }
    ).status(200);
});

router.get("/get/:id",verifyToken, async(req,res)=>{
    const todoId=req.params.id;
    const todo= await ToDo.findOne({_id: todoId, user: req.user._id});
    res.json({
        message:"Todo Getirildi",
        status:200,
        data:{todo},
    }
    ).status(200);
});

router.post('/create',verifyToken, async (req,res)=>{
    req.body.user=req.user._id;
    const todo= new ToDo({
        name: req.body.name,
        description: req.body.description,
    });

    const createdTodo = await ToDo.create(todo);
    res.json(createdTodo);
    res.json({
        message:"Todo başarıyla oluşturuldu.",
        status:200,
        data:{createdTodo},
    }
    ).status(200);
});

router.patch('/update/:id',verifyToken, async (req,res)=>{
    const todoId=req.params.id;
    const updatedTodo = await ToDo.findOneAndUpdate({_id: todoId, user: req.user._id},req.body,{
        new:true,
    });
    res.json(updatedTodo);
});

router.delete("/delete/:id",verifyToken ,async (req,res)=>{
    const todoId=req.params.id;
    const deletedTodo=await ToDo.findOneAndDelete({_id: todoId, user: req.user._id});
    res.json(deletedTodo);
})
module.exports=router;