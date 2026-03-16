import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { DISCORD_TOKEN, CLIENT_ID, PORT = 3000 } = process.env;

// --- Express Server ---
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`Game server running on port ${PORT}`));

// --- Discord Bot ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
  .setName('flappy')
  .setDescription('Launch Flappy Bird!');

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [command.toJSON()] });
  console.log('Slash command registered.');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'flappy') return;

  const gameUrl = process.env.GAME_URL || `http://localhost:${PORT}`;

  const embed = new EmbedBuilder()
    .setTitle('\u{1F426} Flappy Bird')
    .setDescription('Tap to flap. Dodge the pipes. Beat your high score!')
    .setColor(0x4EC0CA)
    .setFooter({ text: 'Good luck!' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Play Flappy Bird')
      .setStyle(ButtonStyle.Link)
      .setURL(gameUrl)
      .setEmoji('\u{1F3AE}')
  );

  await interaction.reply({ embeds: [embed], components: [row] });
});

client.login(DISCORD_TOKEN);
