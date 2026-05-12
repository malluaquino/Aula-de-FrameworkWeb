var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
nome: {
unique: true,
type: String
},
senha: {
type: String
},
},
{
versionKey: false
}
);
// O terceiro parâmetro força o Mongoose a olhar para a coleção 'usuario'
// O terceiro parâmetro 'usuario' força o Mongoose a usar a sua coleção do Atlas
module.exports = mongoose.model('user', userSchema);
