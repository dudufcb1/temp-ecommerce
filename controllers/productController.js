const User = require("../models/User");
const {
    StatusCodes
} = require("http-status-codes");
const CustomError = require("../errors");
const {
    createTokenUser,
    attachCookiesToResponse,
    checkPermisions,
} = require("../utils");
const Product = require("../models/Products");

const createProduct = async (req, res) => {
    //Importante, a req.body le clavamos el usuario que viene desde la cookie en reQ.user.userId
    req.body.user = req.user.userId
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({
        product
    })
};

getAllProducts = async (req, res) => {
    const products = await Product.find({});
    res.status(StatusCodes.OK).json({
        products,
        count: products.length
    })

};

getSingleProduct = async (req, res) => {
    console.log('Aca ando')
    const {
        id: productId
    } = req.params
    const product = await Product.findOne({
        _id: productId
    })
    if (!product) {
        //este error salta, si el formato del ID de mongo es correcto, de otra forma, te tira el cast que 
        // manejamos desde errorhandlermiddleware
        throw new CustomError.NotFoundError(`No product ${productId} found`)
    }
    res.status(StatusCodes.OK).json({
        product
    })
};

updateProduct = async (req, res) => {
    const {
        id: productId
    } = req.params;
    const product = await Product.findOneAndUpdate({
        _id: productId,
    }, req.body, {
        new: true,
        runValidators: true,
    });
    if (!product) {
        //este error salta, si el formato del ID de mongo es correcto, de otra forma, te tira el cast que 
        // manejamos desde errorhandlermiddleware
        throw new CustomError.NotFoundError(`No product ${productId} found`)
    }
    res.status(StatusCodes.OK).json({
        product
    })
}
const deleteProduct = async (req, res) => {
    const {
        id: productId
    } = req.params;
    const product = await Product.findOne({
        _id: productId
    })
    console.log(product)
    if (!product) {
        //este error salta, si el formato del ID de mongo es correcto, de otra forma, te tira el cast que 
        // manejamos desde errorhandlermiddleware
        throw new CustomError.NotFoundError(`No product ${productId} found`)
    }
    console.log('Pasamos el if')
    await product.deleteOne({
        _id: productId
    })
    res.status(StatusCodes.OK).json({
        msg: 'Sucess! product removed'
    })
};

const uploadImage = async (req, res) => {
    res.send('uploadImage Controller');
};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}