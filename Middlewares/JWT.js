const secretKey=process.env.SECRET_KEY
const Jwt=require('jsonwebtoken')
const Admin = require('../Database/Admin')
const asyncHandler = require('express-async-handler')

const generateToken=async(id)=>{
    let token=await Jwt.sign({id},secretKey,{expiresIn:'24h'})
    return token
}

const protect = asyncHandler(async (req, resp, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1]
        try {
            Jwt.verify(token, secretKey,(err,valid)=>
            {
                if(!err) next()
                else { resp.status(401).send({msg : "Token Expired"})
            //  resp.clearCookie('token')
            }
            })
            // console.log(decoded)
            // req.user = await Admin.findById(decoded.id).select("-Password")
            // next();
        } catch (error) {
            resp.status(401).send({msg:"Not Authorized, Token Failed"})
            throw new Error("Not Authorized, Token Failed")
        }
    }

    if (!token) {   
        resp.status(401).send({msg:"Not Authorized, No Token"})
        throw new Error("Not Authorized, No Token")

    }
})

module.exports={
    generateToken,
    protect
}