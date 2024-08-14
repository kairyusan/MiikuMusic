//Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

//Clave secreta
const secret = "CLAVE_DE_YUKARI_SAMA_PARA_LA_MEJOR_APP_DE_MUSICA_mIIKU_Music_626269256245848485211296746";

//Función para generar tokens
const createToken = (user) => {

    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    // Devolución de token
    return jwt.encode(payload, secret);
}

//Exportar módulo
module.exports = {
    secret,
    createToken

}