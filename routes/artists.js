// Importar las dependencias
const express = require("express");
const check = require("../middlewares/auth");

// Cargar router
const router = express.Router();

// Importar le controlador
const ArtistsController = require("../controllers/artists");

// Configurar le subida
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/artists/");
    },

    filename: (req, file, cb) => {
        cb(null, "artist-" +Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba", ArtistsController.prueba);
router.post("/save", check.auth, ArtistsController.save);
router.get("/one/:id", check.auth, ArtistsController.one);
router.get("/list/:page?", check.auth, ArtistsController.list);
router.put("/update/:id", check.auth, ArtistsController.update);
router.delete("/remove/:id", check.auth, ArtistsController.remove);
router.post("/upload/:id", [check.auth, uploads.single("file0")], ArtistsController.upload);
router.get("/image/:file", ArtistsController.image);


// Explorar router
module.exports = router;