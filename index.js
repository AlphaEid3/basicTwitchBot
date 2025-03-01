import { client } from "./src/client.js"
import { changeColor } from "./src/utils.js"
import fs from "fs"
import fetch from "node-fetch"
import path from "path"
import os from 'os';


const startTime = Date.now()
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"))
const commands = JSON.parse(fs.readFileSync("./commands.json", "utf8"))
const afkUsers = new Map(); // To store AFK users and their messages

console.log("Commands loaded:", commands)
console.log("Command prefix:", commands.prefix)

client.on("PRIVMSG", async (msg) => {
  if (msg.senderUserID === config.id) changeColor(msg.colorRaw)

  if (msg.channelName === "channel_to_farm_in" && msg.senderUsername === "DeepDankDungeonBot") {
    return client.say(msg.channelName, "+join")
  }
  if (!config.whitelist_channels.includes(msg.senderUsername.toLowerCase())) {
    return
  }
  if (afkUsers.has(msg.senderUserID)) {
    const afkData = afkUsers.get(msg.senderUserID);
    const afkDuration = Date.now() - afkData.time;
    
    // Convert duration to a human-readable format (e.g., seconds/minutes)
    const seconds = Math.floor((afkDuration / 1000) % 60);
    const minutes = Math.floor((afkDuration / 1000 / 60) % 60);
    
    client.say(msg.channelName, `${msg.senderUsername} returned after ${minutes} minute(s) and ${seconds} second(s).`);
    
    // Remove user from AFK list
    afkUsers.delete(msg.senderUserID);
    return; // Exit to avoid processing the message further
  }

  // Log the message, sender, and channel
  console.log(`user:[${msg.senderUsername}] [#${msg.channelName}] [📜 ${msg.messageText}]`);

  if (msg.messageText.startsWith(commands.prefix)) {
    console.log("Command detected")
    const args = msg.messageText.slice(commands.prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()
    console.log("Command name:", commandName)

    const command = commands.commands.find(
      (cmd) => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName)),
    )
    console.log("Command found:", command)

    if (!command) {
      console.log("Command not found")
      return
    }
    switch (command.execute) {
      case "spamMessage":
        console.log("Executing spam command")
        spamMessage(msg, args)
        break
      case "sayHello":
        console.log("Executing hello command")
        sayHello(msg)
        break
      case "getInfo":
        console.log("Executing info command")
        await getInfo(msg, args)
        break
      case "createPyramid":
        console.log("Executing pyramid command")
        await createPyramid(msg, args)
        break
      case "listCommands":
        console.log("Executing commands command")
        listCommands(msg)
        break
      case "rollDice":
        console.log("Executing roll command")
        rollDice(msg)
        break
      case "sendDog":
        console.log("Executing dog command")
        await sendDog(msg)
        break
      case "sendCat":
        console.log("Executing cat command")
        await sendCat(msg)
        break
      case "calculateMath":
        console.log("Executing math command")
        await calculateMath(msg, args)
        break     
      case "setLurk":
        console.log("Executing lurk command")
        setLurk(msg)
        break
      case "shoutOut":
        console.log("Executing shoutout command")
        shoutOut(msg, args)
        break
      case "pingPong":
        console.log("Executing ping command")
        pingPong(msg)
        break
      case "generateVanity":
        console.log("Executing vanity command")
        await generateVanity(msg, args)
        break
      case "getUserLogs":
        console.log("Executing logs command")
        await getUserLogs(msg, args)
        break
      case "sayGoodnight":
        console.log("Executing goodnight command")
        sayGoodnight(msg)
        break
      case "tellJoke":
        console.log("Executing joke command")
        await tellJoke(msg)
        break
      case "setReminder":
        console.log("Executing reminder command")
        setReminder(msg, args)
        break
        case "coinFlip": // New case for the coinflip command
        console.log("Executing coin flip command")
        coinFlip(msg)
        break
        case "flipText":
          console.log("Executing flip command");
          flipText(msg, args);
        break
        case "reverseName": // New case for the reverse command
          console.log("Executing reverse command");
          reverseName(msg, args);
          break
          case "setTimer": // New case for the timer command
          console.log("Executing timer command")
          setTimer(msg, args)
          break
          case "createPoll":
          console.log("Executing poll command");
          await createPoll(msg, args);
          break
          case "changePrefix":
        console.log("Executing setprefix command")
        changePrefix(msg, args)
        break
        case "showCurrentPrefix":
        console.log("Executing prefix command")
        showCurrentPrefix(msg)
        break
        case "getUptime":
        console.log("Executing uptime command");
        await getUptime(msg);
        break
        case "showHelp":
        console.log("Executing help command");
        showHelp(msg, args);
        break
        case "addChannelToWhitelist":
        console.log("Executing addwhitelist command");
        await addChannelToWhitelist(msg, args);
        break
        case "removeChannelFromWhitelist":
        console.log("Executing removewhitelist command");
        await removeChannelFromWhitelist(msg, args);
        break
        case "addBotToChannel":
        console.log("Executing join command");
        await addBotToChannel(msg, args);
        break
        case "removeBotFromChannel":
        console.log("Executing part command");
        await removeBotFromChannel(msg, args);
        break
        case "setAfkStatus":
          console.log("Executing AFK command");
          setAfkStatus(msg, args);
          break
        default:
          console.log("Unknown command:", command.name)
    }
  }
})

