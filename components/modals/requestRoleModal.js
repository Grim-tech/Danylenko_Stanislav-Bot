const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const cfg = require('../../cfg.js');
const config = require('../../config.json');

module.exports = {
    customId: 'requestRoleModal',
    async execute(interaction) {
        const nickname = interaction.fields.getTextInputValue('nickname');
        const rank = interaction.fields.getTextInputValue('rank');

        const nicknamePattern = /^[A-Za-z]+_[A-Za-z]+$/;
        if (!nicknamePattern.test(nickname)) {
            await interaction.reply({ content: 'Никнейм должен быть в формате Nick_Name, где Nick и Name содержат только буквы.', ephemeral: true });
            return;
        }

        const rankNumber = parseInt(rank, 10);
        if (isNaN(rankNumber) || rankNumber < 1 || rankNumber > 8) {
            await interaction.reply({ content: 'Ранг должен быть числом от 1 до 8.', ephemeral: true });
            return;
        }

        const channel = await interaction.client.channels.fetch(cfg.sendZayvkaChannel);
        if (!channel) {
            console.error('Канал для уведомлений не найден');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Raspberries Family | Запрос роли в семье.')
            .setDescription(`> Заявка от пользователя <@${interaction.user.id}>.`)
            .addFields(
                { name: 'Никнейм', value: nickname, inline: true },
                { name: 'Ранг', value: rank, inline: true }
            )
            .setTimestamp()
            .setThumbnail(interaction.user.avatarURL({ size: 4096, dynamic: true }))
            .setAuthor({ name: "Raspberries Family | Запрос роли в семье", iconURL: interaction.user.avatarURL({ size: 4096, dynamic: true }) });

        const newButton = new ButtonBuilder()
            .setCustomId('subscribe')
            .setLabel('Выдать роль')
            .setStyle(ButtonStyle.Success);

        const newButton1 = new ButtonBuilder()
            .setCustomId('unsubscribe')
            .setLabel('Отменить роль')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(newButton, newButton1);

        const msg = await channel.send({ embeds: [embed], components: [row] });

        const user = await interaction.client.users.fetch(interaction.user.id);

        const collector = channel.createMessageComponentCollector({ 
            filter: i => ['subscribe', 'unsubscribe'].includes(i.customId)
        });

        collector.on('collect', async (i) => {
            await i.deferReply({ ephemeral: true });

            if (!i.member.roles.cache.has(cfg.Модер) && i.user.id !== config.developer) {
                await i.followUp({ content: 'У вас нет прав для выполнения этого действия.', ephemeral: true });
                return;
            }

            if (i.customId === 'subscribe') {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('roleSelect')
                    .setPlaceholder('Выберите роль')
                    .addOptions([
                        { label: 'Малинка', value: cfg.Малинка },
                        { label: 'Новичек', value: cfg.Новичек },
                        { label: 'Инициатор', value: cfg.Инициатор },
                        { label: 'Малиновый Агент', value: cfg.МалиновыйАгент },
                        { label: 'Мастер', value: cfg.Мастер },
                        { label: 'Сборщик', value: cfg.Сборщик },
                        { label: 'Каптёр', value: cfg.Каптёр },
                        { label: 'Неразборчивый', value: cfg.Неразборчивый }
                    ]);

                const selectRow = new ActionRowBuilder().addComponents(selectMenu);

                await i.followUp({ content: 'Выберите роль из списка:', components: [selectRow], ephemeral: true });

                const selectCollector = i.channel.createMessageComponentCollector({ 
                    filter: selectInteraction => selectInteraction.customId === 'roleSelect' && selectInteraction.user.id === i.user.id,
                    time: 60000
                });

                selectCollector.on('collect', async selectInteraction => {
                    const selectedRole = selectInteraction.values[0];
                    
                    const roleIds = [
                        cfg.Малинка, cfg.Новичек, cfg.Инициатор, cfg.МалиновыйАгент,
                        cfg.Мастер, cfg.Сборщик, cfg.Каптёр, cfg.Неразборчивый
                    ];
                    
                    if (roleIds.some(roleId => interaction.member.roles.cache.has(roleId))) {
                        await selectInteraction.update({ content: 'У вас уже есть одна из этих ролей.', components: [] });
                        return;
                    }

                    try {
                        await interaction.member.roles.add(selectedRole);

                        // Проверка, отличается ли новый никнейм от текущего
                        if (interaction.member.nickname !== nickname) {
                            await interaction.member.setNickname(nickname);
                        }

                        await selectInteraction.update({ content: `Роль была успешно выдана и никнейм обновлен!`, components: [] });

                        const newEmbed = new EmbedBuilder()
                            .setDescription(`> Пользователю <@${user.id}> была выдана роль <@&${selectedRole}> и установлен никнейм ${nickname}.\n Была выдана пользователем <@${i.user.id}>`)
                            .setTimestamp()
                            .setThumbnail(interaction.user.avatarURL({ size: 4096, dynamic: true }))
                            .setAuthor({ name: "Raspberries Family | Запрос роли в семье", iconURL: interaction.user.avatarURL({ size: 4096, dynamic: true }) });

                        await msg.edit({ embeds: [newEmbed], components: [] });

                        selectCollector.stop();
                    } catch (error) {
                        console.error('Ошибка при добавлении роли:', error);
                        await selectInteraction.update({ content: 'Произошла ошибка при добавлении роли.', components: [] });
                    }
                });

                selectCollector.on('end', collected => {
                    if (collected.size === 0) {
                        i.followUp({ content: 'Время выбора роли истекло.', ephemeral: true });
                    }
                });
            } else if (i.customId === 'unsubscribe') {
                await i.followUp({ content: 'Роль была не выдана!', ephemeral: true });
                const newEmbed = new EmbedBuilder()
                    .setDescription(`> Пользователю <@${user.id}> отклонили запрос на роль.\n Отклонил пользователь <@${i.user.id}>`)
                    .setTimestamp()
                    .setThumbnail(interaction.user.avatarURL({ size: 4096, dynamic: true }))
                    .setAuthor({ name: "Raspberries Family | Запрос роли в семье", iconURL: interaction.user.avatarURL({ size: 4096, dynamic: true }) });

                await msg.edit({ embeds: [newEmbed], components: [] });
            }
        });

        await interaction.reply({ content: 'Ваш запрос был отправлен!', ephemeral: true });
    }
};