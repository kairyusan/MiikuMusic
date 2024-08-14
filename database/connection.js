//Se importa mongoose
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

//Metodo de conexion
const connection = async() => {
    try{
        await mongoose.connect("mongodb://localhost:27017/miiku_music");

        console.log("Yukari-sama conectada correctamente a la BD: miiku_music")

    }catch(error){
        console.log(error);
        throw new Error("Yukari-sama, no hay conexión con la BD!")
    }
}

//Exportar conexión
module.exports = connection;