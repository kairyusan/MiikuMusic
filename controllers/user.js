const validate = require("../helpers/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const fs = require("fs");
const path = require("path");

const prueba = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde: controllers/user.js",
    user: req.user
  });
};

const register = async (req, res) => {
  const params = req.body;

  if (!params.name || !params.nick || !params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Yukari-sama no aprueba que falten datos por enviar"
    });
  }

  try {
    validate(params);
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Yukari-sama dice: validación no superada"
    });
  }

  try {
    const existingUsers = await User.find({
      $or: [
        { email: params.email.toLowerCase() },
        { nick: params.nick.toLowerCase() }
      ]
    });

    if (existingUsers.length >= 1) {
      return res.status(400).send({
        status: "error",
        message: "Yukari-sama dice: el usuario ya existe"
      });
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);
    params.password = hashedPassword;

    const userToSave = new User(params);
    const userStored = await userToSave.save();

    const userCreated = userStored.toObject();
    delete userCreated.password;
    delete userCreated.role;

    return res.status(200).send({
      status: "success",
      message: "Yukari-sama registró el usuario correctamente",
      user: userCreated
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Yukari-sama dice: error al registrar usuario"
    });
  }
};

const login = async (req, res) => {
  const params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Yukari-sama no aprueba que falten datos por enviar"
    });
  }

  try {
    const user = await User.findOne({ email: params.email }).select("+password +role");

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: no existe en usuario"
      });
    }

    const isPasswordValid = await bcrypt.compare(params.password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({
        status: "error",
        message: "Yukari-sama no permite ese login incorrecto"
      });
    }

    const identityUser = user.toObject();
    delete identityUser.password;
    delete identityUser.role;

    const token = jwt.createToken(user);

    return res.status(200).send({
      status: "success",
      message: "Método de login",
      user: identityUser,
      token
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Yukari-sama dice: error en el proceso de login"
    });
  }
};

const profile = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Yukari-sama dice: El usuario no existe"
      });
    }

    return res.status(200).send({
      status: "success",
      message: "Método de perfil",
      id,
      user
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Yukari-sama dice: error al obtener el perfil del usuario"
    });
  }
};

const update = async (req, res) => {
  const userIdentity = req.user;
  const userToUpdate = req.body;

  try {
    validate(userToUpdate);
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Yukari-sama dice: validación no superada"
    });
  }

  try {
    const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() }
      ]
    });

    const userIsset = users.some(user => user._id.toString() !== userIdentity.id);

    if (userIsset) {
      return res.status(400).send({
        status: "error",
        message: "Yukari-sama dice: el usuario ya existe"
      });
    }

    if (userToUpdate.password) {
      const hashedPassword = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = hashedPassword;
    } else {
      delete userToUpdate.password;
    }

    const userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

    if (!userUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Yukari-sama no pudo actualizar el usuario"
      });
    }

    return res.status(200).send({
      status: "success",
      user: userUpdated
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Yukari-sama no pudo actualizar el usuario"
    });
  }
};

const upload = async (req, res) => {
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "Yukari-sama dice que no incluye la imágen"
    });
  }

  const image = req.file.originalname;
  const imageSplit = image.split(".");
  const extension = imageSplit[1].toLowerCase();

  if (!["png", "jpg", "jpeg", "gif"].includes(extension)) {
    fs.unlinkSync(req.file.path);

    return res.status(400).send({
      status: "error",
      message: "Yukari-sama dice que la extensión es inválida"
    });
  }

  try {
    const userUpdated = await User.findByIdAndUpdate(req.user.id, { image: req.file.filename }, { new: true });

    if (!userUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Yukari-sama dice que hubo problema con la subida de la imagen"
      });
    }

    return res.status(200).send({
      status: "success",
      user: userUpdated,
      file: req.file
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Yukari-sama dice que hubo problema con la subida de la imagen"
    });
  }
};

const avatar = (req, res) => {
  const file = req.params.file;
  const filePath = path.resolve("./uploads/avatars/" + file);

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
  register,
  login,
  profile,
  update,
  upload,
  avatar
};
