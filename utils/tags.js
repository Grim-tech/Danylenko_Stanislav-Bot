const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const cfg = require("../cfg.js");
const config = require("../config.json");

const handleZayvka = async (message, client) => {
    const guild = client.guilds.cache.get(config.guildID);
    const embed = new EmbedBuilder()
        .setTitle("Raspberries Family | Запрос роли в семье.")
        .setDescription(`> Если вы находитесь в семье, вам нужно сделать следующее:\n *Нажмите на соответсвующую кнопку запроса роли. *Заполните в окне данные в виде никнейма и вашего ранга. *Ожидайте одобрение вашего запроса со стороны Лидера или Заместителя.`)
        .setTimestamp()
        .setThumbnail(guild.iconURL({ size: 4096, dynamic: true }))
        .setAuthor({ name: "Raspberries Family | Запрос роли в семье", iconURL: guild.iconURL({ size: 4096, dynamic: true }) });

    const subscribeButton = new ButtonBuilder()
        .setCustomId('subscribe')
        .setLabel('Запросить роль')
        .setStyle(ButtonStyle.Success);

    const unsubscribeButton = new ButtonBuilder()
        .setCustomId('unsubscribe')
        .setLabel('Снять роль')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(subscribeButton, unsubscribeButton);

    const channel = await client.channels.fetch(cfg.zayvkaChannel);
    if (!channel) {
        console.error('Канал для уведомлений не найден');
        return;
    }

    try {
        let fetched;
        do {
            fetched = await channel.messages.fetch({ limit: 100 });
            await channel.bulkDelete(fetched);
        } while (fetched.size >= 2);
    } catch (error) {
        console.error('Ошибка при очистке канала:', error);
    }

    const reply = await channel.send({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({ 
        filter: i => ['subscribe', 'unsubscribe'].includes(i.customId)
    });

    collector.on('collect', async i => {
        if (i.customId === 'subscribe') {
            // Проверка, не находится ли пользователь уже в процессе запроса
            if (i.member.pending) {
                await i.reply({ content: 'Вы уже находитесь в процессе запроса роли.', ephemeral: true });
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId('requestRoleModal')
                .setTitle('Запрос роли')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('nickname')
                            .setLabel('Ваш никнейм')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('rank')
                            .setLabel('Ваш ранг (например, 1, 2, 3, 4, 5, 6, 7, 8)')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

            await i.showModal(modal);
        } else if (i.customId === 'unsubscribe') {
            try {
                const rolesToRemove = [
                    cfg.Малинка, cfg.Новичек, cfg.Инициатор, cfg.МалиновыйАгент,
                    cfg.Мастер, cfg.Сборщик, cfg.Каптёр, cfg.Неразборчивый
                ];

                const rolesUserHas = rolesToRemove.filter(roleId => i.member.roles.cache.has(roleId));

                if (rolesUserHas.length > 0) {
                    await i.member.roles.remove(rolesUserHas);
                    try {
                        await i.member.setNickname(null); // Сбрасываем никнейм
                    } catch (error) {
                        console.error('Ошибка при сбросе никнейма:', error);
                    }
                    await i.reply({ content: 'Роли и никнейм были успешно сняты.', ephemeral: true });
                } else {
                    await i.reply({ content: 'У вас нет ролей для снятия.', ephemeral: true });
                }
            } catch (error) {
                console.error('Ошибка при отписке:', error);
                await i.reply({ content: 'Произошла ошибка при отписке. Пожалуйста, попробуйте позже.', ephemeral: true });
            }
        }
    });
}

module.exports = {
    handleZayvka
}