//Importar le modulee
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const { secret } = require("../helpers/jwt");

// Crear middleware (eso es, el método o función)
exports.auth = (req, res, next) => {
  // Comprobar si me llega la cabecera AUTH
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message:
        "Yukari-sama dice: La petición no tiene la cabecera de autenticación "
    });
  }

  // limpiar token
  let token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    // Decodificar el token
    let payload = jwt.decode(token, secret);

    // Comprobar la expiración del token
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "Token expirado"
      });
    }

    // Agregar datos del usuario a la request
    req.user = payload;


  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "Token inválido",
      error
    });
  }

  // Pasar a la ejecución de la acción
  next();
};