function listCommands(msg) {
  const commandList = commands.commands.map((cmd) => `${commands.prefix}${cmd.name} - ${cmd.description}`).join(", ")
  client.say(msg.channelName, `Commands: https://pot.cx/cLf8`)
}

function spamMessage(msg, args) {
  const count = Number.parseInt(args[0])
  const delay = args.length > 1 ? Number.parseInt(args[args.length - 1]) : 0
  const message = args.slice(1, args.length - (delay > 0 ? 1 : 0)).join(" ")

  if (isNaN(count) || count <= 0 || count > 35) {
    client.say(msg.channelName, "Please provide a valid number between 1 and 35.")
    return
  }

  const delayInMs = delay * 1000

  const sendMessage = (i) => {
    if (i < count) {
      client.say(msg.channelName, message)
      if (delay > 0) {
        setTimeout(() => sendMessage(i + 1), delayInMs)
      } else {
        sendMessage(i + 1)
      }
    }
  }

  sendMessage(0)
}

function sayHello(msg) {
  client.say(msg.channelName, `hi, ${msg.displayName}!`)
}

async function getInfo(msg, args) {
  const username = args.length > 0 ? args[0] : msg.senderUsername || msg.user || msg.username;

  if (!username) {
    return client.say(msg.channelName, "No channel provided, please provide a channel to get info for.");
  }

  try {
    const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      return client.say(msg.channelName, "Error fetching user information. Please try again later.");
    }

    const data = await response.json();
    if (!data.length) {
      return client.say(msg.channelName, `No data found for channel: ${username}`);
    }

    const user = data[0];
    console.log("User data:", user);

    function formatTimeDifference(date) {
      if (!date) return null;
      const now = Date.now();
      const diff = now - new Date(date).getTime();
      const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
      const days = Math.floor((diff % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

      let result = "";
      if (years > 0) result += `${years}y `;
      if (months > 0) result += `${months}mo `;
      if (days > 0) result += `${days}d `;
      if (hours > 0) result += `${hours}h `;
      if (minutes > 0) result += `${minutes}m`;

      return result.trim() || "just now";
    }

    const bio = user.bio ? user.bio.substring(0, 50) + (user.bio.length > 50 ? "..." : "") : "N/A";
    const lastUpdated = formatTimeDifference(user.updatedAt);
    const created = formatTimeDifference(user.createdAt);

    const messageParts = [
      `@${user.login}`,
      `ID: ${user.id}`,
      `Bio: ${bio}`,
      `Followers: ${user.followers?.toLocaleString() ?? "N/A"}`,
      lastUpdated ? `Last updated: ${lastUpdated} ago` : null,
      created ? `Created: ${created} ago` : null,
    ].filter(Boolean);

    if (user.banned) {
      let banStatus = `@${user.login} is `;
      if (user.banReason === "TOS_TEMPORARY" || user.banDuration) {
        banStatus += `temporarily banned`;
        if (user.banDuration) {
          banStatus += ` for ${user.banDuration}`;
        }
        banStatus += `. elisDespair`;
      } else {
        banStatus += "indefinitely banned. elisDespair";
      }
      messageParts.unshift(banStatus);
    }

    const message = messageParts.join(" ● ");
    return client.say(msg.channelName, message);

  } catch (error) {
    console.error("An error occurred:", error);
    return client.say(msg.channelName, "An unexpected error occurred. Please try again later.");
  }
}

async function createPyramid(msg, args) {
  if (args.length < 2) {
    return client.say(msg.channelName, "Usage: &pyr <height> <message>");
  }

  const height = Number.parseInt(args[0]);
  const message = args.slice(1).join(" ");

  if (isNaN(height) || height < 1 || height > 35) {
    return client.say(msg.channelName, "Please provide a valid height between 1 and 35.");
  }

  const lines = [];

  // Create the pyramid lines
  for (let i = 1; i <= height; i++) {
    lines.push((message + " ").repeat(i).trim());
  }
  for (let i = height - 1; i > 0; i--) {
    lines.push((message + " ").repeat(i).trim());
  }

  // Send all lines at once
  await Promise.all(lines.map(line => client.say(msg.channelName, line)));
}

async function sendCat(msg) {
  try {
    const response = await fetch("https://api.thecatapi.com/v1/images/search")
    const data = await response.json()

    if (data && data.length > 0) {
      const catImageUrl = data[0].url
      client.say(msg.channelName, catImageUrl)
    } else {
      client.say(msg.channelName, "Sorry, I couldn't find a cat image.")
    }
  } catch (error) {
    console.error("Error fetching cat image:", error)
    client.say(msg.channelName, "An error occurred while fetching a cat image.")
  }
}
async function sendDog(msg) {
  try {
    // Fetch a random dog image from the Dog API
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    
    // Check if the response is okay
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return client.say(msg.channelName, "Error fetching dog picture. Please try again later.");
    }
    
    const data = await response.json();
    
    // Check if the message contains the image URL
    if (data && data.message) {
      client.say(msg.channelName, data.message); // Send the dog image URL to the channel
    } else {
      client.say(msg.channelName, "No dog picture found.");
    }
  } catch (error) {
    console.error("Error fetching dog picture:", error);
    client.say(msg.channelName, "An error occurred while fetching the dog picture.");
  }
}

