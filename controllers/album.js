const fs = require("fs");
const path = require("path");
const Album = require("../models/album");
const Song = require("../models/song");

const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/album.js"
  });
};

const save = (req, res) => {
  let params = req.body;
  let album = new Album(params);

  album.save((error, albumStored) => {
    if (error || !albumStored) {
      return res.status(500).send({
        status: "error",
        message: "No se pudo guardar el álbum"
      });
    }

    return res.status(200).send({
      status: "success",
      album: albumStored
    });
  });
};

const one = (req, res) => {
  const albumId = req.params.id;

  Album.findById(albumId).populate("artist").exec((error, album) => {
    if (error || !album) {
      return res.status(404).send({
        status: "error",
        message: "No se encontró el álbum"
      });
    }

    return res.status(200).send({
      status: "success",
      album
    });
  });
};

const list = (req, res) => {
  const artistId = req.params.artistId;

  if (!artistId) {
    return res.status(404).send({
      status: "error",
      message: "No se encontró el artista"
    });
  }

  Album.find({ artist: artistId }).populate("artist").exec((error, albums) => {
    if (error || !albums) {
      return res.status(404).send({
        status: "error",
        message: "No se encontraron álbumes"
      });
    }
    return res.status(200).send({
      status: "success",
      albums
    });
  });
};

const update = (req, res) => {
  const albumId = req.params.id;
  const data = req.body;

  Album.findByIdAndUpdate(albumId, data, { new: true }, (error, albumUpdated) => {
    if (error || !albumUpdated) {
      return res.status(500).send({
        status: "error",
        message: "No se pudo actualizar el álbum"
      });
    }

    return res.status(200).send({
      status: "success",
      album: albumUpdated
    });
  });
};

const upload = (req, res) => {
  let albumId = req.params.id;

  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "No se incluye la imagen"
    });
  }

  let image = req.file.originalname;
  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  if (!["png", "jpg", "jpeg", "gif"].includes(extension)) {
    const filePath = req.file.path;
    fs.unlinkSync(filePath);

    return res.status(404).send({
      status: "error",
      message: "Extensión inválida"
    });
  }

  Album.findOneAndUpdate(
    { _id: albumId },
    { image: req.file.filename },
    { new: true },
    (error, albumUpdated) => {
      if (error || !albumUpdated) {
        return res.status(500).send({
          status: "error",
          message: "Hubo un problema con la subida de la imagen"
        });
      }

      return res.status(200).send({
        status: "success",
        album: albumUpdated,
        file: req.file
      });
    }
  );
};

const image = (req, res) => {
  const file = req.params.file;
  const filePath = "./uploads/albums/" + file;

  fs.stat(filePath, (error, exists) => {
    if (error || !exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen"
      });
    }
    return res.sendFile(path.resolve(filePath));
  });
};

const remove = async (req, res) => {
  const albumId = req.params.id;

  try {
    const albumRemoved = await Album.findByIdAndDelete(albumId);
    const songRemoved = await Song.deleteMany({ album: albumId });

    return res.status(200).send({
      status: "success",
      albumRemoved,
      songRemoved
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar el álbum o alguno de sus elementos",
      error
    });
  }
};

module.exports = {
  prueba,
  save,
  one,
  list,
  update,
  upload,
  image,
  remove
};
