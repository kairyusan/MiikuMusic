//Importacion de conexion a base de datos
const connection = require("./database/connection");

//Aqui se importan dependencias necesarias
const express = require("express");
const cors = require("cors");

//Msj de bienvenida
console.log("Yukari armando una gran API-REST para Miiku_music: start!!!");

//Ejecutar conexion a bd
connection();

// Servidor de node
const app = express();
const port = 3911;

//Config CORS
app.use(cors());

//Datos del BODY a objetos JS
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Configuración de rutas
const UserRoutes = require("./routes/user");
const ArtistsRoutes = require("./routes/artists");
const AlbumRoutes = require("./routes/album");
const SongRoutes = require("./routes/song");

app.use("/api/user", UserRoutes);
app.use("/api/artists", ArtistsRoutes);
app.use("/api/album", AlbumRoutes);
app.use("/api/song", SongRoutes);

// Ruta de prueba
app.get("/ruta-probando", (req, res) => {
    return res.status(200).send({
        "id": 12,
        "nombre": "Yukari",
        "apellido": "Yakumo"
    });
});

// Poner el servidor a escuchar peticiones HTTP
app.listen(port, () =>{
    console.log("Servidor de node está escuchando una petición de Gensokyo en el puerto: ", port);
}
)
