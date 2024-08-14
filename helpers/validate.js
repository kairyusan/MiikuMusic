const validator = require("validator");

const validate = params => {
  let resultado = false;

  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "es-ES");

  let nick =
    !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 2, max: 60 });

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  let password = !validator.isEmpty(params.password);

  if (params.surname) {
    let surname =
      !validator.isEmpty(params.surname) &&
      validator.isLength(params.surname, { min: 3, max: undefined }) &&
      validator.isAlpha(params.surname, "es-ES");

    if (!surname) {
      throw new Error("Yukari-sama no lo valida por apellido incorrecto!");
    } else {
      console.log("Yukari-sama valida el apellido");
    }
  }

  if (!name || !nick || !email || !password) {
    throw new Error("Yukari-sama no lo valida!");
  } else {
    console.log("Yukari-sama valida todo!");
    resultado = true;
  }
  return resultado;
}

module.exports = validate;