async function calculateMath(msg, args) {
  const expression = args.join(" ")
  try {
    const result = eval(expression)
    client.say(msg.channelName, `Result: ${result}`)
  } catch (error) {
    client.say(msg.channelName, "Invalid mathematical expression.")
  }
}
function setLurk(msg) {
  client.say(msg.channelName, `${msg.displayName} is now lurking. 👀`)
}
async function shoutOut(msg, args) {
  if (args.length < 1) {
    return client.say(msg.channelName, "Usage: &shoutout <username>");
  }
  
  const username = args[0];
  const twitchLink = `https://twitch.tv/${username}`;

  try {
    // Replace 'YOUR_TWITCH_API_TOKEN' with your actual Twitch API token
    const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        'Authorization': `Bearer n4v84mvuf3mfb94cmrcn6519tephaq`,
        'Client-ID': 'gp762nuuoqcoxypju8c569th9wz7q5' // Replace with your Twitch Client ID
      }
    });
    const userData = await response.json();

    if (userData.data.length === 0) {
      return client.say(msg.channelName, `User ${username} not found.`);
    }

    const userId = userData.data[0].id;

    // Fetch the last game the user was playing
    const streamsResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer n4v84mvuf3mfb94cmrcn6519tephaq`,
        'Client-ID': 'gp762nuuoqcoxypju8c569th9wz7q5'
      }
    });
    const streamsData = await streamsResponse.json();

    if (streamsData.data.length > 0) {
      const gameName = streamsData.data[0].game_name;
      client.say(msg.channelName, `🗣️ Shoutout to @${username}! They were last seen playing ${gameName}. Check them out at ${twitchLink}.`);
    } else {
      client.say(msg.channelName, `🗣️ Shoutout to @${username}!  They are currently offline. Check them out at ${twitchLink}.`);
    }
  } catch (error) {
    console.error(error);
    client.say(msg.channelName, "An error occurred while fetching user data.");
  }
}

function pingPong(msg) {
  const uptimeMilliseconds = Date.now() - startTime;

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(uptimeMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeMilliseconds / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((uptimeMilliseconds / (1000 * 60)) % 60);
  const seconds = Math.floor((uptimeMilliseconds / 1000) % 60);

  // Memory usage
  const memoryUsage = process.memoryUsage();
  const usedMemory = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2); // Convert to MB

  // CPU usage
  const cpuStart = process.cpuUsage();
  setTimeout(() => {
    const cpuEnd = process.cpuUsage(cpuStart);
    const cpuUsagePercent = ((cpuEnd.user + cpuEnd.system) / 1000 / os.cpus().length) * 100; // Convert to percentage

    // Current server time without seconds
    const serverTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Simulated ping response time
    const pingResponseTime = Math.floor(Math.random() * 100); // Random response time in ms

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    client.say(
      msg.channelName,
      `FeelsDankMan Ping: ${pingResponseTime} ms • Uptime: ${uptimeString} • Usage: ${usedMemory} MB • CPU: ${cpuUsagePercent.toFixed(2)}% • Commands: 29 • Channels: 46 • Server Time: ${serverTime} • Version: 22.14.0`,
    );
  }, 100); // 100 ms delay to measure CPU usage
}

async function generateVanity(msg, args) {
  const username = args.length === 1 ? args[0] : msg.senderUsername
  const vanityLink = `https://vanity.zonian.dev/?u=${username}`
  client.say(msg.channelName, `${username}'s vanity: ${vanityLink}`)
}
async function getUserLogs(msg, args) {
  const username = args.length > 0 ? args[0] : msg.senderUsername
  const channel = args.length > 1 ? args[1] : msg.channelName
  const logsLink = `https://tv.supa.sh/logs?channel=${channel}&username=${username}`

  client.say(msg.channelName, `📜 logs for ${username} in channel ${channel}: ${logsLink}`)
}

