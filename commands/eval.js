const { MessageEmbed } = require("discord.js");
const commonTags = require("common-tags");
const util = require("util");
const Discord = require('discord.js')
const client = new Discord.Client();
const db = require("quick.db");
const adl = {OWNER:["568738173216227339","703340803413639310"]};
const moment = require('moment')


require('moment-duration-format')
module.exports.run = async function(client, msg, args) {

  var message = msg

  
  if (message.author.bot) return;
  const adminkomudu = new Discord.MessageEmbed()
    .setDescription(`Only my developers can use this command!`)
    .setColor("#6386CB")
    .setImage("https://cdn.discordapp.com/attachments/787652745099477055/787951266798108692/standard.gif")
    .setFooter(`Copyright © Uptime System`)
    .setTimestamp();
  if (!adl.OWNER.includes(message.author.id)) return message.channel.send(adminkomudu)
  
  function cleanText(text) {
    if(typeof(text) === "string") {
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
      return text;
    }
  }

  try {
    let executedIn = process.hrtime();
    let result = await eval(args.join(" "));
    result = cleanText(result);
    result = await util.inspect(result);
    executedIn = process.hrtime(executedIn);
    executedIn = ((executedIn[0] * Math.pow(10, 3)) + (executedIn[1] / Math.pow(10, 6)));

    let embed = new MessageEmbed();
    embed.setDescription(commonTags.stripIndents`
     Worked in ${executedIn.toFixed(3)} milliseconds
      \`\`\`xl
        ${result.length > 2048 ? result.substring(0, 1985) + "..." + (result.length - 1985) + " character" : result}\`\`\`
    `);
    embed.setColor(0x00FF00);
    message.channel.send({embed});
  } catch(error) {
    let embed = new MessageEmbed()
    embed.setDescription(commonTags.stripIndents`
    An unexpected error has occurred      
    \`\`\`xl
      ${cleanText(error)}\`\`\`
    `);
    embed.setColor(0xFF0000)
    message.channel.send({embed});
  }
}

module.exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["meval"],
  permLevel: 0
};

module.exports.help = {
  name: "eval"
};