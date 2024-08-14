const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

// Acción de prueba
const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/song.js"
  });
};

// Guardar canción
const save = async (req, res) => {
  try {
    const song = new Song(req.body);
    const songStored = await song.save();

    return res.status(200).send({
      status: "success",
      song: songStored
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Yukari-sama no guardó la canción",
      error
    });
  }
};

// Obtener una canción por ID
const one = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate("album").exec();

    if (!song) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: no existe la canción"
      });
    }

    return res.status(200).send({
      status: "success",
      song
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al buscar la canción",
      error
    });
  }
};

// Listar canciones por álbum
const list = async (req, res) => {
  try {
    const songs = await Song.find({ album: req.params.albumId })
      .populate({
        path: "album",
        populate: { path: "artist" }
      })
      .sort("track")
      .exec();

    if (!songs || songs.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: no hay canciones"
      });
    }

    return res.status(200).send({
      status: "success",
      songs
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al listar las canciones",
      error
    });
  }
};

// Actualizar una canción
const update = async (req, res) => {
  try {
    const songUpdated = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!songUpdated) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: no se actualizó la canción"
      });
    }

    return res.status(200).send({
      status: "success",
      song: songUpdated
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar la canción",
      error
    });
  }
};

// Eliminar una canción
const remove = async (req, res) => {
  try {
    const songRemoved = await Song.findByIdAndRemove(req.params.id);

    if (!songRemoved) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama no ha borrado la canción"
      });
    }

    return res.status(200).send({
      status: "success",
      song: songRemoved
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar la canción",
      error
    });
  }
};

// Subir archivo de audio
const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice que no incluye el archivo"
      });
    }

    const fileExtension = req.file.originalname.split(".").pop();

    if (!["mp3", "ogg", "flac"].includes(fileExtension)) {
      fs.unlinkSync(req.file.path);

      return res.status(400).send({
        status: "error",
        message: "Yukari-sama dice que la extensión es inválida"
      });
    }

    const songUpdated = await Song.findByIdAndUpdate(
      req.params.id,
      { file: req.file.filename },
      { new: true }
    );

    if (!songUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Yukari-sama dice que hubo problema con la subida"
      });
    }

    return res.status(200).send({
      status: "success",
      song: songUpdated,
      file: req.file
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al subir el archivo",
      error
    });
  }
};

// Obtener archivo de audio
const audio = (req, res) => {
  const filePath = path.resolve("./uploads/songs/" + req.params.file);

  fs.stat(filePath, (error, exists) => {
    if (error || !exists) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice que no existe el archivo"
      });
    }
    return res.sendFile(filePath);
  });
};

// Exportar acciones
module.exports = {
  prueba,
  save,
  one,
  list,
  update,
  remove,
  upload,
  audio
};