function sayGoodnight(msg) {
  client.say(msg.channelName, `gn, ${msg.displayName} fsmSleep`)
}
async function tellJoke(msg) {
  try {
    const response = await fetch("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "application/json",
      },
    })
    const data = await response.json()
    client.say(msg.channelName, `Here's a joke for you: ${data.joke}`)
  } catch (error) {
    console.error("Error fetching joke:", error)
    client.say(msg.channelName, "Sorry, I couldn't think of a joke right now.")
  }
}

function setReminder(msg, args) {
  if (args.length < 2) {
    return client.say(msg.channelName, "Usage: &remind <user (optional)> <time> <message>");
  }

  // Check if the first argument is a user mention
  let targetUser = msg.displayName; // Default to the sender's display name
  if (args[0].startsWith("@")) {
    targetUser = args.shift().replace("@", ""); // Remove '@' and set as target user
  }

  const time = args[0]; // The first argument is now the time
  const message = args.slice(1).join(" "); // Join the rest as the message

  // Parse the time
  const ms = parseTime(time);

  if (isNaN(ms)) {
    return client.say(
      msg.channelName,
      "Invalid time format. Please use a number followed by s, m, or h (e.g., 30s, 5m, 1h)",
    );
  }

  setTimeout(() => {
    client.say(msg.channelName, `@${targetUser}, fsmDinkDonk your reminder: ${message}`);
  }, ms);

  client.say(msg.channelName, `Okay I'll remind ${targetUser} about "${message}" in ${time}`);
}

