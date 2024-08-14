const Artist = require("../models/artists");
const Album = require("../models/album");
const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/artists.js"
  });
};

const save = async (req, res) => {
  try {
    const artist = new Artist(req.body);
    const artistStored = await artist.save();

    return res.status(200).send({
      status: "success",
      artist: artistStored
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Yukari-sama no ha podido guardar el artista"
    });
  }
};

const one = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: no existe el artista"
      });
    }

    return res.status(200).send({
      status: "success",
      artist
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al buscar el artista",
      error
    });
  }
};

const list = async (req, res) => {
  const page = req.params.page || 1;
  const itemsPerPage = 5;

  try {
    const artists = await Artist.find().sort("name").skip((page - 1) * itemsPerPage).limit(itemsPerPage);
    const total = await Artist.countDocuments();

    if (!artists || artists.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: no hay artistas"
      });
    }

    return res.status(200).send({
      status: "success",
      page,
      itemsPerPage,
      total,
      artists
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al listar los artistas",
      error
    });
  }
};

const update = async (req, res) => {
  try {
    const artistUpdated = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!artistUpdated) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: no se ha actualizado el artista"
      });
    }

    return res.status(200).send({
      status: "success",
      artist: artistUpdated
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar el artista",
      error
    });
  }
};

const remove = async (req, res) => {
  try {
    const artistRemoved = await Artist.findByIdAndDelete(req.params.id);
    if (!artistRemoved) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama no ha borrado el artista"
      });
    }

    await Album.deleteMany({ artist: req.params.id });
    await Song.deleteMany({ album: { $in: artistRemoved.albums } });

    return res.status(200).send({
      status: "success",
      artist: artistRemoved
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar el artista o alguno de sus elementos",
      error
    });
  }
};

const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice que no incluye la imagen"
      });
    }

    const fileExtension = req.file.originalname.split(".").pop();
    if (!["png", "jpg", "jpeg", "gif"].includes(fileExtension)) {
      fs.unlinkSync(req.file.path);

      return res.status(400).send({
        status: "error",
        message: "Yukari-sama dice que la extensión es inválida"
      });
    }

    const artistUpdated = await Artist.findByIdAndUpdate(req.params.id, { image: req.file.filename }, { new: true });

    if (!artistUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Yukari-sama dice que hubo problema con la subida de la imagen"
      });
    }

    return res.status(200).send({
      status: "success",
      artist: artistUpdated,
      file: req.file
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al subir la imagen",
      error
    });
  }
};

const image = (req, res) => {
  const filePath = path.resolve(`./uploads/artists/${req.params.file}`);

  fs.stat(filePath, (error, exists) => {
    if (error || !exists) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice que no existe la imagen"
      });
    }

    return res.sendFile(filePath);
  });
};

module.exports = {
  prueba,
  save,
  one,
  list,
  update,
  remove,
  upload,
  image
};
