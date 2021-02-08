const express = require('express');
const app = express();
app.get("/", (request, response) => {
  const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);
  response.sendStatus(200);
});
app.listen(process.env.PORT); // Recebe solicitações que o deixa online

const Discord = require("discord.js"); //Conexão com a livraria Discord.js
const client = new Discord.Client(); //Criação de um novo Client
const config = require("./config.json"); //Pegando o prefixo do bot para respostas de comandos

const cooldown = new Set()
var time_cooldown = 5 * 1000
const db = require("megadb");
    

client.on("message", async message => {
  
  let PrefixDB = new db.crearDB("Prefix");

  if (!PrefixDB.tiene(`${message.guild.id}`))
    PrefixDB.establecer(`${message.guild.id}`, {
      name: message.guild.name,
      prefix: "b!"
    });

  let prefixoAtual = await PrefixDB.obtener(`${message.guild.id}.prefix`);

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  if (!message.content.toLowerCase().startsWith(prefixoAtual.toLowerCase())) return;
  if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return;


     if (cooldown.has(message.author.id)) return message.channel.send({embed: {
  color: 13893887,
  description: `🔥 hey ${message.author} aguarde 5 segundos para usar outro comando`
}});
   cooldown.add(message.author.id);

    const args = message.content
        .trim().slice(prefixoAtual.length)
        .split(/ +/g);
    const comando = args.shift().toLowerCase();

  try {
    let commandFile = require("./commands/" + comando + ".js");
    commandFile.run(client, message, args);
  } catch (err) {
    console.error('Erro detectado:' + err);
    message.channel.send({embed: {
  color: 13893887,
  description: "<:erro:790656859103166500> o comando `"+ (comando) +"` não **existe** ou esta com **erro**."
}})
  }
      setTimeout(() => {
       cooldown.delete(message.author.id);
   }, time_cooldown);
});


client.on("ready", () => {
  let activities = [
      `Utilize ${config.prefix}help para obter ajuda`,
      `servidor do meu criador: https://discord.gg/KJRkCAyhSQ`,
      `${client.guilds.cache.size} servidores!`,
      `prefixo: ${config.prefix}`,
      `${client.users.cache.size} usuários!`,
      `meu servidor de suporte: https://discord.gg/vT55NWwGmU`,
      `https://berrywingg.glitch.me/#`
    ],
    i = 0;
  setInterval( () => client.user.setActivity(`${activities[i++ % activities.length]}`, {
        type: "PLAYING"
      }), 1000 * 60); 
  client.user
      .setStatus("online")
      .catch(console.error);
console.log("Estou Online!")
});

client.on('message', message => require('./help.js')(client, message));


client.login ('SEU TOKEN AQUI'); //Ligando o Bot caso ele consiga acessar o token
