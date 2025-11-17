import { 
  Client, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  TextChannel, 
  ButtonInteraction,
  ChannelType,
  PermissionFlagsBits,
  GuildMember
} from 'discord.js';

interface Config {
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

export async function setupTickets(client: Client, config: Config) {
  try {
    const channel = await client.channels.fetch(config.tickets.createChannelId) as TextChannel;
    if (!channel || !channel.isTextBased()) {
      console.error('Nie można znaleźć kanału tworzenia ticketów');
      return;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(config.tickets.embedTitle)
      .setDescription(config.tickets.embedDescription)
      .setColor(config.tickets.embedColor as any);

    // Create button
    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel(config.tickets.buttonLabel)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(button);

    // Send or update message
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find(msg => msg.author.id === client.user?.id && msg.embeds.length > 0);

    if (botMessage) {
      await botMessage.edit({ embeds: [embed], components: [row] });
      console.log('Wiadomość ticketowa zaktualizowana');
    } else {
      await channel.send({ embeds: [embed], components: [row] });
      console.log('Wiadomość ticketowa wysłana');
    }
  } catch (error) {
    console.error('Błąd podczas konfiguracji ticketów:', error);
  }
}

export async function handleTicketButton(interaction: ButtonInteraction, config: Config) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('Błąd: nie można znaleźć serwera.');
      return;
    }

    const member = interaction.member as GuildMember;
    if (!member) {
      await interaction.editReply('Błąd: nie można znaleźć członka serwera.');
      return;
    }

    // Check if user already has an open ticket
    const existingTicket = guild.channels.cache.find(
      ch => ch.name === `ticket-${member.user.username.toLowerCase()}` && ch.parentId === config.tickets.categoryId
    );

    if (existingTicket) {
      await interaction.editReply(`Masz już otwarty ticket: <#${existingTicket.id}>`);
      return;
    }

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${member.user.username}`,
      type: ChannelType.GuildText,
      parent: config.tickets.categoryId,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: member.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        ...config.tickets.staffRoleIds.map(roleId => ({
          id: roleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        })),
      ],
    });

    // Create ticket embed with accept button
    const ticketEmbed = new EmbedBuilder()
      .setTitle('Nowy Ticket')
      .setDescription(`Ticket utworzony przez ${member.user.tag}\n\nOczekiwanie na członka zespołu...`)
      .setColor('#0099ff')
      .setTimestamp();

    const acceptButton = new ButtonBuilder()
      .setCustomId(`accept_ticket_${member.id}`)
      .setLabel(config.tickets.acceptButtonLabel)
      .setStyle(ButtonStyle.Success);

    const ticketRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(acceptButton);

    await ticketChannel.send({ 
      content: `${member} | Personel: ${config.tickets.staffRoleIds.map(id => `<@&${id}>`).join(', ')}`,
      embeds: [ticketEmbed], 
      components: [ticketRow] 
    });

    await interaction.editReply(`✅ Ticket został utworzony: <#${ticketChannel.id}>`);
  } catch (error) {
    console.error('Błąd podczas tworzenia ticketu:', error);
    await interaction.editReply('Wystąpił błąd podczas tworzenia ticketu. Spróbuj ponownie później.');
  }
}

export async function handleAcceptButton(interaction: ButtonInteraction, config: Config) {
  try {
    const member = interaction.member as GuildMember;
    if (!member) {
      await interaction.reply({ content: 'Błąd: nie można znaleźć członka serwera.', ephemeral: true });
      return;
    }

    // Check if user has staff role
    const hasStaffRole = config.tickets.staffRoleIds.some(roleId => member.roles.cache.has(roleId));
    if (!hasStaffRole) {
      await interaction.reply({ content: 'Nie masz uprawnień do przyjmowania ticketów!', ephemeral: true });
      return;
    }

    // Get the ticket creator ID from button custom ID
    const creatorId = interaction.customId.replace('accept_ticket_', '');

    // Update the embed
    const message = interaction.message;
    if (message.embeds.length > 0) {
      const embed = EmbedBuilder.from(message.embeds[0])
        .setDescription(`Ticket utworzony przez <@${creatorId}>\n\n✅ Przyjęty przez ${member.user.tag}`)
        .setColor('#00ff00');

      await message.edit({ embeds: [embed], components: [] });
    }

    await interaction.reply({ content: `✅ Ticket został przyjęty przez ${member.user.tag}!` });
  } catch (error) {
    console.error('Błąd podczas przyjmowania ticketu:', error);
    await interaction.reply({ content: 'Wystąpił błąd podczas przyjmowania ticketu.', ephemeral: true });
  }
}
