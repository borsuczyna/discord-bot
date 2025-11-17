import { Client, GatewayIntentBits, Partials } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { setupVerification } from './verification';
import { setupTickets } from './tickets';

interface Config {
  token: string;
  verification: {
    channelId: string;
    roleId: string;
    embedTitle: string;
    embedDescription: string;
    embedColor: string;
    buttonLabel: string;
  };
  tickets: {
    categoryId: string;
    createChannelId: string;
    staffRoleIds: string[];
    embedTitle: string;
    embedDescription: string;
    embedColor: string;
    buttonLabel: string;
    acceptButtonLabel: string;
  };
}

// Load configuration
const configPath = path.join(__dirname, '..', 'config.json');
const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once('ready', async () => {
  console.log(`Bot zalogowany jako ${client.user?.tag}`);
  
  // Setup verification system
  await setupVerification(client, config);
  
  // Setup ticket system
  await setupTickets(client, config);
  
  console.log('System weryfikacji i ticketów został zainicjalizowany!');
});

// Handle interactions (buttons)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const { handleVerificationButton } = await import('./verification');
  const { handleTicketButton, handleAcceptButton } = await import('./tickets');

  if (interaction.customId === 'verify') {
    await handleVerificationButton(interaction, config);
  } else if (interaction.customId === 'create_ticket') {
    await handleTicketButton(interaction, config);
  } else if (interaction.customId.startsWith('accept_ticket_')) {
    await handleAcceptButton(interaction, config);
  }
});

// Login to Discord
client.login(config.token).catch(error => {
  console.error('Błąd logowania:', error);
  process.exit(1);
});