function parseTime(time) {
  const unit = time.slice(-1).toLowerCase()
  const value = Number.parseInt(time.slice(0, -1))
  
  switch (unit) {
    case "s":
      return value * 1000
    case "m":
      return value * 60 * 1000
    case "h":
      return value * 60 * 60 * 1000
    default:
      return Number.NaN
  }
}
function coinFlip(msg) {
  const result = Math.random() < 0.5 ? "heads" : "tails";
  client.say(msg.channelName, `${msg.displayName} it's ${result}!`);
}
function flipText(msg, args) {
  if (args.length < 1) {
    return client.say(msg.channelName, "Usage: &flip <text>");
  }

  const text = args.join(" ");
  const flippedText = text.split("").reverse().map(char => {
    const upsideDownChars = {
      'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ',
      'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ',
      'k': 'ʞ', 'l': 'ʃ', 'm': 'ɯ', 'n': 'u', 'o': 'o',
      'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
      'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ',
      'z': 'z', 'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D',
      'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H', 'I': 'I',
      'J': '⅃', 'K': 'K', 'L': '⅃', 'M': 'W', 'N': 'N',
      'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'Я', 'S': 'S',
      'T': '┴', 'U': '∩', 'V': '∨', 'W': 'M', 'X': 'X',
      'Y': '⅄', 'Z': 'Z', ' ': ' ',
    };
    return upsideDownChars[char] || char;
  }).join("");

  client.say(msg.channelName, flippedText);
}
function reverseName(msg, args) {
  if (args.length < 1) {
      return client.say(msg.channelName, "Usage: &reverse <name>");
  }

  const name = args.join(" ");
  const reversedName = name.split('').reverse().join('');
  client.say(msg.channelName, `${reversedName}`);
}
async function setTimer(msg, args) {
  if (args.length < 2) {
    return client.say(msg.channelName, "Usage: &timer <time> <message>");
  }

  const time = args[0];
  const message = args.slice(1).join(" ");

  const ms = parseTime(time);

  if (isNaN(ms)) {
    return client.say(msg.channelName, "Invalid time format. Please use a number followed by s, m, or h (e.g., 30s, 5m, 1h)");
  }

  setTimeout(() => {
    client.say(msg.channelName, `⏰ ${msg.displayName}, your timer is up! Message: "${message}"`);
  }, ms);

  client.say(msg.channelName, `⏳ Timer set for ${time}. I'll remind you to "${message}" when it's up!`);
}
async function createPoll(msg, args) {
  if (args.length < 2) {
    return client.say(msg.channelName, "Usage: &poll <question> <option1> <option2> [option3 ...]");
  }

  const question = args[0];
  const options = args.slice(1);

  if (options.length < 2) {
    return client.say(msg.channelName, "You need at least 2 options for a poll.");
  }

  const pollMessage = `📊 Poll: ${question}\nOptions:\n` + options.map((opt, index) => `${index + 1}. ${opt}`).join("\n");
  client.say(msg.channelName, pollMessage);

  // Optional: You can add logic to collect votes here, e.g., using a message collector.

  // Send a confirmation message
  client.say(msg.channelName, "Poll created! Please vote by replying with the option number.");
}
function changePrefix(msg, args) {
  const allowedUserId = '204648779'; // Allowed user ID

  // Check if the command is being invoked by the allowed user
  if (msg.ircTags['user-id'] !== allowedUserId) {
    return client.say(msg.channelName, "You do not have permission to use this command.");
  }

  if (args.length !== 1) {
    return client.say(msg.channelName, "Please provide a single character as the new prefix.");
  }

  const newPrefix = args[0];
  if (newPrefix.length !== 1) {
    return client.say(msg.channelName, "The new prefix must be a single character.");
  }

  commands.prefix = newPrefix;
  fs.writeFileSync("./commands.json", JSON.stringify(commands, null, 2));
  client.say(msg.channelName, `Prefix updated to: ${newPrefix}`);
}
function showCurrentPrefix(msg) {
  client.say(msg.channelName, `my current prefix is: ${commands.prefix}`)
}
async function getUptime(msg) {
  const uptimeMilliseconds = Date.now() - startTime;
  
  const seconds = Math.floor((uptimeMilliseconds / 1000) % 60);
  const minutes = Math.floor((uptimeMilliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((uptimeMilliseconds / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptimeMilliseconds / (1000 * 60 * 60 * 24));
  
  const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  client.say(msg.channelName, `I have been running for ${uptimeString}.`);
}
function showHelp(msg, args) {
  let message = '';

  if (args.length > 0) {
    const commandName = args[0].toLowerCase();
    const command = commands.commands.find(
      (cmd) => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName))
    );

    if (command) {
      message = `${commands.prefix}${command.name} - ${command.description}\nUsage: ${command.usage || "No usage info available."}`;
    } else {
      message = "Command not found.";
    }
  } else {
    const commandList = commands.commands.map((cmd) => `${commands.prefix}${cmd.name}`).join(", ");
    message = `Available commands: ${commandList}`;
  }

  // Trim newlines and carriage returns from the message
  message = message.replace(/[\n\r]+/g, ' '); // Replace newlines with a space

  client.say(msg.channelName, message);
}
async function addChannelToWhitelist(msg, args) {
  const allowedUserId = '204648779'; // Allowed user ID

  // Check if the command is being invoked by the allowed user
  if (msg.ircTags['user-id'] !== allowedUserId) {
    return client.say(msg.channelName, "You do not have permission to use this command.");
  }

  if (args.length === 0) {
    return client.say(msg.channelName, "Please specify a channel to add to the whitelist.");
  }

  const channelToAdd = args[0].toLowerCase();
  
  if (config.whitelist_channels.includes(channelToAdd)) {
    return client.say(msg.channelName, `${channelToAdd} is already on the whitelist.`);
  }

  config.whitelist_channels.push(channelToAdd);

  // Save updated config
  fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

  client.say(msg.channelName, `${channelToAdd} has been added to the whitelist.`);
}
async function removeChannelFromWhitelist(msg, args) {
  const allowedUserId = '204648779'; // Allowed user ID

  // Check if the command is being invoked by the allowed user
  if (msg.ircTags['user-id'] !== allowedUserId) {
    return client.say(msg.channelName, "You do not have permission to use this command.");
  }

  if (args.length < 1) {
    return client.say(msg.channelName, "Usage: &removewhitelist <channel>");
  }

  const channelToRemove = args[0].toLowerCase();

  // Check if the channel is already in the whitelist
  if (!config.whitelist_channels.includes(channelToRemove)) {
    return client.say(msg.channelName, `${channelToRemove} is not in the whitelist.`);
  }

  // Remove the channel from the whitelist
  config.whitelist_channels = config.whitelist_channels.filter(channel => channel !== channelToRemove);

  // Save the updated whitelist back to the config file
  fs.writeFileSync("./config.json", JSON.stringify(config, null, 2), "utf8");

  return client.say(msg.channelName, `${channelToRemove} has been removed from the whitelist.`);
}
async function addBotToChannel(msg, args) {
  const allowedUserId = '204648779'; // Allowed user ID

  // Log the msg object to check its structure
  console.log(msg);

  // Check if the command is being invoked by the allowed user
  if (msg.ircTags['user-id'] !== allowedUserId) {
    return client.say(msg.channelName, "You do not have permission to use this command.");
  }

  if (args.length === 0) {
    return client.say(msg.channelName, "Please provide a channel name to join.");
  }

  const channelToJoin = args[0].toLowerCase();

  // Check if the channel is already in the channels array
  if (config.channels.includes(channelToJoin)) {
    return client.say(msg.channelName, `${channelToJoin} is already in the channels list.`);
  }

  try {
    await client.join(channelToJoin); // Assuming there's a join method
    config.channels.push(channelToJoin);

    // Save updated config
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

    client.say(msg.channelName, `Successfully joined ${channelToJoin}`);
  } catch (error) {
    console.error(`Failed to join ${channelToJoin}:`, error);
    client.say(msg.channelName, `Could not join ${channelToJoin}. Please check the channel name or permissions.`);
  }
}
async function removeBotFromChannel(msg, args) {
  const allowedUserId = '204648779'; // Allowed user ID

  // Check if the command is being invoked by the allowed user
  if (msg.ircTags['user-id'] !== allowedUserId) {
    return client.say(msg.channelName, "You do not have permission to use this command.");
  }

  if (args.length === 0) {
    return client.say(msg.channelName, "Please specify a channel to part from.");
  }
  const channel = args[0].toLowerCase();

  // Check if the channel is in the channels array
  if (!config.channels.includes(channel)) {
    return client.say(msg.channelName, `Channel ${channel} is not in the list.`);
  }
  // Logic to part the bot from the specified channel
  try {
    await client.part(channel); // Assuming a method to part from channel
    client.say(msg.channelName, `Successfully parted from ${channel}.`);

    // Update the config
    config.channels = config.channels.filter(ch => ch !== channel);

    // Write the updated config back to the file
    fs.writeFileSync(path.resolve("./config.json"), JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Error parting from channel:", error);
    client.say(msg.channelName, `An error occurred while trying to part from ${channel}.`);
  }
}
function rollDice(msg) {
  const rollResult = Math.floor(Math.random() * 100) + 1; // Generate a number between 1 and 100
  client.say(msg.channelName, `🎲 You rolled a ${rollResult}!`); // Send the result back to the channel
}
function setAfkStatus(msg, args) {
  const message = args.join(" ") || "AFK"; // Default message if none provided
  afkUsers.set(msg.senderUsername, { startTime: Date.now(), message });
  client.say(msg.channelName, `${msg.senderUsername} is now afk: "${message}"`);
}
// Basic loop for farming chatbots
setInterval(
  () => {
    client.say("<farming_channel>", "<farming_message>")
  },
  24 * 60 * 60 * 1000,
)