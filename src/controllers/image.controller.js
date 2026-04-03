import mongoose from "mongoose";
import responseHandler from "../utils/responseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import errorhandler from "../utils/errorhandler.js";
import { Image } from "../models/Image.model.js";
import uploadoncloudinary from "../utils/uploadoncloudinary.js";
const getalluserimages=asyncHandler(async (req, res) => {
    const { page=1,limit=10,sortby="createdAt", sorttype="desc" }=req.query;
    const userimages=await Image.aggregate([
        { $match:{
            owner:new mongoose.Types.ObjectId(req.user._id)
        }
    },{
        $sort:{
           [sortby]:sorttype==='asc'?1:-1
        }
    }
    ,
    {
        $skip:(Number(page)-1)*limit 
    },{
        $limit: Number(limit)
    }
    ]);
    if(!userimages||userimages.length===0){
        return res.status(404).json(new errorhandler(404,"images not found",[]));
    }
    res.status(200).json(new responseHandler(200,"User images fetched successfully",userimages));
})

const uploadimage=asyncHandler(async(req,res)=>{
    if(!req.file){
        return res.status(400).json(new errorhandler(400,"No image file uploaded",[]));
    }
    const cloudinaryresponse=await uploadoncloudinary(req.file.path,{ pages:true, folder:"pdfs"});
    if(!cloudinaryresponse)
     throw new errorhandler(500,"file upload error",[])
    const newimage=await Image.create({
        imagelink:cloudinaryresponse.secure_url,
        imagename:req.file.originalname,
        owner:req.user._id,
        filesize:cloudinaryresponse.bytes,
       // filepreviewimages:`https://res.cloudinary.com/${process.env.cloudinary_name}/image/upload/pg_1,w_300,h_400,c_fill,q_auto,f_auto/pdfs/${cloudinaryresponse.public_id}.png`||"https://res.cloudinary.com/dzcmadjlq/image/upload/v1696543783/ClauseValidator/default_pdf_oyh3v0.png"
    });
    const savedimage=await Image.findById(newimage._id);
    if(!savedimage){
        return res.status(500).json(new errorhandler(500,"Image not saved",[]));
    }
    res.status(200).json(new responseHandler(200,"Image uploaded successfully",savedimage));

})
export {getalluserimages,uploadimage};