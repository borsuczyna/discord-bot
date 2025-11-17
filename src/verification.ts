import { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, ButtonInteraction, GuildMember } from 'discord.js';

interface Config {
  verification: {
    channelId: string;
    roleId: string;
    embedTitle: string;
    embedDescription: string;
    embedColor: string;
    buttonLabel: string;
  };
}

export async function setupVerification(client: Client, config: Config) {
  try {
    const channel = await client.channels.fetch(config.verification.channelId) as TextChannel;
    if (!channel || !channel.isTextBased()) {
      console.error('Nie można znaleźć kanału weryfikacji');
      return;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(config.verification.embedTitle)
      .setDescription(config.verification.embedDescription)
      .setColor(config.verification.embedColor as any);

    // Create button
    const button = new ButtonBuilder()
      .setCustomId('verify')
      .setLabel(config.verification.buttonLabel)
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(button);

    // Send or update message
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find(msg => msg.author.id === client.user?.id && msg.embeds.length > 0);

    if (botMessage) {
      await botMessage.edit({ embeds: [embed], components: [row] });
      console.log('Wiadomość weryfikacyjna zaktualizowana');
    } else {
      await channel.send({ embeds: [embed], components: [row] });
      console.log('Wiadomość weryfikacyjna wysłana');
    }
  } catch (error) {
    console.error('Błąd podczas konfiguracji weryfikacji:', error);
  }
}

export async function handleVerificationButton(interaction: ButtonInteraction, config: Config) {
  try {
    const member = interaction.member as GuildMember;
    if (!member) {
      await interaction.reply({ content: 'Błąd: nie można znaleźć członka serwera.', ephemeral: true });
      return;
    }

    // Check if user already has the role
    if (member.roles.cache.has(config.verification.roleId)) {
      await interaction.reply({ content: 'Jesteś już zweryfikowany!', ephemeral: true });
      return;
    }

    // Add role
    await member.roles.add(config.verification.roleId);
    await interaction.reply({ content: '✅ Zostałeś pomyślnie zweryfikowany!', ephemeral: true });
  } catch (error) {
    console.error('Błąd podczas weryfikacji:', error);
    await interaction.reply({ content: 'Wystąpił błąd podczas weryfikacji. Spróbuj ponownie później.', ephemeral: true });
  }
}
