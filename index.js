const express = require("express");
const app = express();
const Discord = require("discord.js");
const moment = require("moment");
const client = new Discord.Client();
const adl = { OWNER: ["", ""], prefix: "!!" };
const passport = require("passport");
const { Strategy } = require("passport-discord");
const session = require("express-session");
const db = require("quick.db");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(__dirname + "/views"));
app.use("/static", express.static("./static"));
app.set("view engine", "ejs");
app.set("views", "./views");

const listener = app.listen(3000, err => {
  if (err) throw err;
  console.log(`Site ${listener.address().port} portunda hazır!`);
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

let strategy = new Strategy(
  {
    clientID: "",
    clientSecret: "",
    callbackURL: "",
    scope: ["guilds", "identify"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }
);

passport.use(strategy);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/login",
  passport.authenticate("discord", {
    scope: ["guilds", "identify"]
  })
);

app.get(
  "/callback",
  passport.authenticate("discord", {
    failureRedirect: "/404"
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/", (req, res) => {
  if (!req.user) {
    res.render("index", { db });
  } else {
    res.render("index2", { db, user: req.user });
  }
});

app.get("/logout", function(req, res, next) {
  if (!req.user) {
    res.redirect("/");
  } else {
    req.logOut();
    return res.redirect("/");
  }
});


client.conf = {
  pref: adl.prefix,
  own: ["568738173216227339", ""]
};
client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(client.conf.pref)) return;
  let command = message.content.split(" ")[0].slice(client.conf.pref.length);
  let params = message.content.split(" ").slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);

  }
});
const fs = require("fs");
var prefix = adl.prefix;

const log = message => {
  console.log(`[ADLMedia] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklenmeye hazır. Başlatılıyor...`);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    log(`Komut yükleniyor: ${props.help.name}'.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.yetkiler = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if (message.member.hasPermission("MANAGE_ROLES")) permlvl = 2;
  if (message.member.hasPermission("MANAGE_CHANNELS")) permlvl = 3;
  if (message.member.hasPermission("KICK_MEMBERS")) permlvl = 4;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 5;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 6;
  if (message.author.id === message.guild.ownerID) permlvl = 7;
  if (message.author.id === client.conf.own) permlvl = 8;
  return permlvl;
};

app.get("/404", (req, res) => {
  res.render("404");
});

app.use(function(req, res) {
  res.redirect("/404");
});

client.login("NzY3Mzk0NzI4NjkzODU4MzA0.X4xSCA.hVLnTpvBYSgm0kZMkNMYBfQHI7Y");

